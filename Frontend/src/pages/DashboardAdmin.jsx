import { Outlet, useNavigate } from 'react-router-dom';
import '../styles/DashboardAdmin.css'; // Ton style
import { useEffect, useState } from 'react';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setAdmin(user);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="admin-info">
          <p>{admin?.prenom} {admin?.nom}</p>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
        <ul>
          <li onClick={() => navigate("/DashboardAdmin/acceuil")}>Accueil</li>
          <li onClick={() => navigate("/DashboardAdmin/notification")}>Notification</li>
          <li onClick={() => navigate("/DashboardAdmin/personnel")}>Personnel</li>
        </ul>
      </nav>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardAdmin;
