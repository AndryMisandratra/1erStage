import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/DashboardEmployer.css';

const DashboardEmployer = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('accueil');
    const [userData, setUserData] = useState(null);
    const [historique, setHistorique] = useState([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setUserData(user);

        if (user?.matricule) {
            axios.get(`http://localhost:5000/api/historique/${user.matricule}`)
                .then(res => {
                    if (res.data.success) setHistorique(res.data.data);
                    else alert('Erreur de récupération des historiques');
                })
                .catch(err => {
                    console.error(err);
                    alert('Erreur serveur lors du chargement de l\'historique');
                });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Tableau de Bord Employé</h1>
                <div className="user-info">
                    <span>{userData?.prenom} {userData?.nom}</span>
                    <button onClick={handleLogout} className="logout-btn">Déconnexion</button>
                </div>
            </header>

            <nav className="dashboard-nav">
                <button 
                    className={activeTab === 'accueil' ? 'active' : ''}
                    onClick={() => setActiveTab('accueil')}
                >
                    Accueil
                </button>
                <button 
                    className={activeTab === 'historique' ? 'active' : ''}
                    onClick={() => setActiveTab('historique')}
                >
                    Historique
                </button>
            </nav>

            <main className="dashboard-main">
                {activeTab === 'accueil' && (
                    <div className="actions-container">
                        <div 
                            className="action-card" 
                            onClick={() => navigate('/demande-conge')}
                        >
                            <h2>Demander un Congé</h2>
                            <p>Cliquez pour faire une demande de congé</p>
                        </div>
                        
                        <div 
                            className="action-card"
                            onClick={() => navigate('/demande-permission')}
                        >
                            <h2>Demander une Permission</h2>
                            <p>Cliquez pour faire une demande de permission</p>
                        </div>
                    </div>
                )}

                {activeTab === 'historique' && (
                    <div className="history-container">
                        <h2>Historique des Demandes</h2>

                        {historique.length === 0 ? (
                            <p>Aucune demande trouvée.</p>
                        ) : (
                            <table className="historique-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Catégorie</th>
                                        <th>Date Demande</th>
                                        <th>Début</th>
                                        <th>Fin</th>
                                        <th>Jours</th>
                                        <th>Statut</th>
                                        <th>Lettre</th>
                                        <th>Justificatifs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historique.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.type}</td>
                                            <td>{item.TypeC}</td>
                                            <td>{item.date_demande}</td>
                                            <td>{item.debut}</td>
                                            <td>{item.fin}</td>
                                            <td>{item.jours}</td>
                                            <td>{item.statut}</td>
                                            <td>
                                                {item.lettre ? (
                                                    <a
                                                        href={`http://localhost:5000${item.lettre}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Voir
                                                    </a>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td>
                                                {item.justificatifs?.length > 0 ? (
                                                    item.justificatifs.map((j, i) => (
                                                        <div key={i}>
                                                            <a
                                                                href={`http://localhost:5000${j}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                Titre {i + 1}
                                                            </a>
                                                        </div>
                                                    ))
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
};

export default DashboardEmployer;
