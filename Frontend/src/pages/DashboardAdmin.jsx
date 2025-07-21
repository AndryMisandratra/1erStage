import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import '../styles/DashboardAdmin.css';

const DashboardAdmin = () => {
    const [absences, setAbsences] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
       /* axios.get('http://localhost:5000/api/absents')
            .then(res => setAbsences(res.data))
            .catch(err => console.error('Erreur absents:', err));
*/
        axios.get('http://localhost:5000/api/notifications')
            .then(res => setNotifications(res.data))
            .catch(err => console.error('Erreur notifications:', err));
    }, []);

    const aujourdHui = new Date().toISOString().split('T')[0];
    const absentsAujourdhui = absences.filter(a => a.date_debut <= aujourdHui && a.date_fin >= aujourdHui);

    return (
        <div className="admin-dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <h2 className="logo">Tribunal</h2>
                <nav>
                    <ul>
                        <li className="active">📅 Tableau de bord</li>
                        <li>👤 Utilisateurs</li>
                        <li>📄 Historique</li>
                        <li>⚙️ Paramètres</li>
                    </ul>
                </nav>
            </aside>

            {/* Contenu principal */}
            <main className="main-content">
                {/* Header */}
                <header className="header">
                    <div>
                        <h1>Gestion des absences</h1>
                        <p>Bienvenue, Administrateur</p>
                    </div>
                    <div className="admin-info">
                        <span className="badge">👨‍⚖️ Admin</span>
                        <button className="logout">Se déconnecter</button>
                    </div>
                </header>

                {/* Corps */}
                <div className="dashboard-body">
                    {/* Calendrier */}
                    <div className="calendar-section">
                        <FullCalendar
                            plugins={[dayGridPlugin]}
                            initialView="dayGridMonth"
                            locale="fr"
                            events={absences.map(abs => ({
                                title: `${abs.nom || ''} ${abs.prenom || ''} (${abs.type})`,
                                start: abs.date_debut,
                                end: abs.date_fin,
                                color: abs.type === 'Congé' ? '#f39c12' : '#2980b9'
                            }))}
                        />
                    </div>

                    {/* Notifications + Absents */}
                    <div className="absence-panel">
                        <h3>🔔 Notifications ({notifications.length})</h3>
                        {notifications.length === 0 ? (
                            <p>Aucune nouvelle demande</p>
                        ) : notifications.map((n, i) => (
                            <div className="absence-card" key={i}>
                                <p><strong>{n.type}</strong> du {n.debut} au {n.fin}</p>
                                {n.lien && (
                                    <a href={`http://localhost:5000${n.lien}`} target="_blank" rel="noopener noreferrer" className="pdf-link">
                                        📄 Voir le fichier
                                    </a>
                                )}
                            </div>
                        ))}

                        <hr style={{ margin: '15px 0', borderColor: '#444' }} />

                        <h3>🧍‍♀️ Absents aujourd'hui</h3>
                        {absentsAujourdhui.length === 0 ? (
                            <p>Aucun absent</p>
                        ) : absentsAujourdhui.map((a, i) => (
                            <div className="absence-card" key={i}>
                                <p><strong>{a.nom} {a.prenom}</strong></p>
                                <p>{a.type} du {a.date_debut} au {a.date_fin}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardAdmin;
