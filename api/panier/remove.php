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
$item_id = isset($data['item_id']) ? (int)$data['item_id'] : 0;

if ($item_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID article invalide.']);
    exit;
}

$userId = $_SESSION['user_id'];

$stmt = $conn->prepare("DELETE FROM panier_items WHERE id = ? AND utilisateur_id = ?");
$stmt->bind_param("ii", $item_id, $userId);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(['success' => true, 'message' => 'Article retiré du panier.']);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Article introuvable dans votre panier.']);
}
$stmt->close();
?>
