<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

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

$result = mysqli_query($conn, "SELECT id, nom, prenom, email, role, created_at FROM utilisateurs ORDER BY id ASC");
$users = mysqli_fetch_all($result, MYSQLI_ASSOC);

echo json_encode($users);
?>
