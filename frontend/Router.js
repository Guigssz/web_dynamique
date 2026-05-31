const Router = () => {
    // On extrait la page actuelle depuis le hash de l'URL (par défaut : '#/')
    const [currentHash, setCurrentHash] = React.useState(window.location.hash || '#/');
    const { user } = React.useContext(AuthContext);

    React.useEffect(() => {
        const handleHashChange = () => {
            setCurrentHash(window.location.hash || '#/');
        };

        // On écoute les changements de navigation dans le navigateur
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Système de routage "maison" (Switch case sur l'URL)
    const renderPage = () => {
        switch (currentHash) {
            case '#/':
            case '#/destinations':
                // Si la page d'accueil/explorer existe globalement, on l'affiche
                return window.ExplorerPage ? <window.ExplorerPage /> : <div style={{padding: '20px'}}>Page d'accueil (Destinations) prête à être liée.</div>;
            
            case '#/login':
                return window.LoginPage ? <window.LoginPage /> : <div>Page Login manquante</div>;
            
            case '#/register':
                return window.RegisterPage ? <window.RegisterPage /> : <div>Page Inscription manquante</div>;
            
            case '#/profile':
                return window.ProfilePage ? <window.ProfilePage /> : <div>Page Profil manquante</div>;
                
            case '#/transports':
                return <div style={{padding: '20px'}}><h2>Module Transports</h2><p>En cours de développement (Étape 3)...</p></div>;
                
            case '#/hebergements':
                return <div style={{padding: '20px'}}><h2>Module Hébergements</h2><p>En cours de développement (Étape 4)...</p></div>;
                
            case '#/activites':
                return <div style={{padding: '20px'}}><h2>Module Activités</h2><p>En cours de développement (Étape 5)...</p></div>;

            case '#/itineraire':
                return <div style={{padding: '20px'}}><h2>Mon Itinéraire</h2><p>En cours de développement (Étape 6)...</p></div>;

            default:
                return <div style={{padding: '20px'}}><h2>Erreur 404</h2><p>Page introuvable.</p></div>;
        }
    };

    return (
        <div className="app-layout">
            {/* La barre de navigation s'affichera en haut ou à côté sur toutes les pages */}
            {window.Navbar && <window.Navbar />}
            <main className="main-content" style={{ minHeight: '80vh' }}>
                {renderPage()}
            </main>
        </div>
    );
};

// Enregistrement global pour le système CDN
window.Router = Router;