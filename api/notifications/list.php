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

$userId = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT * FROM notifications WHERE utilisateur_id = ? ORDER BY created_at DESC LIMIT 50");
$stmt->bind_param("i", $userId);
$stmt->execute();
$notifications = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// Compter les non lues
$count = $conn->prepare("SELECT COUNT(*) as nb FROM notifications WHERE utilisateur_id = ? AND lu = 0");
$count->bind_param("i", $userId);
$count->execute();
$nonLues = $count->get_result()->fetch_assoc()['nb'];
$count->close();

echo json_encode(['notifications' => $notifications, 'non_lues' => (int)$nonLues]);
?>
