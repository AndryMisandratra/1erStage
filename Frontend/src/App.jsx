import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/Authcontext';
import { useContext, useState, useEffect } from 'react';
import SplashScreen from "./pages/SplashScreen";
import Login from './pages/Login';
import PasswordReset from './pages/PasswordReset';
import DemandeConge from './pages/DemandeConge';
import DemandePermission from './pages/DemandePermission';
import CreateAccount from './pages/CreateAccount';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardEmployer from './pages/DashboardEmployer';
import Accueil from "./pages/Accueil";
import Notification from "./pages/Notification";
import Personnel from "./pages/Personnel";

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  // Timer pour cacher le splash screen après 3 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      {showSplash ? (
        <SplashScreen />
      ) : (
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/demande-conge" element={<DemandeConge />} />
            <Route path="/demande-permission" element={<DemandePermission />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/" element={<Navigate to="/login" />} />

            {/* 👨‍💼 ROUTES ADMIN */}
            <Route path="/DashboardAdmin" element={
              <PrivateRoute requiredAdmin={true}>
                <DashboardAdmin />
              </PrivateRoute>
            }>
              <Route path="acceuil" element={<Accueil />} />
              <Route path="notification" element={<Notification />} />
              <Route path="personnel" element={<Personnel />} />
            </Route>

            {/* 👷 ROUTES EMPLOYÉ */}
            <Route path="/DashboardEmployer" element={
              <PrivateRoute>
                <DashboardEmployer />
              </PrivateRoute>
            } />
          </Routes>
        </Router>
      )}
    </AuthProvider>
  );
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) return <div>Chargement...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const DashboardSwitch = () => {
  const { isAdmin } = useContext(AuthContext);
  
  return isAdmin ? <DashboardAdmin /> : <DashboardEmployer />;
};

export default App;
