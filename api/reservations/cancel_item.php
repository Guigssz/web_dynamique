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
$liaisonId = isset($data['liaison_id']) ? (int)$data['liaison_id'] : 0;
$type      = isset($data['type']) ? trim($data['type']) : '';

if ($liaisonId <= 0 || !in_array($type, ['hebergement', 'transport', 'activite'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Paramètres invalides.']);
    exit;
}

$userId = $_SESSION['user_id'];
$success = false;
$msg = "";

if ($type === 'hebergement') {
    // Récupérer les détails de la réservation pour la notification
    $sInfo = $conn->prepare("SELECT h.nom, h.id FROM itineraire_hebergements ih JOIN hebergements h ON ih.hebergement_id = h.id WHERE ih.id = ?");
    $sInfo->bind_param("i", $liaisonId);
    $sInfo->execute();
    $info = $sInfo->get_result()->fetch_assoc();
    $sInfo->close();

    if ($info) {
        $del = $conn->prepare("DELETE FROM itineraire_hebergements WHERE id = ?");
        $del->bind_param("i", $liaisonId);
        if ($del->execute()) {
            $success = true;
            $msg = "Annulation de l'hébergement " . $info['nom'];
        }
        $del->close();
    }

} elseif ($type === 'transport') {
    // Récupérer le transport lié
    $sInfo = $conn->prepare("SELECT t.depart, t.arrivee, t.id FROM itineraire_transports it JOIN transports t ON it.transport_id = t.id WHERE it.id = ?");
    $sInfo->bind_param("i", $liaisonId);
    $sInfo->execute();
    $info = $sInfo->get_result()->fetch_assoc();
    $sInfo->close();

    if ($info) {
        $del = $conn->prepare("DELETE FROM itineraire_transports WHERE id = ?");
        $del->bind_param("i", $liaisonId);
        if ($del->execute()) {
            // Remettre une place disponible
            $upd = $conn->prepare("UPDATE transports SET places_restantes = places_restantes + 1 WHERE id = ?");
            $upd->bind_param("i", $info['id']);
            $upd->execute();
            $upd->close();

            $success = true;
            $msg = "Annulation du transport " . $info['depart'] . " → " . $info['arrivee'];
        }
        $del->close();
    }

} elseif ($type === 'activite') {
    // Récupérer l'activité liée
    $sInfo = $conn->prepare("SELECT a.nom, a.id FROM itineraire_activites ia JOIN activites a ON ia.activite_id = a.id WHERE ia.id = ?");
    $sInfo->bind_param("i", $liaisonId);
    $sInfo->execute();
    $info = $sInfo->get_result()->fetch_assoc();
    $sInfo->close();

    if ($info) {
        $del = $conn->prepare("DELETE FROM itineraire_activites WHERE id = ?");
        $del->bind_param("i", $liaisonId);
        if ($del->execute()) {
            // Remettre une place disponible
            $upd = $conn->prepare("UPDATE activites SET places_restantes = places_restantes + 1 WHERE id = ?");
            $upd->bind_param("i", $info['id']);
            $upd->execute();
            $upd->close();

            $success = true;
            $msg = "Annulation de l'activité " . $info['nom'];
        }
        $del->close();
    }
}

if ($success) {
    // Créer une notification
    $notifMsg = "❌ " . $msg . " a été annulé avec succès.";
    $notif = $conn->prepare("INSERT INTO notifications (utilisateur_id, message, type) VALUES (?, ?, 'annulation')");
    $notif->bind_param("is", $userId, $notifMsg);
    $notif->execute();
    $notif->close();

    echo json_encode(['success' => true, 'message' => 'Prestation annulée avec succès.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de l\'annulation de la prestation.']);
}
?>
