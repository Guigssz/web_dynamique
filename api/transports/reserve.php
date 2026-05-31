<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Non connecté.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$transport_id = isset($data['transport_id']) ? (int)$data['transport_id'] : 0;

if ($transport_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID transport invalide.']);
    exit;
}

$userId = $_SESSION['user_id'];

// Vérifier places restantes
$check = $conn->prepare("SELECT places_restantes FROM transports WHERE id = ?");
$check->bind_param("i", $transport_id);
$check->execute();
$transport = $check->get_result()->fetch_assoc();
$check->close();

if (!$transport) {
    http_response_code(404);
    echo json_encode(['error' => 'Transport introuvable.']);
    exit;
}
if ($transport['places_restantes'] <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Plus de places disponibles.']);
    exit;
}

// Créer la réservation
$stmt = $conn->prepare("INSERT INTO reservations_transport (utilisateur_id, transport_id, statut) VALUES (?, ?, 'confirmee')");
$stmt->bind_param("ii", $userId, $transport_id);

if ($stmt->execute()) {
    // Décrémenter les places
    $conn->prepare("UPDATE transports SET places_restantes = places_restantes - 1 WHERE id = ?")->bind_param("i", $transport_id);
    $upd = $conn->prepare("UPDATE transports SET places_restantes = places_restantes - 1 WHERE id = ?");
    $upd->bind_param("i", $transport_id);
    $upd->execute();
    $upd->close();

    // Notification
    $msg = "Réservation de transport #$transport_id confirmée.";
    $notif = $conn->prepare("INSERT INTO notifications (utilisateur_id, message, type) VALUES (?, ?, 'reservation')");
    $notif->bind_param("is", $userId, $msg);
    $notif->execute();
    $notif->close();

    echo json_encode(['success' => true, 'id' => $stmt->insert_id, 'message' => 'Réservation transport confirmée.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur SQL : ' . $conn->error]);
}
$stmt->close();
?>
