// ── PAGE : MON ITINÉRAIRE (PANIER) ────────────────────────
function ItinerairePage({ panier, onSupprimer, onValider }) {
    const total = panier.reduce((sum, item) => sum + Number(item.prix), 0);

    return (
        <div className="page-layout">
            <Sidebar pageActive="itineraire" />
            <main className="contenu-principal">
                <h1 className="contenu-principal__titre">🛒 Mon Itinéraire de Voyage</h1>
                
                {panier.length === 0 ? (
                    <div style={{ padding: '30px', background: '#fff', borderRadius: '8px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-light)' }}>Votre itinéraire est vide pour le moment.</p>
                        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '5px' }}>Explorez les sections pour composer votre séjour sur mesure !</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {panier.map((item, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px 20px', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                                <div>
                                    <strong style={{ fontSize: '1rem', color: 'var(--color-text)' }}>{item.nom}</strong>
                                    <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: 'white', background: 'var(--color-primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                        {item.genre}
                                    </span>
                                    {item.details && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px' }}>{item.details}</p>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <span style={{ fontWeight: '700', color: 'var(--color-success)', fontSize: '1.1rem' }}>{item.prix}€</span>
                                    <button onClick={() => onSupprimer(index)} style={{ background: 'var(--color-danger)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '2px solid var(--color-primary)', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, color: 'var(--color-text)' }}>Estimation Totale :</h3>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{panier.length} prestation(s) sélectionnée(s)</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-primary)' }}>{total} €</span>
                                <button onClick={onValider} className="destination-card__btn" style={{ margin: 0, padding: '12px 25px', fontSize: '1rem', width: 'auto' }}>
                                    Valider et Réserver 💳
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <aside className="filtres-panel">
                <h2 className="filtres-panel__titre">ℹ️ Récapitulatif</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', lineHeight: '1.4' }}>
                    Vos choix sont sauvegardés dans votre session de navigation. Ajustez votre programme avant la confirmation finale.
                </p>
            </aside>
        </div>
    );
}
