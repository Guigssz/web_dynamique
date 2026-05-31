<?php
require_once 'db.php';
$sql = "ALTER TABLE panier_items MODIFY COLUMN type ENUM('hebergement','transport','activite','destination') NOT NULL";
if (mysqli_query($conn, $sql)) {
    echo "Migration successful: type ENUM altered.";
} else {
    echo "Migration failed: " . mysqli_error($conn);
}
?>
