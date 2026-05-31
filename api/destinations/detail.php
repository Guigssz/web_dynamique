<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once '../config/db.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "ID destination invalide."]);
    exit;
}

// Destination
$stmt = $conn->prepare("SELECT * FROM destinations WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$dest = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$dest) {
    http_response_code(404);
    echo json_encode(["error" => "Destination introuvable."]);
    exit;
}

// Hébergements liés
$stmt2 = $conn->prepare("SELECT * FROM hebergements WHERE destination_id = ?");
$stmt2->bind_param("i", $id);
$stmt2->execute();
$hebergements = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt2->close();

// Activités liées
$stmt3 = $conn->prepare("SELECT * FROM activites WHERE destination_id = ?");
$stmt3->bind_param("i", $id);
$stmt3->execute();
$activites = $stmt3->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt3->close();

$dest['hebergements'] = $hebergements;
$dest['activites'] = $activites;

echo json_encode($dest);
?>
