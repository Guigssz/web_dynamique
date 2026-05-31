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

// Vérif admin
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
$targetId  = isset($data['user_id']) ? (int)$data['user_id']  : 0;
$newRole   = isset($data['role'])    ? trim($data['role'])     : '';

if ($targetId <= 0 || !in_array($newRole, ['user', 'admin'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Données invalides.']);
    exit;
}

// Ne pas se retirer ses propres droits
if ($targetId === $uid && $newRole === 'user') {
    http_response_code(400);
    echo json_encode(['error' => 'Vous ne pouvez pas retirer vos propres droits admin.']);
    exit;
}

$stmt = $conn->prepare("UPDATE utilisateurs SET role = ? WHERE id = ?");
$stmt->bind_param("si", $newRole, $targetId);

if ($stmt->execute()) {
    $action = $newRole === 'admin' ? 'promu administrateur' : 'rétrogradé utilisateur';
    echo json_encode(['success' => true, 'message' => "Utilisateur $action."]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur SQL : ' . $conn->error]);
}
$stmt->close();
?>
