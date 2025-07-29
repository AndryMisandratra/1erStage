import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Notification.css';

const Notification = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [conges, setConges] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [retours, setRetours] = useState([]);

  const idDiv = user?.idDiv;

  useEffect(() => {
    if (idDiv) {
      fetchNotifications();
    }
  }, [idDiv]);

  const fetchNotifications = async () => {
    try {
      const demandes = await axios.get(`http://localhost:5000/api/notifications/demandes/${idDiv}`);
      setConges(demandes.data.conges);
      setPermissions(demandes.data.permissions);

      const rappels = await axios.get(`http://localhost:5000/api/notifications/rappels/${idDiv}`);
      setRetours(rappels.data.retours);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement des notifications");
    }
  };

  const traiterDemande = async (type, id, statut) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${type}/${id}`, { statut });
      fetchNotifications();
    } catch (err) {
      console.error(err);
      alert("Erreur lors du traitement");
    }
  };

  return (
    <div className="notification-container">
      <h2>🔔 Notifications</h2>

      <section>
        <h3>📮 Demandes en attente</h3>
        <h4>Congés :</h4>
        {conges.length === 0 ? <p>Aucune demande de congé</p> : (
          <ul>
            {conges.map((c, i) => (
              <li key={i}>
                {c.Nom} {c.Prenom} - {c.TypeC} du {c.DebC} au {c.FinC}
                <button onClick={() => traiterDemande('conge', c.IdC, 'Accepter')}>Accepter</button>
                <button onClick={() => traiterDemande('conge', c.IdC, 'Refuser')}>Refuser</button>
              </li>
            ))}
          </ul>
        )}

        <h4>Permissions :</h4>
        {permissions.length === 0 ? <p>Aucune permission en attente</p> : (
          <ul>
            {permissions.map((p, i) => (
              <li key={i}>
                {p.Nom} {p.Prenom} - {p.TypeP} du {p.DebP} au {p.FinP}
                <button onClick={() => traiterDemande('permission', p.IdP, 'Accepter')}>Accepter</button>
                <button onClick={() => traiterDemande('permission', p.IdP, 'Refuser')}>Refuser</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>📅 Employés revenant demain :</h3>
        {retours.length === 0 ? <p>Aucun retour prévu demain</p> : (
          <ul>
            {retours.map((r, i) => (
              <li key={i}>{r.Nom} {r.Prenom} - {r.Type} (retour le {r.retour})</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Notification;

