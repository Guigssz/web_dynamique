// ── PAGE : NOTIFICATIONS ──────────────────────────────────
function NotificationsPage() {
    const { user } = React.useContext(AuthContext);
    const [notifications, setNotifications] = React.useState([]);
    const [nonLues, setNonLues] = React.useState(0);

    const charger = () => {
        fetch('./api/notifications/list.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(data => {
                if (data.notifications) {
                    setNotifications(data.notifications);
                    setNonLues(data.non_lues);
                }
            })
            .catch(err => console.error('Erreur notifications :', err));
    };

    React.useEffect(() => { charger(); }, []);

    const marquerLue = (id) => {
        fetch('./api/notifications/mark_read.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ id })
        })
        .then(() => charger());
    };

    const toutMarquer = () => {
        fetch('./api/notifications/mark_read.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({})
        })
        .then(() => charger());
    };

    if (!user) {
        return (
            <div className="page-layout">
                <Sidebar pageActive="notifications" />
                <main className="contenu-principal">
                    <p style={{ padding: '30px', color: 'var(--color-text-light)' }}>Connectez-vous pour voir vos notifications.</p>
                </main>
            </div>
        );
    }

    const iconeType = (type) => {
        switch(type) {
            case 'reservation': return '✅';
            case 'annulation': return '❌';
            case 'inscription': return '🎭';
            case 'paiement': return '💳';
            default: return 'ℹ️';
        }
    };

    return (
        <div className="page-layout">
            <Sidebar pageActive="notifications" />
            <main className="contenu-principal">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 className="contenu-principal__titre">🔔 Notifications {nonLues > 0 && <span style={{ fontSize: '0.8rem', background: 'var(--color-danger)', color: 'white', padding: '3px 10px', borderRadius: '12px', marginLeft: '10px' }}>{nonLues} non lue(s)</span>}</h1>
                    {nonLues > 0 && (
                        <button onClick={toutMarquer} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            Tout marquer comme lu
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div style={{ padding: '30px', background: '#fff', borderRadius: '8px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <p style={{ color: 'var(--color-text-light)' }}>Aucune notification pour le moment.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {notifications.map(n => (
                            <div key={n.id} onClick={() => !n.lu && marquerLue(n.id)} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '15px 20px', borderRadius: '8px',
                                background: n.lu == 0 ? '#e3f2fd' : '#fff',
                                border: `1px solid ${n.lu == 0 ? '#bbdefb' : 'var(--color-border)'}`,
                                cursor: n.lu == 0 ? 'pointer' : 'default',
                                boxShadow: n.lu == 0 ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{iconeType(n.type)}</span>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontWeight: n.lu == 0 ? 'bold' : 'normal' }}>{n.message}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '3px' }}>{n.created_at}</p>
                                    </div>
                                </div>
                                {n.lu == 0 && <span style={{ fontSize: '0.7rem', background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>Nouveau</span>}
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <aside className="filtres-panel">
                <h2 className="filtres-panel__titre">📊 Résumé</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', lineHeight: '1.5' }}>
                    {notifications.length} notification(s) au total<br/>
                    {nonLues} non lue(s)
                </p>
            </aside>
        </div>
    );
}
