const ProfilePage = () => {
    // On récupère les données de l'utilisateur connecté et la fonction de déconnexion depuis le contexte d'authentification
    const { user, logout } = React.useContext(AuthContext);
    const [nom, setNom] = React.useState(user ? user.nom : '');
    const [email, setEmail] = React.useState(user ? user.email : '');
    const [message, setMessage] = React.useState({ text: '', type: '' });
    const [loading, setLoading] = React.useState(false);

    // Si aucun utilisateur n'est connecté, on affiche un message d'avertissement
    if (!user) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Accès Refusé</h2>
                <p>Vous devez être connecté pour voir cette page.</p>
                <a href="#/login" className="btn-primary">Se connecter</a>
            </div>
        );
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            // Appel à l'API PHP pour mettre à jour le profil (on va créer ce script juste après)
            const response = await fetch('api/auth/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom, email })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'Profil mis à jour avec succès ! (Rechargez pour appliquer)', type: 'success' });
            } else {
                setMessage({ text: data.error || 'Une erreur est survenue.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Impossible de joindre le serveur.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container" style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Mon Profil VoyageVista</h2>
            <p style={{ color: '#666' }}>Gérez vos informations personnelles et votre compte.</p>

            {message.text && (
                <div style={{ 
                    padding: '10px', 
                    marginBottom: '15px', 
                    borderRadius: '4px', 
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24'
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nom complet :</label>
                    <input 
                        type="text" 
                        value={nom} 
                        onChange={(e) => setNom(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Adresse Email :</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Type de compte (Rôle) :</label>
                    <input 
                        type="text" 
                        value={user.role} 
                        disabled 
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#eee', cursor: 'not-allowed' }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ padding: '12px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {loading ? 'Mise à jour...' : 'Sauvegarder les modifications'}
                </button>
            </form>

            <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />

            <button 
                onClick={logout} 
                style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Se déconnecter
            </button>
        </div>
    );
};

// On l'enregistre sur la fenêtre globale pour que le routeur CDN puisse le trouver sans système d'import ES6 complexe
window.ProfilePage = ProfilePage;