// ── PAGE : TRANSPORTS ─────────────────────────────────────
function TransportsPage({ onAjouter, destinationActive }) {
    const { user } = React.useContext(AuthContext);
    const [transports, setTransports] = React.useState([]);
    const [selectionne, setSelectionne] = React.useState(null);
    const [erreur, setErreur] = React.useState(null);
    const [budgetMax, setBudgetMax] = React.useState(2500);

    React.useEffect(() => {
        fetch('./api/transports/list.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(data => { if (data.error) setErreur(data.error); else setTransports(data); })
            .catch(err => setErreur(err.message));
    }, []);

    const formaterDate = (dateStr) => {
        if (!dateStr) return "Non spécifiée";
        try {
            const t = dateStr.split(/[- :]/);
            if (t.length >= 5) return `${t[2]}/${t[1]}/${t[0]} à ${t[3]}:${t[4]}`;
            return dateStr;
        } catch(e) { return dateStr; }
    };

    const transportsFiltres = transports.filter(t => {
        const respecteBudget = t.prix <= budgetMax;
        if (!destinationActive) return respecteBudget;
        
        const cible = normaliserTexte(destinationActive.nom);
        return respecteBudget && (
            normaliserTexte(t.arrivee).includes(cible) ||
            normaliserTexte(t.nom).includes(cible) ||
            normaliserTexte(t.description).includes(cible)
        );
    });

    return (
        <div className="page-layout">
            <Sidebar pageActive="transports" />
            <main className="contenu-principal">
                <h1 className="contenu-principal__titre">Transports disponibles</h1>
                
                {destinationActive ? (
                    <div style={{ padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #c8e6c9' }}>
                        ✈️ Transports configurés à destination de : <strong>{destinationActive.nom}</strong>
                    </div>
                ) : (
                    <div style={{ padding: '12px', background: '#fff3e0', color: '#e65100', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #ffe0b2' }}>
                        💡 Conseil : Sélectionnez une destination dans l'onglet <strong>Explorer</strong> pour cibler vos trajets.
                    </div>
                )}

                {erreur && <div className="alert alert-error"><strong>Erreur :</strong> {erreur}</div>}
                {transportsFiltres.length === 0 && !erreur ? (
                    <p style={{ color: 'var(--color-text-light)' }}>Aucun transport trouvé.</p>
                ) : (
                    <div className="grille-destinations">
                        {transportsFiltres.map(t => {
                            const id = t.id;
                            const estSelectionne = selectionne === id;
                            const typeTransport = (t.type || "avion").toUpperCase();
                            const icone = typeTransport === "TRAIN" ? "🚅 Train" : typeTransport === "BUS" ? "🚌 Bus" : "✈️ Avion";
                            const labelTrajet = `${t.depart || "N/A"} → ${t.arrivee || "N/A"}`;

                            return (
                                <div key={id} className={`destination-card ${estSelectionne ? 'destination-card--active' : ''}`} onClick={() => setSelectionne(prev => prev === id ? null : id)}>
                                    <div className="destination-card__image"><span>{icone}</span></div>
                                    <div className="destination-card__body">
                                        <h3 className="destination-card__titre" style={{ fontSize: '1rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
                                            {labelTrajet}
                                        </h3>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '4px' }}>
                                            📅 <strong>Départ :</strong> {formaterDate(t.date_depart)}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#e53e3e', marginBottom: '8px' }}>
                                            🔥 Places restantes : {t.places_restantes || 0}
                                        </p>
                                        <p className="destination-card__prix">{t.prix}€</p>
                                        {estSelectionne && (
                                            <button className="destination-card__btn" onClick={(e) => { e.stopPropagation(); onAjouter({ genre: '✈️ Transport', nom: `${typeTransport} : ${labelTrajet}`, prix: t.prix, details: `Départ le ${formaterDate(t.date_depart)}`, type: 'transport', ref_id: t.id }); }}>
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
