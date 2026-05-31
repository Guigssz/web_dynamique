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
$inscription_id = isset($data['inscription_id']) ? (int)$data['inscription_id'] : 0;

if ($inscription_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inscription invalide.']);
    exit;
}

$userId = $_SESSION['user_id'];

// Récupérer l'activite_id
$get = $conn->prepare("SELECT activite_id FROM inscriptions_activite WHERE id = ? AND utilisateur_id = ? AND statut = 'inscrit'");
$get->bind_param("ii", $inscription_id, $userId);
$get->execute();
$res = $get->get_result()->fetch_assoc();
$get->close();

if (!$res) {
    http_response_code(404);
    echo json_encode(['error' => 'Inscription introuvable ou déjà annulée.']);
    exit;
}

$stmt = $conn->prepare("UPDATE inscriptions_activite SET statut = 'annule' WHERE id = ? AND utilisateur_id = ?");
$stmt->bind_param("ii", $inscription_id, $userId);

if ($stmt->execute()) {
    // Rendre la place
    $upd = $conn->prepare("UPDATE activites SET places_restantes = places_restantes + 1 WHERE id = ?");
    $upd->bind_param("i", $res['activite_id']);
    $upd->execute();
    $upd->close();

    // Notification
    $msg = "Votre inscription à l'activité a été annulée.";
    $notif = $conn->prepare("INSERT INTO notifications (utilisateur_id, message, type) VALUES (?, ?, 'annulation')");
    $notif->bind_param("is", $userId, $msg);
    $notif->execute();
    $notif->close();

    echo json_encode(['success' => true, 'message' => 'Inscription annulée, place libérée.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur SQL : ' . $conn->error]);
}
$stmt->close();
?>
