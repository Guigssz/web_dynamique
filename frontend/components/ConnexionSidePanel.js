// ── PANNEAU LATÉRAL D'AUTHENTIFICATION ───────────────────
function ConnexionSidePanel() {
    const { login } = React.useContext(AuthContext);
    const [mode, setMode] = React.useState('login'); 
    const [nom, setNom] = React.useState('');
    const [prenom, setPrenom] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [erreur, setErreur] = React.useState('');
    const [succesMsg, setSuccesMsg] = React.useState('');

    const gérerLogin = (e) => {
        e.preventDefault();
        setErreur('');
        fetch('./api/auth/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ email, password })
        })
        .then(res => {
            if (!res.ok) return res.json().then(err => { throw new Error(err.error || "Erreur de connexion."); });
            return res.json();
        })
        .then(data => {
            if (data.success && data.user) {
                login(data.user);
            }
        })
        .catch(err => setErreur(err.message));
    };

    const gérerRegister = (e) => {
        e.preventDefault();
        setErreur('');
        fetch('./api/auth/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ nom, prenom, email, password })
        })
        .then(res => {
            if (!res.ok) return res.json().then(err => { throw new Error(err.error || "Erreur d'inscription."); });
            return res.json();
        })
        .then(data => {
            if (data.success) {
                setSuccesMsg("✓ Compte créé !");
                setTimeout(() => {
                    setSuccesMsg('');
                    setMode('login');
                }, 1000);
            }
        })
        .catch(err => setErreur(err.message));
    };

    return (
        <aside className="filtres-panel" style={{ padding: '20px' }}>
            <h2 className="filtres-panel__titre">🔑 {mode === 'login' ? 'Espace Connexion' : 'Inscription'}</h2>
            
            {erreur && <div style={{ background: '#f8d7da', color: '#721c24', padding: '8px', borderRadius: '4px', marginBottom: '12px', fontSize: '0.8rem' }}>{erreur}</div>}
            {succesMsg && <div style={{ background: '#d4edda', color: '#155724', padding: '8px', borderRadius: '4px', marginBottom: '12px', fontSize: '0.8rem' }}>{succesMsg}</div>}

            {mode === 'login' ? (
                <form onSubmit={gérerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '3px' }}>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '3px' }}>Mot de passe</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                    <button type="submit" className="destination-card__btn" style={{ width: '100%', padding: '10px', marginTop: '5px' }}>Se connecter</button>
                    <p style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '8px' }}>
                        Pas de compte ? <span onClick={() => { setMode('register'); setErreur(''); }} style={{ color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer' }}>Créer un compte</span>
                    </p>
                </form>
            ) : (
                <form onSubmit={gérerRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '3px' }}>Prénom</label>
                        <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '3px' }}>Nom de famille</label>
                        <input type="text" value={nom} onChange={e => setNom(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '3px' }}>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '3px' }}>Mot de passe</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                    <button type="submit" className="destination-card__btn" style={{ width: '100%', padding: '10px', marginTop: '5px' }}>S'inscrire</button>
                    <p style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '8px' }}>
                        Déjà inscrit ? <span onClick={() => { setMode('login'); setErreur(''); }} style={{ color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer' }}>Se connecter</span>
                    </p>
                </form>
            )}
        </aside>
    );
}
