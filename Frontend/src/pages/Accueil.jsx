import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar'; // 📦 npm install react-calendar
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import '../styles/Accueil.css'; // pour le style custom

const Accueil = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [date, setDate] = useState(new Date());
  const [absences, setAbsences] = useState([]);

  const idDiv = user?.idDiv;

  useEffect(() => {
    if (idDiv) {
      const mois = date.getMonth() + 1; // Mois JS commence à 0
      const annee = date.getFullYear();

      axios
        .get(`http://localhost:5000/api/accueil/${idDiv}?mois=${mois}&annee=${annee}`)
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
        });
    }
  }, [date]);

  const formatDate = (str) => {
    const d = new Date(str);
    return d.toLocaleDateString('fr-FR');
  };

  return (
    <div className="accueil-container">
      <div className="calendar-box">
        <h2>📅 Calendrier</h2>
        <Calendar onChange={setDate} value={date} />
      </div>

      <div className="absence-box">
        <h2>🧍 Employés absents</h2>
        {absences.length === 0 ? (
          <p>Aucun congé ni permission ce mois</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Type</th>
                <th>Date Demande</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {absences.map((a, i) => (
                <tr key={i}>
                  <td>{a.Nom}</td>
                  <td>{a.Prenom}</td>
                  <td>{a.Type}</td>
                  <td>{formatDate(a.dateDemande)}</td>
                  <td>{formatDate(a.debut)}</td>
                  <td>{formatDate(a.fin)}</td>
                  <td>
                    <button onClick={() => alert("⚙️ Afficher les détails ici")}>
                      Détail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Accueil;
