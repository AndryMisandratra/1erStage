import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBell, FaEnvelope, FaCalendarAlt, FaCheck, FaTimes, FaFilePdf } from 'react-icons/fa';
import '../styles/Notification.css';

const Notification = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [conges, setConges] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [retours, setRetours] = useState([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [obsConges, setObsConges] = useState({});
  const [obsPermissions, setObsPermissions] = useState({});


  const idDiv = user?.idDiv;

  useEffect(() => {
    if (idDiv) {
      fetchAllData();
    }
  }, [idDiv]);

  const fetchAllData = async () => {
    try {
      // 📌 1. Demandes en attente
      const demandesRes = await axios.get(`http://192.168.89.95:5000/api/notifications/demandes/${idDiv}`);
      setConges(demandesRes.data.conges || []);
      setPermissions(demandesRes.data.permissions || []);

      // 📌 2. Rappels
      const rappelsRes = await axios.get(`http://192.168.89.95:5000/api/notifications/rappels/${idDiv}`);
      setRetours(rappelsRes.data.retours || []);

      // 📌 3. Compteur global
      const countRes = await axios.get(`http://192.168.89.95:5000/api/notifications/count/${idDiv}`);
      if (countRes.data.success) {
        setNotificationsCount(countRes.data.count);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement des notifications");
    }
  };

  const traiterDemande = async (type, id, statut, observation) => {
    try {
      await axios.put(`http://192.168.89.95:5000/api/notifications/${type}/${id}`, { statut, observation });
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Erreur lors du traitement");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="notification-container">
      <h2><FaBell /> Notifications ({notificationsCount})</h2>

      {/* Section Demandes en attente */}
      <section>
        <h3><FaEnvelope /> Demandes en attente</h3>

        {/* Congés */}
        <h4>Congés :</h4>
        {conges.length === 0 ? (
          <p className="empty-message">Aucune demande de congé en attente</p>
        ) : (
          <table className="notif-table">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Type</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Documents</th>
                <th>Observation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {conges.map((c, i) => (
                <tr key={`conge-${i}`}>
                  <td>{c.Nom} {c.Prenom}</td>
                  <td>{c.TypeC}</td>
                  <td>{formatDate(c.DebC)}</td>
                  <td>{formatDate(c.FinC)}</td>
                  <td>
                    <div className="doc-links">
                      {c.lettre ? (
                        <a href={`http://192.168.89.95:5000${c.lettre}`} target="_blank" rel="noopener noreferrer" className="doc-link">
                            Lettre
                        </a>
                      ) : "-"}
                      {c.justificatifs?.length > 0 && (
                        c.justificatifs.map((j, i) => (
                            <a key={i} href={`http://192.168.89.95:5000${j}`} target="_blank" rel="noopener noreferrer" className="doc-link">
                                Justif. {i + 1}
                            </a>
                        ))
                      )}
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={obsConges[c.IdC] || ''}
                      onChange={(e) => setObsConges({...obsConges, [c.IdC]: e.target.value})}
                    />
                  </td>
                  <td>
                    <button onClick={() => traiterDemande('conge', c.IdC, 'Accepter', obsConges[c.IdC] || '')} className="action-btn approve"><FaCheck /></button>
                    <button onClick={() => traiterDemande('conge', c.IdC, 'Refuser', obsConges[c.IdC] || '')} className="action-btn reject"><FaTimes /></button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Permissions */}
        <h4>Permissions :</h4>
        {permissions.length === 0 ? (
          <p className="empty-message">Aucune demande de permission en attente</p>
        ) : (
          <table className="notif-table">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Type</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Document</th>
                <th>Observation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p, i) => (
                <tr key={`perm-${i}`}>
                  <td>{p.Nom} {p.Prenom}</td>
                  <td>{p.TypeP}</td>
                  <td>{formatDate(p.DebP)}</td>
                  <td>{formatDate(p.FinP)}</td>
                  <td>
                    {p.lettre ? (
                      <a href={`http://192.168.89.95:5000${p.lettre}`} target="_blank" rel="noopener noreferrer" className="doc-link">
                          Lettre
                      </a>
                    ) : '-'}
                  </td>
                  <td>
                    <input
                      type="text"
                      value={obsPermissions[p.IdP] || ''}
                      onChange={(e) => setObsPermissions({...obsPermissions, [p.IdP]: e.target.value})}
                    />
                  </td>
                  <td>
                    <button onClick={() => traiterDemande('permission', p.IdP, 'Accepter', obsPermissions[p.IdP] || '')} className="action-btn approve"><FaCheck /></button>
                    <button onClick={() => traiterDemande('permission', p.IdP, 'Refuser', obsPermissions[p.IdP] || '')} className="action-btn reject"><FaTimes /></button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Section Retours */}
      <section>
        <h3><FaCalendarAlt /> Employés revenant demain</h3>
        {retours.length === 0 ? (
          <p className="empty-message">Aucun retour prévu demain</p>
        ) : (
          <ul className="return-list">
            {retours.map((r, i) => (
              <li key={`retour-${i}`}>
                <strong>{r.Nom} {r.Prenom}</strong> - {r.Type} (retour le {formatDate(r.retour)})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Notification;
