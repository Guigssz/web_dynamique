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
$reservation_id = isset($data['reservation_id']) ? (int)$data['reservation_id'] : 0;

if ($reservation_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID réservation invalide.']);
    exit;
}

$userId = $_SESSION['user_id'];

$stmt = $conn->prepare("UPDATE reservations_hebergement SET statut = 'annulee' WHERE id = ? AND utilisateur_id = ?");
$stmt->bind_param("ii", $reservation_id, $userId);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    // Notification
    $msg = "Votre réservation d'hébergement #$reservation_id a été annulée.";
    $notif = $conn->prepare("INSERT INTO notifications (utilisateur_id, message, type) VALUES (?, ?, 'annulation')");
    $notif->bind_param("is", $userId, $msg);
    $notif->execute();
    $notif->close();

    echo json_encode(['success' => true, 'message' => 'Réservation annulée.']);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Réservation introuvable ou déjà annulée.']);
}
$stmt->close();
?>
