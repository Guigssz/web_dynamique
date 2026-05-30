<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

session_start();
require_once '../config/db.php';

// Récupère les données envoyées en JSON par React
$data     = json_decode(file_get_contents('php://input'), true);
$email    = isset($data['email'])    ? $data['email']    : '';
$password = isset($data['password']) ? $data['password'] : '';

// Cherche l'utilisateur dans la BDD
$email_safe = mysqli_real_escape_string($conn, $email);
$result = mysqli_query($conn, "SELECT * FROM utilisateurs WHERE email = '$email_safe'");
$user   = mysqli_fetch_assoc($result);

// Vérifie le mot de passe
if ($user && password_verify($password, $user['password'])) {
    // Stocke l'id en session
    $_SESSION['user_id'] = $user['id'];

    // On n'envoie pas le mot de passe au frontend
    unset($user['password']);

    echo json_encode(['user' => $user]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Email ou mot de passe incorrect.']);
}
?>
