<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
require_once '../config/db.php';

// Vérif admin
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Non connecté.']);
    exit;
}
$uid = $_SESSION['user_id'];
$r = $conn->prepare("SELECT role FROM utilisateurs WHERE id = ?");
$r->bind_param("i", $uid);
$r->execute();
$role = $r->get_result()->fetch_assoc()['role'] ?? '';
$r->close();
if ($role !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Accès réservé aux administrateurs.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int)$data['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID invalide.']);
    exit;
}

$stmt = $conn->prepare("DELETE FROM destinations WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Destination supprimée.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur SQL : ' . $conn->error]);
}
$stmt->close();
?>
