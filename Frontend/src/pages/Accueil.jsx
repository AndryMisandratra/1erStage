import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { FiCalendar, FiUser, FiClock, FiEye, FiChevronDown } from 'react-icons/fi';
import '../styles/Accueil.css';

const Accueil = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [date, setDate] = useState(new Date());
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);

  const idDiv = user?.idDiv;

  useEffect(() => {
    if (idDiv) {
      setLoading(true);
      const mois = date.getMonth() + 1;
      const annee = date.getFullYear();

      axios
        .get(`http://192.168.89.95:5000/api/accueil/${idDiv}?mois=${mois}&annee=${annee}`)
        .then((res) => {
          if (res.data.success) {
            setAbsences(res.data.data);
          } else {
            alert('Erreur chargement absences');
          }
        })
        .catch((err) => {
          console.error(err);
          alert('Erreur serveur');
        })
        .finally(() => setLoading(false));
    }
  }, [date, idDiv]);

  const formatDate = (str) => {
    const d = new Date(str);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayAbsences = absences.filter(a => {
        const d = new Date(a.debut);
        return d.getDate() === date.getDate() && 
               d.getMonth() === date.getMonth() && 
               d.getFullYear() === date.getFullYear();
      });
      
      return dayAbsences.length > 0 ? (
        <div className="calendar-day-marker"></div>
      ) : null;
    }
  };

  return (
    <div className="accueil-admin">
      <div className="dashboard-content">
        <div className="calendar-section">
          <div className="calendar-card">
            <div className="card-header">
              <h2><FiCalendar /> Calendrier des absences</h2>
              <div className="date-range">
                {date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            
            <Calendar
              onChange={setDate}
              value={date}
              tileContent={tileContent}
              className="custom-calendar"
              nextLabel={<FiChevronDown className="rotate-270" />}
              prevLabel={<FiChevronDown className="rotate-90" />}
              navigationLabel={({ date }) => (
                <span>{date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
              )}
            />
          </div>
        </div>

        <div className="absences-section">
          <div className="absences-card">
            <div className="card-header">
              <h2><FiUser /> Absences du mois</h2>
              <div className="badge">{absences.length}</div>
            </div>

            {loading ? (
              <div className="loading-spinner">Chargement...</div>
            ) : absences.length === 0 ? (
              <div className="empty-state">
                <p>Aucune absence prévue ce mois-ci</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="absences-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Type</th>
                      <th>Demandé le</th>
                      <th>Début</th>
                      <th>Fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absences.map((a, i) => (
                      <tr key={i} className={a.Type === 'Congé' ? 'type-conge' : 'type-permission'}>
                        <td>{a.Nom}</td>
                        <td>{a.Prenom}</td>
                        <td>
                          <span className={`type-badge ${a.Type === 'Congé' ? 'conge' : 'permission'}`}>
                            {a.Type}
                          </span>
                        </td>
                        <td>{formatDate(a.dateDemande)}</td>
                        <td><FiClock /> {formatDate(a.debut)}</td>
                        <td><FiClock /> {formatDate(a.fin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accueil;