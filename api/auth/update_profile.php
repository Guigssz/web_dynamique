<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
require_once __DIR__ . '/../config/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Non connecté.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$nom    = isset($data['nom'])    ? trim($data['nom'])    : '';
$prenom = isset($data['prenom']) ? trim($data['prenom']) : '';
$email  = isset($data['email'])  ? trim($data['email'])  : '';

if (empty($nom) || empty($email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nom et email requis.']);
    exit;
}

$userId = $_SESSION['user_id'];

// Vérifier que l'email n'est pas déjà pris par un autre utilisateur
$check = $conn->prepare("SELECT id FROM utilisateurs WHERE email = ? AND id != ?");
$check->bind_param("si", $email, $userId);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Cet email est déjà utilisé par un autre compte.']);
    $check->close();
    exit;
}
$check->close();

$stmt = $conn->prepare("UPDATE utilisateurs SET nom = ?, prenom = ?, email = ? WHERE id = ?");
$stmt->bind_param("sssi", $nom, $prenom, $email, $userId);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Profil mis à jour.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur SQL : ' . $conn->error]);
}
$stmt->close();
?>
