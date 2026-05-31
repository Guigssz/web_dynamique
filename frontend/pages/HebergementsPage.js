// ── PAGE : HÉBERGEMENTS ───────────────────────────────────
function HebergementsPage({ onAjouter, destinationActive }) {
    const { user } = React.useContext(AuthContext);
    const [hotels, setHotels] = React.useState([]);
    const [selectionne, setSelectionne] = React.useState(null);
    const [budgetMax, setBudgetMax] = React.useState(2500);

    React.useEffect(() => {
        fetch('./api/hebergements/list.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(data => setHotels(data))
            .catch(err => console.error('Erreur hébergements :', err));
    }, []);

    const hotelsFiltres = hotels.filter(h => {
        const respecteBudget = (h.prix_nuit || h.prix) <= budgetMax;
        if (!destinationActive) return respecteBudget;
        
        return respecteBudget && Number(h.destination_id) === Number(destinationActive.id);
    });

    return (
        <div className="page-layout">
            <Sidebar pageActive="hebergements" />
            <main className="contenu-principal">
                <h1 className="contenu-principal__titre">Hébergements disponibles</h1>
                
                {destinationActive ? (
                    <div style={{ padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #c8e6c9' }}>
                        🏨 Filtrage géographique appliqué pour : <strong>{destinationActive.nom}</strong>
                    </div>
                ) : (
                    <div style={{ padding: '12px', background: '#fff3e0', color: '#e65100', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #ffe0b2' }}>
                        💡 Conseil : Sélectionnez une destination dans l'onglet <strong>Explorer</strong> pour affiner automatiquement la liste.
                    </div>
                )}

                {hotelsFiltres.length === 0 ? (
                    <p style={{ color: 'var(--color-text-light)' }}>Aucun hébergement trouvé.</p>
                ) : (
                    <div className="grille-destinations">
                        {hotelsFiltres.map(h => {
                            const id = h.id;
                            const estSelectionne = selectionne === id;
                            const prix = h.prix_nuit || h.prix;
                            return (
                                <div key={id} className={`destination-card ${estSelectionne ? 'destination-card--active' : ''}`} onClick={() => setSelectionne(prev => prev === id ? null : id)}>
                                    <div className="destination-card__image">
                                        <span>{(h.type || 'HÔTEL').toUpperCase()}</span>
                                    </div>
                                    <div className="destination-card__body">
                                        <h3 className="destination-card__titre">{h.nom}</h3>
                                        <p style={{fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '5px'}}>{h.adresse}</p>
                                        <p style={{fontSize: '0.85rem', color: '#555', marginBottom: '8px', lineHeight: '1.3'}}>{h.description}</p>
                                        <p className="destination-card__prix">{prix}€ / nuit</p>
                                        {estSelectionne && (
                                            <button className="destination-card__btn" onClick={(e) => { e.stopPropagation(); onAjouter({ genre: '🏨 Hébergement', nom: h.nom, prix: prix, details: h.adresse, type: 'hebergement', ref_id: h.id }); }}>
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
