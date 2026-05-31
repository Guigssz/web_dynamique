// ── PANNEAU DE FILTRES COMMUN ────────────────────────────
function FiltresPanel({ budgetMax, onBudgetChange, categories, onCategorieChange, afficherCategories = true }) {
    return (
        <aside className="filtres-panel">
            <h2 className="filtres-panel__titre">⊞ Filtrer les offres</h2>
            <div className="filtres-panel__section">
                <label className="filtres-panel__label">Budget Maximum</label>
                <input type="range" min="50" max="5000" step="50" value={budgetMax} onChange={e => onBudgetChange(Number(e.target.value))} className="filtres-panel__slider" />
                <p className="filtres-panel__budget-valeur">Max : {budgetMax} €</p>
            </div>
            {afficherCategories && (
                <div className="filtres-panel__section">
                    <label className="filtres-panel__label">Catégorie</label>
                    {[
                        { valeur: 'plage',    libelle: 'Plages / Détente' },
                        { valeur: 'montagne', libelle: 'Montagne / Aventure' },
                        { valeur: 'culture',  libelle: 'Culture / Ville' },
                    ].map(cat => (
                        <label key={cat.valeur} className="filtres-panel__checkbox-label">
                            <input type="checkbox" checked={categories.includes(cat.valeur)} onChange={() => onCategorieChange(cat.valeur)} />
                            {cat.libelle}
                        </label>
                    ))}
                </div>
            )}
        </aside>
    );
}
