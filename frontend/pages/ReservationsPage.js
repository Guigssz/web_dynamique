// ── PAGE : MES VOYAGES & RÉSERVATIONS ──────────────────────
function ReservationsPage() {
    const { user } = React.useContext(AuthContext);
    const [voyages, setVoyages] = React.useState([]);
    const [erreur, setErreur] = React.useState('');
    const [message, setMessage] = React.useState('');

    // Pour la modal/formulaire de modification de dates d'hôtel
    const [modifLiaisonId, setModifLiaisonId] = React.useState(null);
    const [hotelNom, setHotelNom] = React.useState('');
    const [newDebut, setNewDebut] = React.useState('');
    const [newFin, setNewFin] = React.useState('');

    // Pour ajouter un voyageur
    const [nomVoyageur, setNomVoyageur] = React.useState('');
    const [prenomVoyageur, setPrenomVoyageur] = React.useState('');
    const [emailVoyageur, setEmailVoyageur] = React.useState('');
    const [selectItVoyageur, setSelectItVoyageur] = React.useState(null);

    const chargerVoyages = () => {
        fetch('./api/reservations/list.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(data => {
                if (data.error) setErreur(data.error);
                else setVoyages(data);
            })
            .catch(err => setErreur(err.message));
    };

    React.useEffect(() => {
        if (user) chargerVoyages();
    }, [user]);

    const annulerPrestation = (liaisonId, type) => {
        if (!confirm("Voulez-vous vraiment annuler cette prestation ?")) return;
        fetch('./api/reservations/cancel_item.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ liaison_id: liaisonId, type: type })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setMessage("Prestation annulée avec succès.");
                chargerVoyages();
            } else setErreur(data.error);
        })
        .catch(err => setErreur(err.message));
    };

    const ouvrirModifDates = (liaisonId, nom, debut, fin) => {
        setModifLiaisonId(liaisonId);
        setHotelNom(nom);
        setNewDebut(debut);
        setNewFin(fin);
    };

    const modifierDatesHotel = (e) => {
        e.preventDefault();
        fetch('./api/reservations/update_hebergement.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ liaison_id: modifLiaisonId, date_debut: newDebut, date_fin: newFin })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setMessage("Dates de séjour mises à jour.");
                setModifLiaisonId(null);
                chargerVoyages();
            } else setErreur(data.error);
        })
        .catch(err => setErreur(err.message));
    };

    const ajouterVoyageur = (e) => {
        e.preventDefault();
        fetch('./api/reservations/manage_traveler.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                action: 'add',
                itineraire_id: selectItVoyageur,
                nom: nomVoyageur,
                prenom: prenomVoyageur,
                email: emailVoyageur
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setMessage("Voyageur associé avec succès.");
                setNomVoyageur(''); setPrenomVoyageur(''); setEmailVoyageur('');
                setSelectItVoyageur(null);
                chargerVoyages();
            } else setErreur(data.error);
        })
        .catch(err => setErreur(err.message));
    };

    const supprimerVoyageur = (travelerId) => {
        if (!confirm("Retirer ce voyageur de votre voyage ?")) return;
        fetch('./api/reservations/manage_traveler.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ action: 'delete', traveler_id: travelerId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setMessage("Voyageur retiré.");
                chargerVoyages();
            } else setErreur(data.error);
        })
        .catch(err => setErreur(err.message));
    };

    const annulerItineraire = (itineraireId, titre) => {
        if (!confirm(`Voulez-vous vraiment annuler entièrement le voyage "${titre}" ? Cette action est irréversible.`)) return;
        fetch('./api/reservations/cancel_itinerary.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ itineraire_id: itineraireId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setMessage("Voyage supprimé.");
                chargerVoyages();
            } else setErreur(data.error);
        })
        .catch(err => setErreur(err.message));
    };

    if (!user) {
        return (
            <div className="page-layout">
                <Sidebar pageActive="reservations" />
                <main className="contenu-principal">
                    <div style={{ padding: '30px', textAlign: 'center' }}>
                        <h2>🔒 Accès Limité</h2>
                        <p style={{ color: 'var(--color-text-light)' }}>Connectez-vous pour consulter et gérer vos séjours.</p>
                    </div>
                </main>
            </div>
        );
    }

    const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem', marginBottom: '10px' };
    const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '3px' };

    return (
        <div className="page-layout">
            <Sidebar pageActive="reservations" />
            <main className="contenu-principal">
                <h1 className="contenu-principal__titre">✈️ Mes Voyages & Réservations</h1>

                {erreur && <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '15px' }}>{erreur}</div>}
                {message && <div style={{ padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '15px' }}>{message}</div>}

                {/* MODAL MODIF DATES HÔTEL */}
                {modifLiaisonId && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                            <h3 style={{ marginBottom: '15px' }}>🏨 Modifier les dates : {hotelNom}</h3>
                            <form onSubmit={modifierDatesHotel}>
                                <label style={labelStyle}>Date d'arrivée</label>
                                <input type="date" value={newDebut} onChange={e => setNewDebut(e.target.value)} required style={inputStyle} />
                                <label style={labelStyle}>Date de départ</label>
                                <input type="date" value={newFin} onChange={e => setNewFin(e.target.value)} required style={inputStyle} />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    <button type="submit" className="destination-card__btn" style={{ margin: 0 }}>Sauvegarder</button>
                                    <button type="button" onClick={() => setModifLiaisonId(null)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>Annuler</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {voyages.length === 0 ? (
                    <div style={{ padding: '30px', background: '#fff', borderRadius: '8px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-light)' }}>Vous n'avez pas encore de voyage programmé.</p>
                        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '5px' }}>Explorez nos destinations pour composer votre premier séjour !</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        {voyages.map(v => (
                            <div key={v.id} style={{ background: '#fff', borderRadius: '8px', border: '1px solid var(--color-border)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px', marginBottom: '15px' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.2rem', color: 'var(--color-primary)', margin: 0 }}>🗺️ {v.titre}</h2>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: '4px 0 0 0' }}>
                                            📅 Séjour prévu : {v.date_debut ? `Du ${v.date_debut} au ${v.date_fin}` : 'Dates flexibles'}
                                        </p>
                                    </div>
                                    <button onClick={() => annulerItineraire(v.id, v.titre)} style={{ background: 'var(--color-danger)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        Annuler le Voyage 🗑️
                                    </button>
                                </div>

                                {/* PRESTATIONS */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {/* Hébergements */}
                                    {v.hebergements.map(h => (
                                        <div key={`h-${h.liaison_id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '12px 15px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                                            <div>
                                                <strong>🏨 {h.nom}</strong> ({h.type})
                                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', margin: '3px 0 0 0' }}>📅 Dates : Du {h.date_arr} au {h.date_dep} | {h.prix_nuit}€/nuit</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => ouvrirModifDates(h.liaison_id, h.nom, h.date_arr, h.date_dep)} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Modifier les dates ✏️</button>
                                                <button onClick={() => annulerPrestation(h.liaison_id, 'hebergement')} style={{ background: 'var(--color-danger)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Annuler</button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Transports */}
                                    {v.transports.map(t => (
                                        <div key={`t-${t.liaison_id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '12px 15px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                                            <div>
                                                <strong>✈️ Transport ({t.type})</strong> : {t.depart} → {t.arrivee}
                                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', margin: '3px 0 0 0' }}>📅 Départ le : {t.date_depart} | {t.prix}€</p>
                                            </div>
                                            <button onClick={() => annulerPrestation(t.liaison_id, 'transport')} style={{ background: 'var(--color-danger)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Annuler</button>
                                        </div>
                                    ))}

                                    {/* Activités */}
                                    {v.activites.map(a => (
                                        <div key={`a-${a.liaison_id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '12px 15px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                                            <div>
                                                <strong>🎭 Activité : {a.nom}</strong>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', margin: '3px 0 0 0' }}>⏱️ Durée : {a.duree} | {a.prix}€</p>
                                            </div>
                                            <button onClick={() => annulerPrestation(a.liaison_id, 'activite')} style={{ background: 'var(--color-danger)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Annuler</button>
                                        </div>
                                    ))}
                                </div>

                                {/* GESTION DES VOYAGEURS */}
                                <div style={{ marginTop: '20px', borderTop: '1px dashed var(--color-border)', paddingTop: '15px' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--color-primary)', marginBottom: '10px' }}>👥 Voyageurs associés</h4>
                                    
                                    {v.voyageurs.length === 0 ? (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Aucun autre voyageur associé pour le moment.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                                            {v.voyageurs.map(tr => (
                                                <div key={tr.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#e3f2fd', padding: '5px 12px', borderRadius: '15px', border: '1px solid #bbdefb', fontSize: '0.8rem' }}>
                                                    <span>👤 {tr.prenom} {tr.nom} {tr.email && `(${tr.email})`}</span>
                                                    <button onClick={() => supprimerVoyageur(tr.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)', fontWeight: 'bold' }}>✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectItVoyageur === v.id ? (
                                        <form onSubmit={ajouterVoyageur} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                                            <input type="text" placeholder="Prénom" value={prenomVoyageur} onChange={e => setPrenomVoyageur(e.target.value)} required style={{...inputStyle, marginBottom: 0}} />
                                            <input type="text" placeholder="Nom" value={nomVoyageur} onChange={e => setNomVoyageur(e.target.value)} required style={{...inputStyle, marginBottom: 0}} />
                                            <input type="email" placeholder="Email (facultatif)" value={emailVoyageur} onChange={e => setEmailVoyageur(e.target.value)} style={{...inputStyle, marginBottom: 0}} />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button type="submit" className="destination-card__btn" style={{ margin: 0, padding: '5px 15px' }}>Ajouter</button>
                                                <button type="button" onClick={() => setSelectItVoyageur(null)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button onClick={() => setSelectItVoyageur(v.id)} style={{ background: 'var(--color-success)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            ➕ Ajouter un voyageur
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

window.ReservationsPage = ReservationsPage;
