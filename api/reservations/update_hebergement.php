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
$dateDebut = isset($data['date_debut']) ? trim($data['date_debut']) : '';
$dateFin   = isset($data['date_fin']) ? trim($data['date_fin']) : '';

if ($liaisonId <= 0 || empty($dateDebut) || empty($dateFin)) {
    http_response_code(400);
    echo json_encode(['error' => 'Paramètres manquants ou invalides.']);
    exit;
}

$userId = $_SESSION['user_id'];

// Récupérer les détails de la réservation pour la notification
$sInfo = $conn->prepare("SELECT h.nom FROM itineraire_hebergements ih JOIN hebergements h ON ih.hebergement_id = h.id WHERE ih.id = ?");
$sInfo->bind_param("i", $liaisonId);
$sInfo->execute();
$info = $sInfo->get_result()->fetch_assoc();
$sInfo->close();

if (!$info) {
    http_response_code(404);
    echo json_encode(['error' => 'Hébergement introuvable.']);
    exit;
}

$stmt = $conn->prepare("UPDATE itineraire_hebergements SET date_debut = ?, date_fin = ? WHERE id = ?");
$stmt->bind_param("ssi", $dateDebut, $dateFin, $liaisonId);

if ($stmt->execute()) {
    // Créer une notification
    $notifMsg = "✏️ Les dates de votre hébergement \"" . $info['nom'] . "\" ont été modifiées : du " . $dateDebut . " au " . $dateFin;
    $notif = $conn->prepare("INSERT INTO notifications (utilisateur_id, message, type) VALUES (?, ?, 'modification')");
    $notif->bind_param("is", $userId, $notifMsg);
    $notif->execute();
    $notif->close();

    echo json_encode(['success' => true, 'message' => 'Dates mises à jour avec succès.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la mise à jour des dates.']);
}
$stmt->close();
?>
