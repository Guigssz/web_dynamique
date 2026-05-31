// ── APP PRINCIPALE — Routeur hash + État centralisé (panier) ──

function App() {
    const { user } = React.useContext(AuthContext);
    const [hash, setHash] = React.useState(window.location.hash || '#/');
    const [panier, setPanier] = React.useState([]);
    const [destinationActive, setDestinationActive] = React.useState(null);

    const chargerPanier = () => {
        if (!user) {
            setPanier([]);
            return;
        }
        fetch('./api/panier/get.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(data => {
                if (data && data.items) {
                    const formatted = data.items.map(item => ({
                        id: item.id,
                        genre: item.type === 'hebergement' ? '🏨 Hébergement' : item.type === 'transport' ? '✈️ Transport' : item.type === 'activite' ? '🎭 Activité' : '🌍 Destination',
                        nom: item.nom_item,
                        prix: item.prix,
                        details: item.type === 'hebergement' ? `Du ${item.date_debut} au ${item.date_fin}` : item.type === 'transport' ? 'Trajet' : item.type === 'activite' ? 'Excursion' : 'Destination principale',
                        type: item.type,
                        ref_id: item.ref_id
                    }));
                    setPanier(formatted);

                    // Retrouver la destination active s'il y en a une dans le panier
                    const dest = formatted.find(item => item.genre === '🌍 Destination');
                    if (dest) {
                        setDestinationActive({ id: dest.ref_id, nom: dest.nom, genre: '🌍 Destination' });
                    }
                }
            })
            .catch(err => console.error('Erreur chargement panier :', err));
    };

    React.useEffect(() => {
        chargerPanier();
    }, [user]);

    React.useEffect(() => {
        const onHashChange = () => setHash(window.location.hash || '#/');
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    const ajouterAuPanier = (element) => {
        if (element.genre === '🌍 Destination') {
            setDestinationActive(element);
        }

        if (!user) {
            setPanier(prev => [...prev, element]);
            alert(`🛒 Ajouté à l'itinéraire : "${element.nom}" !`);
            return;
        }

        fetch('./api/panier/add.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                type: element.type,
                ref_id: element.ref_id,
                prix: element.prix,
                date_debut: element.date_debut || null,
                date_fin: element.date_fin || null
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(`🛒 Ajouté à l'itinéraire : "${element.nom}" !`);
                chargerPanier();
            } else {
                alert(`❌ Erreur : ${data.error}`);
            }
        })
        .catch(err => alert(`❌ Erreur réseau : ${err.message}`));
    };

    const supprimerDuPanier = (indexASupprimer) => {
        const itemASupprimer = panier[indexASupprimer];
        if (!user || !itemASupprimer.id) {
            setPanier(prev => prev.filter((_, idx) => idx !== indexASupprimer));
            return;
        }

        fetch('./api/panier/remove.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ item_id: itemASupprimer.id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                chargerPanier();
            } else {
                alert(`❌ Erreur : ${data.error}`);
            }
        })
        .catch(err => console.error(err));
    };

    const validerPanier = () => {
        if (!user) {
            alert("⚠️ Connectez-vous pour valider votre itinéraire !");
            return;
        }

        fetch('./api/panier/validate.php', {
            method: 'POST',
            credentials: 'same-origin'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(`🚀 ${data.message}\nTotal débité : ${data.montant_total}€`);
                setPanier([]);
                setDestinationActive(null);
                window.location.hash = '#/notifications';
            } else {
                alert(`❌ Erreur : ${data.error}`);
            }
        })
        .catch(err => alert(`❌ Erreur réseau : ${err.message}`));
    };

    const renderContent = () => {
        switch(hash) {
            case '#/':
            case '#/explorer':     return <ExplorerPage onAjouter={ajouterAuPanier} destinationActive={destinationActive} />;
            case '#/hebergements': return <HebergementsPage onAjouter={ajouterAuPanier} destinationActive={destinationActive} />;
            case '#/transports':   return <TransportsPage onAjouter={ajouterAuPanier} destinationActive={destinationActive} />;
            case '#/activites':    return <ActivitesPage onAjouter={ajouterAuPanier} destinationActive={destinationActive} />;
            case '#/itineraire':   return <ItinerairePage panier={panier} onSupprimer={supprimerDuPanier} onValider={validerPanier} />;
            case '#/profil':       return <ProfilePage />;
            case '#/admin':        return <AdminPage />;
            case '#/notifications':return <NotificationsPage />;
            case '#/reservations': return <ReservationsPage />;
            default: return <div style={{padding:'30px'}}><h2>En construction</h2><p>Ce module arrive bientôt.</p></div>;
        }
    };

    return (
        <div className="app">
            <Navbar />
            {renderContent()}
        </div>
    );
}

// ── Point d'entrée React ──
ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <App />
    </AuthProvider>
);
