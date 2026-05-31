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

$userId = $_SESSION['user_id'];

// Récupérer les items du panier
$items = $conn->prepare("SELECT * FROM panier_items WHERE utilisateur_id = ?");
$items->bind_param("i", $userId);
$items->execute();
$panierItems = $items->get_result()->fetch_all(MYSQLI_ASSOC);
$items->close();

if (count($panierItems) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Votre panier est vide.']);
    exit;
}

// Trouver le nom de la destination si elle est présente dans le panier
$nomDestination = "";
foreach ($panierItems as $item) {
    if ($item['type'] === 'destination') {
        $stmtD = $conn->prepare("SELECT nom FROM destinations WHERE id = ?");
        $stmtD->bind_param("i", $item['ref_id']);
        $stmtD->execute();
        $resD = $stmtD->get_result()->fetch_assoc();
        if ($resD) {
            $nomDestination = $resD['nom'];
        }
        $stmtD->close();
        break;
    }
}

// Créer un itinéraire global
$titreVoyage = $nomDestination ? "Voyage à " . $nomDestination : "Voyage sur mesure du " . date('d/m/Y H:i');
$stmtIt = $conn->prepare("INSERT INTO itineraires (utilisateur_id, titre, statut) VALUES (?, ?, 'confirme')");
$stmtIt->bind_param("is", $userId, $titreVoyage);
$stmtIt->execute();
$itineraireId = $stmtIt->insert_id;
$stmtIt->close();

// Créer les réservations pour chaque item
$totalMontant = 0;
foreach ($panierItems as $item) {
    if ($item['type'] === 'destination') {
        continue; // Passé comme titre de l'itinéraire global
    }
    $totalMontant += (float)$item['prix'];

    if ($item['type'] === 'hebergement') {
        $s = $conn->prepare("INSERT INTO reservations_hebergement (utilisateur_id, hebergement_id, date_debut, date_fin, statut) VALUES (?, ?, ?, ?, 'confirmee')");
        $dd = $item['date_debut'] ?: date('Y-m-d');
        $df = $item['date_fin'] ?: date('Y-m-d', strtotime('+3 days'));
        $s->bind_param("iiss", $userId, $item['ref_id'], $dd, $df);
        $s->execute();
        $s->close();

        // Liaison itinéraire
        $l = $conn->prepare("INSERT INTO itineraire_hebergements (itineraire_id, hebergement_id, date_debut, date_fin) VALUES (?, ?, ?, ?)");
        $l->bind_param("iiss", $itineraireId, $item['ref_id'], $dd, $df);
        $l->execute();
        $l->close();

        // Mettre à jour les dates de l'itinéraire global
        $updIt = $conn->prepare("UPDATE itineraires SET date_debut = LEAST(IFNULL(date_debut, ?), ?), date_fin = GREATEST(IFNULL(date_fin, ?), ?) WHERE id = ?");
        $updIt->bind_param("ssssi", $dd, $dd, $df, $df, $itineraireId);
        $updIt->execute();
        $updIt->close();

    } elseif ($item['type'] === 'transport') {
        $s = $conn->prepare("INSERT INTO reservations_transport (utilisateur_id, transport_id, statut) VALUES (?, ?, 'confirmee')");
        $s->bind_param("ii", $userId, $item['ref_id']);
        $s->execute();
        $s->close();

        // Liaison itinéraire
        $l = $conn->prepare("INSERT INTO itineraire_transports (itineraire_id, transport_id) VALUES (?, ?)");
        $l->bind_param("ii", $itineraireId, $item['ref_id']);
        $l->execute();
        $l->close();

        // Décrémenter places
        $u = $conn->prepare("UPDATE transports SET places_restantes = places_restantes - 1 WHERE id = ?");
        $u->bind_param("i", $item['ref_id']);
        $u->execute();
        $u->close();

    } elseif ($item['type'] === 'activite') {
        $s = $conn->prepare("INSERT INTO inscriptions_activite (utilisateur_id, activite_id, statut) VALUES (?, ?, 'inscrit')");
        $s->bind_param("ii", $userId, $item['ref_id']);
        $s->execute();
        $s->close();

        // Liaison itinéraire
        $l = $conn->prepare("INSERT INTO itineraire_activites (itineraire_id, activite_id) VALUES (?, ?)");
        $l->bind_param("ii", $itineraireId, $item['ref_id']);
        $l->execute();
        $l->close();

        // Décrémenter places
        $u = $conn->prepare("UPDATE activites SET places_restantes = places_restantes - 1 WHERE id = ?");
        $u->bind_param("i", $item['ref_id']);
        $u->execute();
        $u->close();
    }
}

// Vider le panier
$del = $conn->prepare("DELETE FROM panier_items WHERE utilisateur_id = ?");
$del->bind_param("i", $userId);
$del->execute();
$del->close();

// Notification de confirmation
$msg = "🎉 Réservation validée ! Montant total : " . number_format($totalMontant, 2) . "€. Merci d'utiliser VoyageVista !";
$notif = $conn->prepare("INSERT INTO notifications (utilisateur_id, message, type) VALUES (?, ?, 'paiement')");
$notif->bind_param("is", $userId, $msg);
$notif->execute();
$notif->close();

echo json_encode([
    'success' => true,
    'message' => 'Réservation validée avec succès !',
    'montant_total' => $totalMontant
]);
?>
