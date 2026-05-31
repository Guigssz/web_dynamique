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
$hebergement_id = isset($data['hebergement_id']) ? (int)$data['hebergement_id'] : 0;
$date_debut     = isset($data['date_debut'])      ? trim($data['date_debut'])    : '';
$date_fin       = isset($data['date_fin'])         ? trim($data['date_fin'])      : '';

if ($hebergement_id <= 0 || empty($date_debut) || empty($date_fin)) {
    http_response_code(400);
    echo json_encode(['error' => 'Données incomplètes.']);
    exit;
}

if ($date_fin <= $date_debut) {
    http_response_code(400);
    echo json_encode(['error' => 'La date de fin doit être après la date de début.']);
    exit;
}

$userId = $_SESSION['user_id'];

$stmt = $conn->prepare("INSERT INTO reservations_hebergement (utilisateur_id, hebergement_id, date_debut, date_fin, statut) VALUES (?, ?, ?, ?, 'confirmee')");
$stmt->bind_param("iiss", $userId, $hebergement_id, $date_debut, $date_fin);

if ($stmt->execute()) {
    // Notification
    $msg = "Réservation d'hébergement confirmée du $date_debut au $date_fin.";
    $notif = $conn->prepare("INSERT INTO notifications (utilisateur_id, message, type) VALUES (?, ?, 'reservation')");
    $notif->bind_param("is", $userId, $msg);
    $notif->execute();
    $notif->close();

    echo json_encode(['success' => true, 'id' => $stmt->insert_id, 'message' => 'Réservation confirmée.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur SQL : ' . $conn->error]);
}
$stmt->close();
?>
