<?php
// Autorise le frontend à appeler ce script (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Connexion BDD
require_once '../config/db.php';

// Récupère les filtres passés en paramètre URL (optionnels)
$categorie  = isset($_GET['categorie'])  ? $_GET['categorie']       : null;
$budget_max = isset($_GET['budget_max']) ? (float)$_GET['budget_max'] : null;

// Construction de la requête SQL
$sql = "SELECT * FROM destinations WHERE 1=1";

if ($categorie) {
    $categorie = mysqli_real_escape_string($conn, $categorie);
    $sql .= " AND categorie = '$categorie'";
}
if ($budget_max) {
    $sql .= " AND prix <= $budget_max";
}

$sql .= " ORDER BY nom ASC";

// Exécution
$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(["error" => "Erreur SQL : " . mysqli_error($conn)]);
    exit;
}

// Récupération de toutes les lignes
$destinations = mysqli_fetch_all($result, MYSQLI_ASSOC);

// Renvoi en JSON
echo json_encode($destinations);
?>
