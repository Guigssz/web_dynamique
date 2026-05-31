// ── PAGE : HÉBERGEMENTS ───────────────────────────────────

// Images par type d'hébergement (Unsplash CDN)
const IMAGES_HEBERGEMENTS = {
    "hotel":      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=300&fit=crop&auto=format",
    "hôtel":      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=300&fit=crop&auto=format",
    "auberge":    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=300&fit=crop&auto=format",
    "hostel":     "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=300&fit=crop&auto=format",
    "appartement":"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=300&fit=crop&auto=format",
    "appart":     "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=300&fit=crop&auto=format",
    "villa":      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&h=300&fit=crop&auto=format",
    "resort":     "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=300&fit=crop&auto=format",
    "bungalow":   "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&h=300&fit=crop&auto=format",
    "default":    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=300&fit=crop&auto=format"
};

function getImageHebergement(type) {
    if (!type) return IMAGES_HEBERGEMENTS["default"];
    const cle = type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const [k, v] of Object.entries(IMAGES_HEBERGEMENTS)) {
        if (cle.includes(k) || k.includes(cle)) return v;
    }
    return IMAGES_HEBERGEMENTS["default"];
}

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
                            const typeLabel = (h.type || 'Hôtel');
                            const imgUrl = h.image || getImageHebergement(h.type);
                            return (
                                <div key={id} className={`destination-card ${estSelectionne ? 'destination-card--active' : ''}`} onClick={() => setSelectionne(prev => prev === id ? null : id)}>
                                    <div className="destination-card__image">
                                        <img src={imgUrl} alt={h.nom} loading="lazy" />
                                        <span className="card-img-label">🏨 {typeLabel}</span>
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
