<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

session_start();
require_once __DIR__ . '/../config/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Non autorisé.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['nom']) && !empty($data['email'])) {
    $query = "UPDATE utilisateurs SET nom = :nom, email = :email WHERE id_utilisateur = :id";
    $stmt = $pdo->prepare($query);

    if ($stmt->execute([
        'nom' => $data['nom'],
        'email' => $data['email'],
        'id' => $_SESSION['user_id']
    ])) {
        echo json_encode(['success' => true, 'message' => 'Profil mis à jour.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de la mise à jour.']);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Données incomplètes.']);
}