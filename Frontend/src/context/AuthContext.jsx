import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const userData = JSON.parse(localStorage.getItem('user'));
            setUser(userData);
            setIsAuthenticated(true);
            setIsAdmin(userData?.isAdmin || false);
        }
        setLoading(false);
    }, []);

    // Modifiez la fonction login dans votre AuthContext
        const login = async (nomUtil, mdp) => {
            try {
                const res = await axios.post('http://localhost:5000/api/auth/login', { 
                    nomUtil, 
                    mdp 
                });
                
                const userData = {
                    ...res.data.user,
                    isAdmin: res.data.isAdmin
                };
                
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                setUser(userData);
                setIsAuthenticated(true);
                setIsAdmin(res.data.isAdmin);
                
                return { 
                    success: true, 
                    isAdmin: res.data.isAdmin 
                };
            } catch (err) {
                return { 
                    success: false, 
                    message: err.response?.data?.message || 'Erreur de connexion' 
                };
            }
        };


    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};