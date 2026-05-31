<?php
// Autorise le frontend à appeler ce script (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Connexion BDD
require_once '../config/db.php';

// Requête sur la table activites (ou le nom exact dans ta BDD)
$sql = "SELECT * FROM activites ORDER BY 1 ASC";

// Exécution
$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(["error" => "Erreur SQL : " . mysqli_error($conn)]);
    exit;
}

// Récupération de toutes les lignes
$activites = mysqli_fetch_all($result, MYSQLI_ASSOC);

// Renvoi en JSON
echo json_encode($activites);
?>