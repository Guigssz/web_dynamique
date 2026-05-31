// ── SIDEBAR — Navigation latérale ────────────────────────
function Sidebar({ pageActive }) {
    const { user } = React.useContext(AuthContext);
    
    const liens = [
        { id: 'explorer',     libelle: 'Explorer',       icone: '🌍' },
        { id: 'transports',   libelle: 'Transports',     icone: '✈' },
        { id: 'hebergements', libelle: 'Hébergements',   icone: '🏨' },
        { id: 'activites',    libelle: 'Activités',      icone: '🎭' },
        { id: 'itineraire',   libelle: 'Mon Itinéraire', icone: '🛒' },
    ];

    if (user) {
        liens.push({ id: 'reservations', libelle: 'Mes Voyages', icone: '💼' });
    }

    if (user && user.role === 'admin') {
        liens.push({ id: 'admin', libelle: 'Administration', icone: '🛡️' });
    }

    return (
        <nav className="sidebar">
            {liens.map(lien => (
                <a key={lien.id} href={`#/${lien.id}`} className={`sidebar__lien ${pageActive === lien.id ? 'sidebar__lien--actif' : ''}`}>
                    <span className="sidebar__icone">{lien.icone}</span> {lien.libelle}
                </a>
            ))}
        </nav>
    );
}
