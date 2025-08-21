import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiHome, FiBell, FiUsers, FiLogOut, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import '../styles/DashboardAdmin.css';

const DashboardAdmin = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const location = useLocation();
    const [admin, setAdmin] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationsCount, setNotificationsCount] = useState(0);


  const idDiv = user?.idDiv;

  useEffect(() => {
    if (idDiv) {
      fetchAllData();
    }
  }, [idDiv]);

  const fetchAllData = async () => {
    try {
      const countRes = await axios.get(`http://192.168.89.95:5000/api/notifications/count/${idDiv}`);
      if (countRes.data.success) {
        setNotificationsCount(countRes.data.count);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement des notifications");
    }
  };


    useEffect(() => {
        
        if (!user || !user.isAdmin) {
          navigate("/login");
        } else {
          setAdmin(user);
        }
    }, [navigate]);

    const handleLogout = () => {
      localStorage.clear();
      navigate("/login");
    };

    const isActive = (path) => location.pathname.includes(path);

    const navItems = [
        { path: 'acceuil', icon: <FiHome />, label: 'Accueil' },
        { path: 'notification', icon: <FiBell />, label: 'Notifications', badge: notificationsCount },
        { path: 'personnel', icon: <FiUsers />, label: 'Gestion du Personnel' },
    ];

    return (
        // Remplacer la partie navigation par :
        <div className="admin-dashboard">
          {/* Top Navigation Bar */}
          <nav className="top-nav-admin">
            <div className="nav-admin-left">
              <div className="admin-avatar">
                {admin?.prenom?.charAt(0)}{admin?.nom?.charAt(0)}
              </div>
              <h1>{user.prenom}</h1>
            </div>
            
            <div className="nav-admin-center">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  className={`nav-admin-btn ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(`/DashboardAdmin/${item.path}`)}
                >
                  <span className="nav-admin-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="notification-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
            
            <button className="logout-admin-btn" onClick={handleLogout}>
              <FiLogOut className="nav-admin-icon" />
              <span>Déconnexion</span>
            </button>
          </nav>

          {/* Main Content */}
          <main className="admin-main">
            <div className="admin-content">
              <Outlet />
            </div>
          </main>
        </div>
    );
};

export default DashboardAdmin;