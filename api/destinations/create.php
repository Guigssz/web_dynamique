<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
require_once '../config/db.php';

// Vérif admin
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Non connecté.']);
    exit;
}
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
$nom         = isset($data['nom'])         ? trim($data['nom'])         : '';
$pays        = isset($data['pays'])        ? trim($data['pays'])        : '';
$description = isset($data['description']) ? trim($data['description']) : '';
$categorie   = isset($data['categorie'])   ? trim($data['categorie'])   : '';
$prix        = isset($data['prix'])        ? (float)$data['prix']       : 0;

if (empty($nom) || empty($pays)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nom et pays requis.']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO destinations (nom, pays, description, categorie, prix) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssssd", $nom, $pays, $description, $categorie, $prix);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'id' => $stmt->insert_id, 'message' => 'Destination créée.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur SQL : ' . $conn->error]);
}
$stmt->close();
?>
