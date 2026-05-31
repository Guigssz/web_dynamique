const Navbar = () => {
    const { user, logout } = React.useContext(AuthContext);

    return (
        <nav className="navbar" style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '15px 30px', 
            backgroundColor: '#0056b3', 
            color: 'white'
        }}>
            <div className="navbar-brand">
                <a href="#/" style={{ color: 'white', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
                    🛫 VoyageVista
                </a>
            </div>
            
            <div className="navbar-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <a href="#/destinations" style={{ color: 'white', textDecoration: 'none' }}>🌍 Explorer</a>
                <a href="#/transports" style={{ color: 'white', textDecoration: 'none' }}>🎫 Transports</a>
                <a href="#/hebergements" style={{ color: 'white', textDecoration: 'none' }}>🏨 Hébergements</a>
                <a href="#/activites" style={{ color: 'white', textDecoration: 'none' }}>🏄 Activités</a>
                
                <span style={{ color: '#ccc' }}>|</span>

                {user ? (
                    // Liens si connecté
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <a href="#/profile" style={{ color: '#ffc107', textDecoration: 'none', fontWeight: 'bold' }}>
                            👤 {user.nom} ({user.role})
                        </a>
                        <button onClick={logout} style={{
                            backgroundColor: '#dc3545', 
                            color: 'white', 
                            border: 'none', 
                            padding: '5px 10px', 
                            borderRadius: '4px', 
                            cursor: 'pointer'
                        }}>
                            Déconnexion
                        </button>
                    </div>
                ) : (
                    // Liens si déconnecté
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <a href="#/login" style={{ color: 'white', textDecoration: 'none' }}>Connexion</a>
                        <a href="#/register" style={{ 
                            backgroundColor: 'white', 
                            color: '#0056b3', 
                            padding: '5px 10px', 
                            borderRadius: '4px', 
                            textDecoration: 'none',
                            fontWeight: 'bold'
                        }}>Inscription</a>
                    </div>
                )
                }
            </div>
        </nav>
    );
};

// Enregistrement global
window.Navbar = Navbar;