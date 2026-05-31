<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

session_start();
require_once __DIR__ . '/../config/db.php';

if (isset($_SESSION['user_id'])) {
    $query = "SELECT id_utilisateur, nom, email, role FROM utilisateurs WHERE id_utilisateur = :id";
    $stmt = $pdo->prepare($query);
    $stmt->execute(['id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode(['logged_in' => true, 'user' => $user]);
        exit();
    }
}

echo json_encode(['logged_in' => false]);