<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

session_start();
require_once __DIR__ . '/../config/db.php';

if (isset($_SESSION['user_id'])) {
    $query = "SELECT id, nom, prenom, email, role FROM utilisateurs WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user) {
        echo json_encode(['logged_in' => true, 'user' => $user]);
        $stmt->close();
        exit();
    }
    $stmt->close();
}

echo json_encode(['logged_in' => false]);
?>