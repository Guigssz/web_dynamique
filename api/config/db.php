<?php
// Connexion à la base de données — style TP
$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "voyagevista";

$conn = mysqli_connect($servername, $username, $password, $dbname);
if (!$conn) {
    die("Echec de la connexion: " . mysqli_connect_error());
}

// Auto-migration pour le type 'destination' dans le panier
$chkCol = mysqli_query($conn, "SHOW COLUMNS FROM panier_items LIKE 'type'");
if ($chkCol) {
    $row = mysqli_fetch_assoc($chkCol);
    if ($row && strpos($row['Type'], 'destination') === false) {
        mysqli_query($conn, "ALTER TABLE panier_items MODIFY COLUMN type ENUM('hebergement','transport','activite','destination') NOT NULL");
    }
}
