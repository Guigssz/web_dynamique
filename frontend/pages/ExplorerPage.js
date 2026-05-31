// ── UTILITAIRE : normalisation de texte (accents, casse) ──
const normaliserTexte = (str) => {
    return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
};

// ── Images par ville (Unsplash CDN — aucun téléchargement requis) ──
const IMAGES_VILLES = {
    "bali":       "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=300&fit=crop&auto=format",
    "paris":      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=300&fit=crop&auto=format",
    "tokyo":      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=300&fit=crop&auto=format",
    "marrakech":  "https://images.unsplash.com/photo-1489493512598-d08130f49bea?w=600&h=300&fit=crop&auto=format",
    "barcelone":  "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&h=300&fit=crop&auto=format",
    "interlaken": "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=300&fit=crop&auto=format",
    "new york":   "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=300&fit=crop&auto=format",
    "rome":       "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=300&fit=crop&auto=format",
    "dubai":      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=300&fit=crop&auto=format",
    "amsterdam":  "https://images.unsplash.com/photo-1534351590666-13e3e96b5702?w=600&h=300&fit=crop&auto=format",
    "london":     "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=300&fit=crop&auto=format",
    "londre":     "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=300&fit=crop&auto=format",
    "sydney":     "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&h=300&fit=crop&auto=format",
    "default":    "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&h=300&fit=crop&auto=format"
};

function getImageVille(nom) {
    if (!nom) return IMAGES_VILLES["default"];
    const cle = normaliserTexte(nom);
    for (const [k, v] of Object.entries(IMAGES_VILLES)) {
        if (cle.includes(k) || k.includes(cle)) return v;
    }
    return IMAGES_VILLES["default"];
}

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
                            const imgUrl = d.image || getImageVille(d.nom);
                            return (
                                <div key={id} className={`destination-card ${estSelectionne ? 'destination-card--active' : ''}`} onClick={() => setSelectionne(prev => prev === id ? null : id)}>
                                    <div className="destination-card__image">
                                        <img src={imgUrl} alt={d.nom} loading="lazy" />
                                        <span className="card-img-label">🌍 {d.categorie || 'Destination'}</span>
                                    </div>
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