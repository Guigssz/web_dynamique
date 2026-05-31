<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

session_start();
require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Non connecté.']);
    exit;
}

$userId = $_SESSION['user_id'];

// Récupérer les itinéraires
$sqlIt = "SELECT * FROM itineraires WHERE utilisateur_id = ? ORDER BY created_at DESC";
$stmtIt = $conn->prepare($sqlIt);
$stmtIt->bind_param("i", $userId);
$stmtIt->execute();
$itineraires = $stmtIt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmtIt->close();

$result = [];

foreach ($itineraires as $it) {
    $itId = $it['id'];

    // 1. Transports
    $sqlT = "SELECT it.id AS liaison_id, t.* 
             FROM itineraire_transports it
             JOIN transports t ON it.transport_id = t.id
             WHERE it.itineraire_id = ?";
    $stmtT = $conn->prepare($sqlT);
    $stmtT->bind_param("i", $itId);
    $stmtT->execute();
    $transports = $stmtT->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmtT->close();

    // 2. Hébergements
    $sqlH = "SELECT ih.id AS liaison_id, ih.date_debut AS date_arr, ih.date_fin AS date_dep, h.* 
             FROM itineraire_hebergements ih
             JOIN hebergements h ON ih.hebergement_id = h.id
             WHERE ih.itineraire_id = ?";
    $stmtH = $conn->prepare($sqlH);
    $stmtH->bind_param("i", $itId);
    $stmtH->execute();
    $hebergements = $stmtH->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmtH->close();

    // 3. Activités
    $sqlA = "SELECT ia.id AS liaison_id, a.* 
             FROM itineraire_activites ia
             JOIN activites a ON ia.activite_id = a.id
             WHERE ia.itineraire_id = ?";
    $stmtA = $conn->prepare($sqlA);
    $stmtA->bind_param("i", $itId);
    $stmtA->execute();
    $activites = $stmtA->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmtA->close();

    // 4. Voyageurs
    $sqlV = "SELECT * FROM voyageurs WHERE itineraire_id = ?";
    $stmtV = $conn->prepare($sqlV);
    $stmtV->bind_param("i", $itId);
    $stmtV->execute();
    $voyageurs = $stmtV->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmtV->close();

    $it['transports'] = $transports;
    $it['hebergements'] = $hebergements;
    $it['activites'] = $activites;
    $it['voyageurs'] = $voyageurs;

    $result[] = $it;
}

echo json_encode($result);
?>
