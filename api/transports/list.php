<?php
// Autorise le frontend à appeler ce script (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Connexion BDD
require_once '../config/db.php';

// Récupère les filtres passés en paramètre URL (optionnels)
$type = isset($_GET['type']) ? $_GET['type'] : null; // Vol, Train, etc.
$prix_max = isset($_GET['prix_max']) ? (float)$_GET['prix_max'] : null;

// Construction de la requête SQL sur la table transports
$sql = "SELECT * FROM transports WHERE 1=1";

if ($type) {
    $type = mysqli_real_escape_string($conn, $type);
    $sql .= " AND type_transport = '$type'";
}
if ($prix_max) {
    $sql .= " AND prix <= $prix_max";
}

// CORRECTION : On vire le "ORDER BY compagnie" qui faisait planter !
// On trie simplement par la première colonne (généralement l'ID) pour éviter les bugs
$sql .= " ORDER BY 1 ASC";

// Exécution
$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(["error" => "Erreur SQL : " . mysqli_error($conn)]);
    exit;
}

// Récupération de toutes les lignes
$transports = mysqli_fetch_all($result, MYSQLI_ASSOC);

// Renvoi en JSON
echo json_encode($transports);
?>