import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';

export const PrivateRoute = ({ children, requiredAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);

  if (loading) return <div>Chargement...</div>;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (requiredAdmin && !isAdmin) return <Navigate to="/DashboardEmployer" />;
  
  return children;
};