<?php
// Autorise le frontend à appeler ce script (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Connexion BDD
require_once '../config/db.php';

// Récupère les filtres passés en paramètre URL (optionnels)
$type = isset($_GET['type']) ? $_GET['type'] : null;
$prix_max = isset($_GET['prix_max']) ? (float)$_GET['prix_max'] : null;

// Construction de la requête SQL sur la table hebergements
$sql = "SELECT * FROM hebergements WHERE 1=1";

if ($type) {
    $type = mysqli_real_escape_string($conn, $type);
    $sql .= " AND type = '$type'";
}
if ($prix_max) {
    $sql .= " AND prix_nuit <= $prix_max";
}

$sql .= " ORDER BY nom ASC";

// Exécution
$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(["error" => "Erreur SQL : " . mysqli_error($conn)]);
    exit;
}

// Récupération de toutes les lignes
$hebergements = mysqli_fetch_all($result, MYSQLI_ASSOC);

// Renvoi en JSON
echo json_encode($hebergements);
?>