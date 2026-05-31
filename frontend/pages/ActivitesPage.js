// ── PAGE : ACTIVITÉS ──────────────────────────────────────
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

                            return (
                                <div key={id} className={`destination-card ${estSelectionne ? 'destination-card--active' : ''}`} onClick={() => setSelectionne(prev => prev === id ? null : id)}>
                                    <div className="destination-card__image">
                                        <span>🎭 ACTIVITÉ</span>
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
