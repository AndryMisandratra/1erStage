import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DashboardEmployer.css';

const DashboardEmployer = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('accueil');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setUserData(user);
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
                            onMouseOver={e => e.currentTarget.classList.add('hover-effect')}
                            onMouseOut={e => e.currentTarget.classList.remove('hover-effect')}
                        >
                            <h2>Demander un Congé</h2>
                            <p>Cliquez pour faire une demande de congé</p>
                        </div>
                        
                        <div 
                            className="action-card"
                            onClick={() => navigate('/demande-permission')}
                            onMouseOver={e => e.currentTarget.classList.add('hover-effect')}
                            onMouseOut={e => e.currentTarget.classList.remove('hover-effect')}
                        >
                            <h2>Demander une Permission</h2>
                            <p>Cliquez pour faire une demande de permission</p>
                        </div>
                    </div>
                )}

                {activeTab === 'historique' && (
                    <div className="history-container">
                        <h2>Historique des Demandes</h2>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardEmployer;