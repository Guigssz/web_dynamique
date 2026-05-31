<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = isset($data['email']) ? trim($data['email']) : '';
$password = isset($data['password']) ? $data['password'] : '';

if (!empty($email) && !empty($password)) {
    // Colonnes id, prenom et password appliquées
    $query = "SELECT id, nom, prenom, email, password, role FROM utilisateurs WHERE email = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user && password_verify($password, $user['password'])) {
        // Enregistrement de la session critique
        $_SESSION['user_id'] = $user['id']; 
        
        unset($user['password']); // Sécurité
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Email ou mot de passe incorrect.']);
    }
    $stmt->close();
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Données incomplètes.']);
}
?>
