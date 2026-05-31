<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

session_start();
require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Non connecté.']);
    exit;
}

$userId = $_SESSION['user_id'];

$sql = "SELECT pi.*, 
    CASE 
        WHEN pi.type = 'hebergement' THEN h.nom
        WHEN pi.type = 'transport' THEN CONCAT(t.depart, ' → ', t.arrivee)
        WHEN pi.type = 'activite' THEN a.nom
        WHEN pi.type = 'destination' THEN d.nom
    END AS nom_item,
    CASE
        WHEN pi.type = 'hebergement' THEN 'hotel'
        WHEN pi.type = 'transport' THEN t.type
        WHEN pi.type = 'activite' THEN 'activite'
        WHEN pi.type = 'destination' THEN 'destination'
    END AS sous_type
FROM panier_items pi
LEFT JOIN hebergements h ON pi.type = 'hebergement' AND pi.ref_id = h.id
LEFT JOIN transports t ON pi.type = 'transport' AND pi.ref_id = t.id
LEFT JOIN activites a ON pi.type = 'activite' AND pi.ref_id = a.id
LEFT JOIN destinations d ON pi.type = 'destination' AND pi.ref_id = d.id
WHERE pi.utilisateur_id = ?
ORDER BY pi.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// Calculer le total
$total = 0;
foreach ($items as $item) {
    $total += (float)$item['prix'];
}

echo json_encode(['items' => $items, 'total' => $total]);
?>
