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
$activite_id = isset($data['activite_id']) ? (int)$data['activite_id'] : 0;

if ($activite_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID activité invalide.']);
    exit;
}

$userId = $_SESSION['user_id'];

// Vérifier places restantes
$check = $conn->prepare("SELECT places_restantes, nom FROM activites WHERE id = ?");
$check->bind_param("i", $activite_id);
$check->execute();
$act = $check->get_result()->fetch_assoc();
$check->close();

if (!$act) {
    http_response_code(404);
    echo json_encode(['error' => 'Activité introuvable.']);
    exit;
}
if ($act['places_restantes'] <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Activité complète, plus de places disponibles.']);
    exit;
}

// Vérifier doublon
$dup = $conn->prepare("SELECT id FROM inscriptions_activite WHERE utilisateur_id = ? AND activite_id = ? AND statut = 'inscrit'");
$dup->bind_param("ii", $userId, $activite_id);
$dup->execute();
$dup->store_result();
if ($dup->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Vous êtes déjà inscrit à cette activité.']);
    $dup->close();
    exit;
}
$dup->close();

// Inscription
$stmt = $conn->prepare("INSERT INTO inscriptions_activite (utilisateur_id, activite_id, statut) VALUES (?, ?, 'inscrit')");
$stmt->bind_param("ii", $userId, $activite_id);

if ($stmt->execute()) {
    // Décrémenter places
    $upd = $conn->prepare("UPDATE activites SET places_restantes = places_restantes - 1 WHERE id = ?");
    $upd->bind_param("i", $activite_id);
    $upd->execute();
    $upd->close();

    // Notification
    $msg = "Inscription confirmée à l'activité : " . $act['nom'];
    $notif = $conn->prepare("INSERT INTO notifications (utilisateur_id, message, type) VALUES (?, ?, 'inscription')");
    $notif->bind_param("is", $userId, $msg);
    $notif->execute();
    $notif->close();

    echo json_encode(['success' => true, 'message' => 'Inscription confirmée.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur SQL : ' . $conn->error]);
}
$stmt->close();
?>
