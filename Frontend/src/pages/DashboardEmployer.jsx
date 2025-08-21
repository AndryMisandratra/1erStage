import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSignOutAlt, FaHome, FaHistory, FaUmbrellaBeach, FaClock } from 'react-icons/fa';
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
            axios.get(`http://192.168.89.95:5000/api/historique/${user.matricule}`)
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
        <div className="employer-dashboard">
            {/* Top Navigation Bar */}
            <nav className="top-nav">
                <div className="nav-left">
                    <h1>Espace Employé</h1>
                </div>
                <div className="nav-center">
                    <button 
                        className={`nav-btn ${activeTab === 'accueil' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('accueil')}
                    >
                        <FaHome className="nav-icon" />
                        <span>Accueil</span>
                    </button>
                    <button 
                        className={`nav-btn ${activeTab === 'historique' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('historique')}
                    >
                        <FaHistory className="nav-icon" />
                        <span>Historique</span>
                    </button>
                </div>
                <div className="nav-right">
                    <div className="user-info">
                        <span className="user-name">{userData?.prenom} {userData?.nom}</span>
                        <button onClick={handleLogout} className="logout-btn">
                            <FaSignOutAlt className="logout-icon" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="employer-main">
                {activeTab === 'accueil' && (
                    <div className="dashboard-home">
                        <h2 className="welcome-title">Bienvenue, {userData?.prenom} !</h2>
                        <p className="welcome-subtitle">Que souhaitez-vous faire aujourd'hui ?</p>
                        
                        <div className="action-cards">
                            <div className="action-card" onClick={() => navigate('/demande-conge')}>
                                <div className="card-icon">
                                    <FaUmbrellaBeach />
                                </div>
                                <h3>Demander un Congé</h3>
                                <p>Soumettre une nouvelle demande de congé</p>
                            </div>

                            <div className="action-card" onClick={() => navigate('/demande-permission')}>
                                <div className="card-icon">
                                    <FaClock />
                                </div>
                                <h3>Demander une Permission</h3>
                                <p>Soumettre une demande de permission d'absence</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'historique' && (
                    <div className="history-section">
                        <div className="section-header">
                            <h2>Historique des Demandes</h2>
                            <p>Consultez l'état de vos demandes précédentes</p>
                        </div>

                        {historique.length === 0 ? (
                            <div className="empty-state">
                                <p>Aucune demande trouvée dans votre historique.</p>
                            </div>
                        ) : (
                            <div className="history-table-container">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th className="type-col">Type</th>
                                            <th className="category-col">Catégorie</th>
                                            <th className="date-col">Date Demande</th>
                                            <th className="date-col">Début</th>
                                            <th className="date-col">Fin</th>
                                            <th className="days-col">Jours</th>
                                            <th className="status-col">Statut</th>
                                            <th className="obs-col">Observation</th>
                                            <th className="docs-col">Documents</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historique.map((item, index) => (
                                            <tr key={index}>
                                                <td className="type-col" data-label="Type">{item.type}</td>
                                                <td className="category-col" data-label="Catégorie">{item.TypeC || '-'}</td>
                                                <td className="date-col" data-label="Date Demande">{item.date_demande}</td>
                                                <td className="date-col" data-label="Début">{item.debut}</td>
                                                <td className="date-col" data-label="Fin">{item.fin}</td>
                                                <td className="days-col" data-label="Jours">{item.jours}</td>
                                                <td className="status-col" data-label="Statut">
                                                    <span className={`status-badge ${
                                                        item.statut.toLowerCase() === 'rejeté' ? 'rejected' :
                                                        item.statut.toLowerCase() === 'approuvé' ? 'approved' :
                                                        'pending'
                                                    }`}>
                                                        {item.statut}
                                                    </span>
                                                </td>
                                                <td className="obs-col" data-label="Observation">
                                                    {item.Observation || "Aucune"}
                                                </td>
                                                <td className="docs-col" data-label="Documents">
                                                    <div className="document-links">
                                                        {item.lettre ? (
                                                            <a href={`http://192.168.89.95:5000${item.lettre}`} target="_blank" rel="noopener noreferrer" className="doc-link">
                                                                Lettre
                                                            </a>
                                                        ) : "-"}
                                                        {item.justificatifs?.length > 0 && (
                                                            item.justificatifs.map((j, i) => (
                                                                <a key={i} href={`http://192.168.89.95:5000${j}`} target="_blank" rel="noopener noreferrer" className="doc-link">
                                                                    Justif. {i + 1}
                                                                </a>
                                                            ))
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardEmployer;