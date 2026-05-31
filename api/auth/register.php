<?php
// Autorise le frontend à appeler ce script
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Connexion à la base de données (qui crée ta variable $conn)
require_once '../config/db.php';

// Récupère les données JSON envoyées par le bouton React
$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['nom']) && !empty($data['email']) && !empty($data['password'])) {
    
    $nom = mysqli_real_escape_string($conn, $data['nom']);
    $email = mysqli_real_escape_string($conn, $data['email']);
    $password = $data['password'];

    // 1. Vérifier si l'email existe déjà dans la table utilisateurs
    $sql_check = "SELECT id_utilisateur FROM utilisateurs WHERE email = '$email'";
    $result_check = mysqli_query($conn, $sql_check);
    
    if (mysqli_num_rows($result_check) > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Cet email est déjà utilisé.']);
        exit();
    }

    // 2. Hachage du mot de passe pour la sécurité
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // 3. Insertion dans la base de données
    $sql_insert = "INSERT INTO utilisateurs (nom, email, mot_de_passe, role) VALUES ('$nom', '$email', '$hashedPassword', 'voyageur')";
    
    if (mysqli_query($conn, $sql_insert)) {
        // On renvoie un succès propre en JSON à React
        echo json_encode(['success' => true, 'message' => 'Inscription réussie !']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => "Erreur SQL : " . mysqli_error($conn)]);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Données incomplètes.']);
}
?>
