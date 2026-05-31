// ── CONTEXTE D'AUTHENTIFICATION (Sessions PHP) ────────────
const AuthContext = React.createContext(null);

function AuthProvider({ children }) {
    const [user, setUser] = React.useState(null);
    const [chargement, setChargement] = React.useState(true);

    React.useEffect(() => {
        fetch('./api/auth/me.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(data => {
                if (data.logged_in && data.user) {
                    setUser(data.user);
                }
                setChargement(false);
            })
            .catch(() => setChargement(false));
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        fetch('./api/auth/logout.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(() => {
                setUser(null);
                window.location.hash = '#/';
            })
            .catch(err => console.error('Erreur déconnexion :', err));
    };

    if (chargement) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', background: '#f4f7f6', color: 'var(--color-primary)' }}>
                <h2>Chargement de VoyageVista...</h2>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
