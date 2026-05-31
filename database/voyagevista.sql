-- ============================================================
-- VoyageVista — Script SQL complet
-- Importer via phpMyAdmin (WAMP) dans la base "voyagevista"
-- ============================================================

-- Création et sélection de la base
CREATE DATABASE IF NOT EXISTS voyagevista CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE voyagevista;

-- ============================================================
-- TABLE : utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS utilisateurs (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nom        VARCHAR(100) NOT NULL,
    prenom     VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('user', 'admin') DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE : destinations
-- ============================================================
CREATE TABLE IF NOT EXISTS destinations (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nom         VARCHAR(150) NOT NULL,
    pays        VARCHAR(100) NOT NULL,
    description TEXT,
    categorie   VARCHAR(50),
    prix        DECIMAL(10,2) DEFAULT 0.00
);

-- ============================================================
-- TABLE : hebergements
-- ============================================================
CREATE TABLE IF NOT EXISTS hebergements (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    destination_id INT NOT NULL,
    nom            VARCHAR(150) NOT NULL,
    type           ENUM('hotel','appartement','auberge','villa') DEFAULT 'hotel',
    capacite       INT DEFAULT 2,
    prix_nuit      DECIMAL(10,2) NOT NULL,
    description    TEXT,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE : reservations_hebergement
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations_hebergement (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    hebergement_id INT NOT NULL,
    date_debut     DATE NOT NULL,
    date_fin       DATE NOT NULL,
    statut         ENUM('en_attente','confirmee','annulee') DEFAULT 'en_attente',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
    FOREIGN KEY (hebergement_id) REFERENCES hebergements(id)
);

-- ============================================================
-- TABLE : transports
-- ============================================================
CREATE TABLE IF NOT EXISTS transports (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    type             ENUM('avion','train','bus') NOT NULL,
    depart           VARCHAR(150) NOT NULL,
    arrivee          VARCHAR(150) NOT NULL,
    date_depart      DATETIME NOT NULL,
    date_arrivee     DATETIME NOT NULL,
    prix             DECIMAL(10,2) NOT NULL,
    places_totales   INT DEFAULT 100,
    places_restantes INT DEFAULT 100
);

-- ============================================================
-- TABLE : reservations_transport
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations_transport (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    transport_id   INT NOT NULL,
    statut         ENUM('en_attente','confirmee','annulee') DEFAULT 'en_attente',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
    FOREIGN KEY (transport_id) REFERENCES transports(id)
);

-- ============================================================
-- TABLE : activites
-- ============================================================
CREATE TABLE IF NOT EXISTS activites (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    destination_id   INT NOT NULL,
    nom              VARCHAR(150) NOT NULL,
    description      TEXT,
    prix             DECIMAL(10,2) NOT NULL,
    capacite_max     INT DEFAULT 20,
    places_restantes INT DEFAULT 20,
    duree            VARCHAR(50),
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE : inscriptions_activite
-- ============================================================
CREATE TABLE IF NOT EXISTS inscriptions_activite (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    activite_id    INT NOT NULL,
    statut         ENUM('inscrit','annule') DEFAULT 'inscrit',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
    FOREIGN KEY (activite_id) REFERENCES activites(id)
);

-- ============================================================
-- TABLE : itineraires
-- ============================================================
CREATE TABLE IF NOT EXISTS itineraires (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    titre          VARCHAR(200) NOT NULL,
    date_debut     DATE,
    date_fin       DATE,
    statut         ENUM('brouillon','confirme','annule') DEFAULT 'brouillon',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
);

-- ============================================================
-- TABLE : itineraire_transports
-- ============================================================
CREATE TABLE IF NOT EXISTS itineraire_transports (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    itineraire_id INT NOT NULL,
    transport_id  INT NOT NULL,
    FOREIGN KEY (itineraire_id) REFERENCES itineraires(id) ON DELETE CASCADE,
    FOREIGN KEY (transport_id) REFERENCES transports(id)
);

-- ============================================================
-- TABLE : itineraire_hebergements
-- ============================================================
CREATE TABLE IF NOT EXISTS itineraire_hebergements (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    itineraire_id  INT NOT NULL,
    hebergement_id INT NOT NULL,
    date_debut     DATE,
    date_fin       DATE,
    FOREIGN KEY (itineraire_id) REFERENCES itineraires(id) ON DELETE CASCADE,
    FOREIGN KEY (hebergement_id) REFERENCES hebergements(id)
);

-- ============================================================
-- TABLE : itineraire_activites
-- ============================================================
CREATE TABLE IF NOT EXISTS itineraire_activites (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    itineraire_id INT NOT NULL,
    activite_id   INT NOT NULL,
    FOREIGN KEY (itineraire_id) REFERENCES itineraires(id) ON DELETE CASCADE,
    FOREIGN KEY (activite_id) REFERENCES activites(id)
);

-- ============================================================
-- TABLE : panier_items
-- ============================================================
CREATE TABLE IF NOT EXISTS panier_items (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    type           ENUM('hebergement','transport','activite') NOT NULL,
    ref_id         INT NOT NULL,
    date_debut     DATE,
    date_fin       DATE,
    prix           DECIMAL(10,2) NOT NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE : notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    message        TEXT NOT NULL,
    type           VARCHAR(50) DEFAULT 'info',
    lu             TINYINT(1) DEFAULT 0,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE : voyageurs
-- ============================================================
CREATE TABLE IF NOT EXISTS voyageurs (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    itineraire_id INT NOT NULL,
    nom           VARCHAR(100) NOT NULL,
    prenom        VARCHAR(100) NOT NULL,
    email         VARCHAR(150),
    FOREIGN KEY (itineraire_id) REFERENCES itineraires(id) ON DELETE CASCADE
);

-- ============================================================
-- DONNÉES DE TEST
-- ============================================================

-- Utilisateurs
-- Mot de passe pour tous : "password"
-- Hash généré avec password_hash('password', PASSWORD_DEFAULT)
INSERT INTO utilisateurs (nom, prenom, email, password, role) VALUES
('Admin', 'VoyageVista', 'admin@voyagevista.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Dupont', 'Jean', 'jean@test.com',   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Martin', 'Sophie', 'sophie@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Destinations
INSERT INTO destinations (nom, pays, description, categorie, prix) VALUES
('Bali',       'Indonésie',   'Île paradisiaque avec temples, rizières et plages.', 'plage',    736.00),
('Interlaken', 'Suisse',      'Capital de l\'aventure au cœur des Alpes suisses.',  'montagne', 1249.00),
('Paris',      'France',      'La ville lumière, capitale de la mode et culture.',   'culture',  299.00),
('Tokyo',      'Japon',       'Mégapole mêlant tradition japonaise et modernité.',   'culture',  899.00),
('Marrakech',  'Maroc',       'Médina colorée, souks et cuisine authentique.',       'culture',  249.00),
('Barcelone',  'Espagne',     'Architecture Gaudí, plages et vie animée.',           'plage',    399.00);

-- Hébergements
INSERT INTO hebergements (destination_id, nom, type, capacite, prix_nuit, description) VALUES
(1, 'Villa Ubud',             'villa',       4, 95.00,  'Villa avec piscine privée au cœur d\'Ubud.'),
(1, 'Kuta Beach Hotel',       'hotel',       2, 60.00,  'Hôtel face à la plage de Kuta.'),
(2, 'Alpin Lodge',            'auberge',     1, 40.00,  'Auberge cosy avec vue sur les montagnes.'),
(2, 'InterLaken Palace',      'hotel',       2, 180.00, 'Hôtel 4 étoiles en plein centre-ville.'),
(3, 'Hôtel Le Marais',        'hotel',       2, 120.00, 'Hôtel cosy dans le quartier du Marais.'),
(4, 'Shinjuku Palace Hotel',  'hotel',       2, 180.00, 'Au cœur de Shinjuku.'),
(5, 'Riad Zitoun',            'villa',       6, 75.00,  'Riad traditionnel avec patio.'),
(6, 'Barceloneta Beach Hotel','hotel',       2, 110.00, 'À deux pas de la plage.');

-- Transports
INSERT INTO transports (type, depart, arrivee, date_depart, date_arrivee, prix, places_totales, places_restantes) VALUES
('avion', 'Paris CDG',     'Bali DPS',       '2026-07-01 10:00:00', '2026-07-02 14:00:00', 580.00, 200, 180),
('avion', 'Paris CDG',     'Tokyo HND',      '2026-07-05 11:00:00', '2026-07-06 06:00:00', 650.00, 200, 160),
('avion', 'Paris CDG',     'Barcelone BCN',  '2026-07-10 08:00:00', '2026-07-10 10:00:00', 89.00,  150, 120),
('train', 'Paris Nord',    'Barcelone Sants','2026-07-12 07:00:00', '2026-07-12 13:30:00', 120.00, 300, 250),
('avion', 'Paris CDG',     'Marrakech RAK',  '2026-07-15 09:00:00', '2026-07-15 11:30:00', 110.00, 180, 150),
('bus',   'Barcelone',     'Marrakech',      '2026-07-20 06:00:00', '2026-07-21 10:00:00', 55.00,  50,  35),
('train', 'Paris Lyon',    'Interlaken Ost', '2026-07-22 08:00:00', '2026-07-22 13:00:00', 140.00, 100, 95),
('avion', 'Londres LHR',   'Paris CDG',      '2026-07-25 14:00:00', '2026-07-25 15:15:00', 75.00,  120, 110),
('train', 'Bruxelles M.',  'Paris Nord',     '2026-07-26 10:00:00', '2026-07-26 11:22:00', 49.00,  200, 190);

-- Activités
INSERT INTO activites (destination_id, nom, description, prix, capacite_max, places_restantes, duree) VALUES
(1, 'Cours de surf',          'Initiation au surf sur la plage de Kuta.',           45.00, 10, 8, '2h'),
(1, 'Visite temples Ubud',    'Tour des temples sacrés d\'Ubud avec guide.',        30.00, 15, 12, '3h'),
(2, 'Saut en parachute',      'Saut tandem au-dessus des Alpes suisses.',           280.00, 6, 4, '1h'),
(2, 'Randonnée Jungfrau',     'Randonnée guidée vers le sommet de la Jungfrau.',    60.00, 12, 10, '6h'),
(3, 'Visite du Louvre',       'Découverte des œuvres majeures avec guide.',         35.00, 20, 15, '3h'),
(3, 'Croisière sur la Seine', 'Balade en bateau-mouche.',                           20.00, 50, 40, '1h30'),
(4, 'Cérémonie du thé',       'Initiation à la cérémonie du thé traditionnelle.',   50.00, 8,  5,  '2h'),
(5, 'Atelier cuisine',        'Apprenez à cuisiner un tajine avec un chef local.',  55.00, 10, 7,  '3h'),
(6, 'Visite Sagrada Família', 'Entrée prioritaire et visite guidée de Gaudí.',      40.00, 30, 20, '2h');
