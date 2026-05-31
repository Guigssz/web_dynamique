// ── UTILITAIRE : normalisation de texte (accents, casse) ──
const normaliserTexte = (str) => {
    return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
};

// ── PAGE : EXPLORER (DESTINATIONS) ────────────────────────
function ExplorerPage({ onAjouter, destinationActive }) {
    const { user } = React.useContext(AuthContext);
    const [destinations, setDestinations] = React.useState([]);
    const [selectionne, setSelectionne]   = React.useState(null);
    const [budgetMax, setBudgetMax]        = React.useState(2500);
    const [categories, setCategories]      = React.useState([]);

    React.useEffect(() => {
        fetch('./api/destinations/list.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(data => setDestinations(data))
            .catch(err => console.error('Erreur destinations :', err));
    }, []);

    const destinationsFiltrees = destinations.filter(d => d.prix <= budgetMax && (categories.length === 0 || categories.includes(d.categorie)));

    return (
        <div className="page-layout">
            <Sidebar pageActive="explorer" />
            <main className="contenu-principal">
                <h1 className="contenu-principal__titre">Destinations Populaires</h1>
                
                {destinationActive && (
                    <div style={{ padding: '12px', background: '#e3f2fd', color: '#0d47a1', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #bbdefb' }}>
                        📍 Étape active : Vous organisez actuellement votre voyage à <strong>{destinationActive.nom}</strong>.
                    </div>
                )}

                {destinationsFiltrees.length === 0 ? (
                    <p style={{ color: 'var(--color-text-light)' }}>Aucune destination trouvée.</p>
                ) : (
                    <div className="grille-destinations">
                        {destinationsFiltrees.map(d => {
                            const id = d.id;
                            const estSelectionne = selectionne === id;
                            return (
                                <div key={id} className={`destination-card ${estSelectionne ? 'destination-card--active' : ''}`} onClick={() => setSelectionne(prev => prev === id ? null : id)}>
                                    <div className="destination-card__image"><span>{d.nom.toUpperCase()}</span></div>
                                    <div className="destination-card__body">
                                        <h3 className="destination-card__titre">{d.nom}, {d.pays}</h3>
                                        <p className="destination-card__prix">Dès {d.prix}€</p>
                                        {estSelectionne && (
                                            <button className="destination-card__btn" onClick={(e) => { e.stopPropagation(); onAjouter({ genre: '🌍 Destination', nom: d.nom, pays: d.pays, prix: d.prix, type: 'destination', ref_id: d.id }); }}>
                                                Organiser →
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
                <FiltresPanel budgetMax={budgetMax} onBudgetChange={setBudgetMax} categories={categories} onCategorieChange={(v) => setCategories(p => p.includes(v) ? p.filter(c => c !== v) : [...p, v])} />
            ) : (
                <ConnexionSidePanel />
            )}
        </div>
    );
}