// ── PAGE : ACTIVITÉS ──────────────────────────────────────

// Images par type/thème d'activité (Unsplash CDN)
const IMAGES_ACTIVITES = {
    "plongee":     "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=300&fit=crop&auto=format",
    "plongée":     "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=300&fit=crop&auto=format",
    "surf":        "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&h=300&fit=crop&auto=format",
    "randonnee":   "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=300&fit=crop&auto=format",
    "randonnée":   "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=300&fit=crop&auto=format",
    "ski":         "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=300&fit=crop&auto=format",
    "musee":       "https://images.unsplash.com/photo-1565060169194-19fabf63012c?w=600&h=300&fit=crop&auto=format",
    "musée":       "https://images.unsplash.com/photo-1565060169194-19fabf63012c?w=600&h=300&fit=crop&auto=format",
    "gastronomie": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=300&fit=crop&auto=format",
    "cuisine":     "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=300&fit=crop&auto=format",
    "temple":      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&h=300&fit=crop&auto=format",
    "spa":         "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=300&fit=crop&auto=format",
    "kayak":       "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&h=300&fit=crop&auto=format",
    "velo":        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=300&fit=crop&auto=format",
    "vélo":        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=300&fit=crop&auto=format",
    "excursion":   "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=600&h=300&fit=crop&auto=format",
    "visite":      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&h=300&fit=crop&auto=format",
    "default":     "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=600&h=300&fit=crop&auto=format"
};

function getImageActivite(nom, type) {
    const texte = ((nom || '') + ' ' + (type || '')).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const [k, v] of Object.entries(IMAGES_ACTIVITES)) {
        const kNorm = k.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (texte.includes(kNorm)) return v;
    }
    return IMAGES_ACTIVITES["default"];
}

function ActivitesPage({ onAjouter, destinationActive }) {
    const { user } = React.useContext(AuthContext);
    const [activites, setActivites] = React.useState([]);
    const [selectionne, setSelectionne] = React.useState(null);
    const [erreur, setErreur] = React.useState(null);
    const [budgetMax, setBudgetMax] = React.useState(2500);

    React.useEffect(() => {
        fetch('./api/activites/list.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(data => { if (data.error) setErreur(data.error); else setActivites(data); })
            .catch(err => setErreur(err.message));
    }, []);

    const activitesFiltrees = activites.filter(act => {
        const respecteBudget = Number(act.prix || 0) <= budgetMax;
        if (!destinationActive) return respecteBudget;

        return respecteBudget && Number(act.destination_id) === Number(destinationActive.id);
    });

    return (
        <div className="page-layout">
            <Sidebar pageActive="activites" />
            <main className="contenu-principal">
                <h1 className="contenu-principal__titre">Activités & Excursions</h1>
                
                {destinationActive ? (
                    <div style={{ padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #c8e6c9' }}>
                        🎭 Expériences recommandées à : <strong>{destinationActive.nom}</strong>
                    </div>
                ) : (
                    <div style={{ padding: '12px', background: '#fff3e0', color: '#e65100', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #ffe0b2' }}>
                        💡 Conseil : Sélectionnez une destination dans l'onglet <strong>Explorer</strong> pour afficher les activités associées.
                    </div>
                )}
                
                {erreur && (
                    <div style={{ padding: '15px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
                        <strong>Erreur :</strong> {erreur}
                    </div>
                )}

                {activitesFiltrees.length === 0 && !erreur ? (
                    <p style={{ color: 'var(--color-text-light)' }}>Aucune activité trouvée pour ce budget.</p>
                ) : (
                    <div className="grille-destinations">
                        {activitesFiltrees.map(act => {
                            const id = act.id;
                            const estSelectionne = selectionne === id;
                            const titre = act.nom || "Activité sans nom";
                            const prix = act.prix || 0;
                            const duree = act.duree || "Non spécifiée";
                            const places = act.places_restantes ?? act.capacite_max;
                            const imgUrl = act.image || getImageActivite(act.nom, act.type);

                            return (
                                <div key={id} className={`destination-card ${estSelectionne ? 'destination-card--active' : ''}`} onClick={() => setSelectionne(prev => prev === id ? null : id)}>
                                    <div className="destination-card__image">
                                        <img src={imgUrl} alt={titre} loading="lazy" />
                                        <span className="card-img-label">🎭 Activité</span>
                                    </div>
                                    <div className="destination-card__body">
                                        <h3 className="destination-card__titre">{titre}</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '4px' }}>
                                            ⏱️ Durée : {duree}
                                        </p>
                                        {act.description && (
                                            <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '8px', lineHeight: '1.3' }}>
                                                {act.description}
                                            </p>
                                        )}
                                        <p style={{ fontSize: '0.75rem', color: '#e53e3e', marginBottom: '8px' }}>
                                            🔥 Places dispos : {places}
                                        </p>
                                        <p className="destination-card__prix">{prix}€</p>
                                        {estSelectionne && (
                                            <button className="destination-card__btn" onClick={(e) => { e.stopPropagation(); onAjouter({ genre: '🎭 Activité', nom: titre, prix: prix, details: `Durée : ${duree}`, type: 'activite', ref_id: act.id }); }}>
                                                Choisir
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            {user ? (
                <FiltresPanel budgetMax={budgetMax} onBudgetChange={setBudgetMax} afficherCategories={false} />
            ) : (
                <ConnexionSidePanel />
            )}
        </div>
    );
}
