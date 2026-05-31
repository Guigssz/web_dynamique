<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['nom']) && !empty($data['prenom']) && !empty($data['email']) && !empty($data['password'])) {
    
    $nom = trim($data['nom']);
    $prenom = trim($data['prenom']);
    $email = trim($data['email']);
    $password = $data['password'];

    // 1. Vérification si l'email existe déjà (colonne id)
    $sql_check = "SELECT id FROM utilisateurs WHERE email = ?";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param("s", $email);
    $stmt_check->execute();
    $stmt_check->store_result();
    
    if ($stmt_check->num_rows > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Cet email est déjà utilisé.']);
        $stmt_check->close();
        exit();
    }
    $stmt_check->close();

    // 2. Hachage du mot de passe
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // 3. Insertion SQL corrigée : colonnes prenom, password et rôle 'user'
    $sql_insert = "INSERT INTO utilisateurs (nom, prenom, email, password, role) VALUES (?, ?, ?, ?, 'user')";
    $stmt_insert = $conn->prepare($sql_insert);
    $stmt_insert->bind_param("ssss", $nom, $prenom, $email, $hashedPassword);
    
    if ($stmt_insert->execute()) {
        echo json_encode(['success' => true, 'message' => 'Inscription réussie !']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => "Erreur lors de l'inscription SQL : " . $conn->error]);
    }
    $stmt_insert->close();
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Données incomplètes (il manque peut-être le prénom).']);
}
?>
