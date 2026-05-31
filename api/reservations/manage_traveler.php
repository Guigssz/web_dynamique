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
$action = isset($data['action']) ? trim($data['action']) : '';

$userId = $_SESSION['user_id'];

if ($action === 'add') {
    $itineraireId = isset($data['itineraire_id']) ? (int)$data['itineraire_id'] : 0;
    $nom          = isset($data['nom'])          ? trim($data['nom'])          : '';
    $prenom       = isset($data['prenom'])       ? trim($data['prenom'])       : '';
    $email        = isset($data['email'])        ? trim($data['email'])        : '';

    if ($itineraireId <= 0 || empty($nom) || empty($prenom)) {
        http_response_code(400);
        echo json_encode(['error' => 'Champs obligatoires manquants (Nom, Prénom).']);
        exit;
    }

    // Vérifier que l'itinéraire appartient bien à l'utilisateur
    $chk = $conn->prepare("SELECT id FROM itineraires WHERE id = ? AND utilisateur_id = ?");
    $chk->bind_param("ii", $itineraireId, $userId);
    $chk->execute();
    $owner = $chk->get_result()->fetch_assoc();
    $chk->close();

    if (!$owner) {
        http_response_code(403);
        echo json_encode(['error' => 'Accès refusé.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO voyageurs (itineraire_id, nom, prenom, email) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $itineraireId, $nom, $prenom, $email);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Voyageur ajouté avec succès.', 'id' => $stmt->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de l\'ajout du voyageur.']);
    }
    $stmt->close();

} elseif ($action === 'delete') {
    $travelerId = isset($data['traveler_id']) ? (int)$data['traveler_id'] : 0;

    if ($travelerId <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'ID voyageur invalide.']);
        exit;
    }

    // Retirer le voyageur
    $stmt = $conn->prepare("DELETE v FROM voyageurs v JOIN itineraires i ON v.itineraire_id = i.id WHERE v.id = ? AND i.utilisateur_id = ?");
    $stmt->bind_param("ii", $travelerId, $userId);

    if ($stmt->execute() && $stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Voyageur retiré avec succès.']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Voyageur introuvable ou droits insuffisants.']);
    }
    $stmt->close();

} else {
    http_response_code(400);
    echo json_encode(['error' => 'Action non spécifiée ou inconnue.']);
}
?>
