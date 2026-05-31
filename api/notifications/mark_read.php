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
$notif_id = isset($data['id']) ? (int)$data['id'] : 0;
$userId = $_SESSION['user_id'];

if ($notif_id > 0) {
    // Marquer une seule notification comme lue
    $stmt = $conn->prepare("UPDATE notifications SET lu = 1 WHERE id = ? AND utilisateur_id = ?");
    $stmt->bind_param("ii", $notif_id, $userId);
    $stmt->execute();
    $stmt->close();
} else {
    // Marquer toutes comme lues
    $stmt = $conn->prepare("UPDATE notifications SET lu = 1 WHERE utilisateur_id = ? AND lu = 0");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->close();
}

echo json_encode(['success' => true, 'message' => 'Notification(s) marquée(s) comme lue(s).']);
?>
