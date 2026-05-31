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

// Auto-seed des transports pour Interlaken et Paris s'ils manquent
$chkTrans = mysqli_query($conn, "SELECT id FROM transports WHERE arrivee = 'Interlaken Ost'");
if ($chkTrans && mysqli_num_rows($chkTrans) == 0) {
    mysqli_query($conn, "INSERT INTO transports (type, depart, arrivee, date_depart, date_arrivee, prix, places_totales, places_restantes) VALUES
    ('train', 'Paris Lyon',    'Interlaken Ost', '2026-07-22 08:00:00', '2026-07-22 13:00:00', 140.00, 100, 95),
    ('avion', 'Londres LHR',   'Paris CDG',      '2026-07-25 14:00:00', '2026-07-25 15:15:00', 75.00,  120, 110),
    ('train', 'Bruxelles M.',  'Paris Nord',     '2026-07-26 10:00:00', '2026-07-26 11:22:00', 49.00,  200, 190)");
}
