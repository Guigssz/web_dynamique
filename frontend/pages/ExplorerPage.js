// ── Composant interne : carte destination ───────────────────
function DestinationCard({ destination, estSelectionne, onSelectionner }) {
    return (
        <div
            className={`destination-card ${estSelectionne ? 'destination-card--active' : ''}`}
            onClick={() => onSelectionner(destination.id_destination || destination.id)}
        >
            <div className="destination-card__image">
                <span>{destination.nom.toUpperCase()}</span>
            </div>
            <div className="destination-card__body">
                <h3 className="destination-card__titre">
                    {destination.nom}, {destination.pays}
                </h3>
                <p className="destination-card__prix">
                    Dès {destination.prix}€
                </p>
                {estSelectionne && (
                    <button className="destination-card__btn">
                        Organiser →
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Composant interne : panneau de filtres ──────────────────
function FiltresPanel({ budgetMax, onBudgetChange, categories, onCategorieChange }) {
    return (
        <aside className="filtres-panel">
            <h2 className="filtres-panel__titre">
                ⊞ Filtrer les offres
            </h2>

            <div className="filtres-panel__section">
                <label className="filtres-panel__label">Budget Maximum</label>
                <input
                    type="range"
                    min="100"
                    max="5000"
                    step="50"
                    value={budgetMax}
                    onChange={e => onBudgetChange(Number(e.target.value))}
                    className="filtres-panel__slider"
                />
                <p className="filtres-panel__budget-valeur">Max : {budgetMax} €</p>
            </div>

            <div className="filtres-panel__section">
                <label className="filtres-panel__label">Catégorie</label>
                {[
                    { valeur: 'plage',    libelle: 'Plages / Détente' },
                    { valeur: 'montagne', libelle: 'Montagne / Aventure' },
                    { valeur: 'culture',  libelle: 'Culture / Ville' },
                ].map(cat => (
                    <label key={cat.valeur} className="filtres-panel__checkbox-label">
                        <input
                            type="checkbox"
                            checked={categories.includes(cat.valeur)}
                            onChange={() => onCategorieChange(cat.valeur)}
                        />
                        {cat.libelle}
                    </label>
                ))}
            </div>
        </aside>
    );
}

// ── Page d'exploration principale ──────────────────────────────────
const ExplorerPage = () => {
    const [destinations, setDestinations] = React.useState([]);
    const [selectionne, setSelectionne]   = React.useState(null);
    const [budgetMax, setBudgetMax]        = React.useState(2500);
    const [categories, setCategories]      = React.useState([]);

    React.useEffect(() => {
        fetch('./api/destinations/list.php')
            .then(res => res.json())
            .then(data => setDestinations(data))
            .catch(err => console.error('Erreur chargement destinations :', err));
    }, []);

    const destinationsFiltrees = destinations.filter(d => {
        const okBudget    = d.prix <= budgetMax;
        const okCategorie = categories.length === 0 || categories.includes(d.categorie);
        return okBudget && okCategorie;
    });

    function toggleCategorie(valeur) {
        setCategories(prev =>
            prev.includes(valeur)
                ? prev.filter(c => c !== valeur)
                : [...prev, valeur]
        );
    }

    return (
        <div className="page-layout">
            {/* On réutilise la Sidebar existante de ton design global */}
            {window.Sidebar && <window.Sidebar pageActive="explorer" />}

            <main className="contenu-principal">
                <h1 className="contenu-principal__titre">Destinations Populaires</h1>

                {destinationsFiltrees.length === 0 ? (
                    <p style={{ color: 'var(--color-text-light)' }}>
                        Aucune destination ne correspond à vos filtres.
                    </p>
                ) : (
                    <div className="grille-destinations">
                        {destinationsFiltrees.map(d => (
                            <DestinationCard
                                key={d.id_destination || d.id}
                                destination={d}
                                estSelectionne={selectionne === (d.id_destination || d.id)}
                                onSelectionner={id => setSelectionne(prev => prev === id ? null : id)}
                            />
                        ))}
                    </div>
                )}
            </main>

            <FiltresPanel
                budgetMax={budgetMax}
                onBudgetChange={setBudgetMax}
                categories={categories}
                onCategorieChange={toggleCategorie}
            />
        </div>
    );
};

// Enregistrement global
window.ExplorerPage = ExplorerPage;