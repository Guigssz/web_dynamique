<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Non connecté.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$itineraireId = isset($data['itineraire_id']) ? (int)$data['itineraire_id'] : 0;

if ($itineraireId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID itinéraire invalide.']);
    exit;
}

$userId = $_SESSION['user_id'];

// Récupérer l'itinéraire et s'assurer qu'il appartient bien à l'utilisateur
$chk = $conn->prepare("SELECT titre FROM itineraires WHERE id = ? AND utilisateur_id = ?");
$chk->bind_param("ii", $itineraireId, $userId);
$chk->execute();
$itInfo = $chk->get_result()->fetch_assoc();
$chk->close();

if (!$itInfo) {
    http_response_code(403);
    echo json_encode(['error' => 'Droit d\'accès ou itinéraire introuvable.']);
    exit;
}

// 1. Pour tous les transports de l'itinéraire, incrémenter les places
$sqlT = "SELECT transport_id FROM itineraire_transports WHERE itineraire_id = ?";
$stmtT = $conn->prepare($sqlT);
$stmtT->bind_param("i", $itineraireId);
$stmtT->execute();
$transports = $stmtT->get_result()->fetch_all(MYSQLI_ASSOC);
$stmtT->close();

foreach ($transports as $t) {
    $upd = $conn->prepare("UPDATE transports SET places_restantes = places_restantes + 1 WHERE id = ?");
    $upd->bind_param("i", $t['transport_id']);
    $upd->execute();
    $upd->close();
}

// 2. Pour toutes les activités de l'itinéraire, incrémenter les places
$sqlA = "SELECT activite_id FROM itineraire_activites WHERE itineraire_id = ?";
$stmtA = $conn->prepare($sqlA);
$stmtA->bind_param("i", $itineraireId);
$stmtA->execute();
$activites = $stmtA->get_result()->fetch_all(MYSQLI_ASSOC);
$stmtA->close();

foreach ($activites as $a) {
    $upd = $conn->prepare("UPDATE activites SET places_restantes = places_restantes + 1 WHERE id = ?");
    $upd->bind_param("i", $a['activite_id']);
    $upd->execute();
    $upd->close();
}

// 3. Supprimer l'itinéraire (les autres tables seront vidées par ON DELETE CASCADE)
$del = $conn->prepare("DELETE FROM itineraires WHERE id = ?");
$del->bind_param("i", $itineraireId);

if ($del->execute()) {
    // Créer une notification
    $notifMsg = "🗑️ Votre itinéraire \"" . $itInfo['titre'] . "\" a été entièrement annulé et supprimé.";
    $notif = $conn->prepare("INSERT INTO notifications (utilisateur_id, message, type) VALUES (?, ?, 'annulation')");
    $notif->bind_param("is", $userId, $notifMsg);
    $notif->execute();
    $notif->close();

    echo json_encode(['success' => true, 'message' => 'Itinéraire supprimé avec succès.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la suppression de l\'itinéraire.']);
}
$del->close();
?>
