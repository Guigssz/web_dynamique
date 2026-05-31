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
$type       = isset($data['type'])       ? trim($data['type'])       : '';
$ref_id     = isset($data['ref_id'])     ? (int)$data['ref_id']      : 0;
$prix       = isset($data['prix'])       ? (float)$data['prix']      : 0;
$date_debut = isset($data['date_debut']) ? trim($data['date_debut']) : null;
$date_fin   = isset($data['date_fin'])   ? trim($data['date_fin'])   : null;

if (!in_array($type, ['hebergement', 'transport', 'activite', 'destination']) || $ref_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Type ou ref_id invalide.']);
    exit;
}

$userId = $_SESSION['user_id'];

$stmt = $conn->prepare("INSERT INTO panier_items (utilisateur_id, type, ref_id, prix, date_debut, date_fin) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("isidss", $userId, $type, $ref_id, $prix, $date_debut, $date_fin);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'id' => $stmt->insert_id, 'message' => 'Ajouté au panier.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur SQL : ' . $conn->error]);
}
$stmt->close();
?>
