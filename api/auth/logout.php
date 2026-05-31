<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
session_unset();
session_destroy();

echo json_encode(['success' => true, 'message' => 'Déconnexion réussie.']);
?>