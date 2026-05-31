// ── NAVBAR — Barre de navigation supérieure ────────────────
function Navbar() {
    const { user, logout } = React.useContext(AuthContext);
    const [nonLuesCount, setNonLuesCount] = React.useState(0);

    const chargerNotificationsCount = () => {
        if (!user) return;
        fetch('./api/notifications/list.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(data => {
                if (data && typeof data.non_lues !== 'undefined') {
                    setNonLuesCount(data.non_lues);
                }
            })
            .catch(err => console.error(err));
    };

    React.useEffect(() => {
        chargerNotificationsCount();
        const interval = setInterval(chargerNotificationsCount, 15000); // Rafraîchir toutes les 15 secondes
        return () => clearInterval(interval);
    }, [user]);

    return (
        <header className="header" style={{position: 'sticky', top: 0, zIndex: 100}}>
            <div className="header__inner">
                <a href="#/" className="header__logo">VoyageVista</a>
                <div className="header__search">
                    <input type="text" className="header__search-input" placeholder="Destination | Dates de séjour | Voyageurs" />
                    <button className="header__search-btn">Go</button>
                </div>
                <div className="header__actions" style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <a href="#/notifications" style={{ textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                                <span style={{ fontSize: '1.4rem' }}>🔔</span>
                                {nonLuesCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        right: '-5px',
                                        background: 'var(--color-danger)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        padding: '2px 6px',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {nonLuesCount}
                                    </span>
                                )}
                            </a>
                            <a href="#/profil" style={{ textDecoration: 'none', color: '#fff', fontWeight: 'bold' }}>
                                👤 {user.prenom || ''} {user.nom}
                            </a>
                            <button 
                                onClick={logout} 
                                style={{ background: 'var(--color-danger)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                            >
                                Déconnexion
                            </button>
                        </div>
                    ) : (
                        <span style={{color: '#fff', fontSize: '0.85rem', fontWeight: 'bold'}}>🔒 Mode Visiteur (Identifiez-vous à droite)</span>
                    )}
                </div>
            </div>
        </header>
    );
}
