// ── PAGE : ADMINISTRATION ─────────────────────────────────
function AdminPage() {
    const { user } = React.useContext(AuthContext);
    const [users, setUsers] = React.useState([]);
    const [erreur, setErreur] = React.useState('');
    const [message, setMessage] = React.useState('');

    // Formulaire ajout destination
    const [destNom, setDestNom] = React.useState('');
    const [destPays, setDestPays] = React.useState('');
    const [destDesc, setDestDesc] = React.useState('');
    const [destCat, setDestCat] = React.useState('culture');
    const [destPrix, setDestPrix] = React.useState('');

    // Destinations pour suppression
    const [destinations, setDestinations] = React.useState([]);

    const chargerUsers = () => {
        fetch('./api/admin/users.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(data => { if (data.error) setErreur(data.error); else setUsers(data); })
            .catch(err => setErreur(err.message));
    };

    const chargerDestinations = () => {
        fetch('./api/destinations/list.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(data => setDestinations(data))
            .catch(err => console.error(err));
    };

    React.useEffect(() => { chargerUsers(); chargerDestinations(); }, []);

    if (!user || user.role !== 'admin') {
        return (
            <div className="page-layout">
                <Sidebar pageActive="admin" />
                <main className="contenu-principal">
                    <div style={{ padding: '30px', textAlign: 'center' }}>
                        <h2>⛔ Accès Refusé</h2>
                        <p style={{ color: 'var(--color-text-light)' }}>Cette page est réservée aux administrateurs.</p>
                    </div>
                </main>
            </div>
        );
    }

    const changerRole = (targetId, newRole) => {
        fetch('./api/admin/change_role.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ user_id: targetId, role: newRole })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) { setMessage(data.message); chargerUsers(); }
            else setErreur(data.error);
        })
        .catch(err => setErreur(err.message));
    };

    const ajouterDestination = (e) => {
        e.preventDefault();
        fetch('./api/destinations/create.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ nom: destNom, pays: destPays, description: destDesc, categorie: destCat, prix: Number(destPrix) })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setMessage('Destination créée !');
                setDestNom(''); setDestPays(''); setDestDesc(''); setDestPrix('');
                chargerDestinations();
            } else setErreur(data.error);
        })
        .catch(err => setErreur(err.message));
    };

    const supprimerDestination = (id, nom) => {
        if (!confirm(`Supprimer la destination "${nom}" et tous ses hébergements/activités liés ?`)) return;
        fetch('./api/destinations/delete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) { setMessage('Destination supprimée.'); chargerDestinations(); }
            else setErreur(data.error);
        })
        .catch(err => setErreur(err.message));
    };

    const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem' };
    const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '3px' };

    return (
        <div className="page-layout">
            <Sidebar pageActive="admin" />
            <main className="contenu-principal">
                <h1 className="contenu-principal__titre">🛡️ Administration</h1>

                {erreur && <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '15px' }}>{erreur}</div>}
                {message && <div style={{ padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '15px' }}>{message}</div>}

                {/* Section Utilisateurs */}
                <h2 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--color-primary)' }}>👥 Gestion des Utilisateurs</h2>
                <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                        <thead>
                            <tr style={{ background: 'var(--color-primary)', color: 'white' }}>
                                <th style={{ padding: '10px 15px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '10px 15px', textAlign: 'left' }}>Nom</th>
                                <th style={{ padding: '10px 15px', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '10px 15px', textAlign: 'left' }}>Rôle</th>
                                <th style={{ padding: '10px 15px', textAlign: 'left' }}>Inscrit le</th>
                                <th style={{ padding: '10px 15px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '10px 15px' }}>{u.id}</td>
                                    <td style={{ padding: '10px 15px', fontWeight: 'bold' }}>{u.prenom} {u.nom}</td>
                                    <td style={{ padding: '10px 15px' }}>{u.email}</td>
                                    <td style={{ padding: '10px 15px' }}>
                                        <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', color: 'white', background: u.role === 'admin' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 15px', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{u.created_at}</td>
                                    <td style={{ padding: '10px 15px', textAlign: 'center' }}>
                                        {u.id != user.id && (
                                            u.role === 'user' ? (
                                                <button onClick={() => changerRole(u.id, 'admin')} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                    Promouvoir Admin
                                                </button>
                                            ) : (
                                                <button onClick={() => changerRole(u.id, 'user')} style={{ background: '#ff9800', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                    Retirer Admin
                                                </button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Section Destinations */}
                <h2 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--color-primary)' }}>🌍 Gestion des Destinations</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Formulaire ajout */}
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>➕ Ajouter une destination</h3>
                        <form onSubmit={ajouterDestination} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div><label style={labelStyle}>Nom</label><input type="text" value={destNom} onChange={e => setDestNom(e.target.value)} required style={inputStyle} /></div>
                            <div><label style={labelStyle}>Pays</label><input type="text" value={destPays} onChange={e => setDestPays(e.target.value)} required style={inputStyle} /></div>
                            <div><label style={labelStyle}>Description</label><textarea value={destDesc} onChange={e => setDestDesc(e.target.value)} style={{...inputStyle, minHeight: '60px'}} /></div>
                            <div><label style={labelStyle}>Catégorie</label>
                                <select value={destCat} onChange={e => setDestCat(e.target.value)} style={inputStyle}>
                                    <option value="plage">Plage</option>
                                    <option value="montagne">Montagne</option>
                                    <option value="culture">Culture</option>
                                </select>
                            </div>
                            <div><label style={labelStyle}>Prix de base (€)</label><input type="number" value={destPrix} onChange={e => setDestPrix(e.target.value)} required style={inputStyle} /></div>
                            <button type="submit" className="destination-card__btn" style={{ width: '100%', padding: '10px' }}>Créer la destination</button>
                        </form>
                    </div>

                    {/* Liste pour suppression */}
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>🗑️ Destinations existantes</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                            {destinations.map(d => (
                                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                                    <div>
                                        <strong>{d.nom}</strong> <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>({d.pays})</span>
                                        <span style={{ marginLeft: '8px', fontSize: '0.75rem', background: 'var(--color-primary)', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>{d.prix}€</span>
                                    </div>
                                    <button onClick={() => supprimerDestination(d.id, d.nom)} style={{ background: 'var(--color-danger)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
