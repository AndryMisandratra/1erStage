import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Login.css'; // Import classique

const Login = () => {
    const [credentials, setCredentials] = useState({
        nomUtil: '',
        mdp: ''
    });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!credentials.nomUtil.trim() || !credentials.mdp.trim()) {
            setError('Tous les champs sont obligatoires');
            return;
        }

        const result = await login(credentials.nomUtil, credentials.mdp);
        if (result.success) {
            navigate(result.isAdmin ? '/DashboardAdmin' : '/DashboardEmployer');
        } else {
            setError(result.message || 'Identifiants incorrects');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2 className="login-title">
                        <span className="login-logo">⚖️</span>
                        Tribunal Financier
                    </h2>
                    <p className="login-subtitle">Portail de gestion des congés</p>
                </div>

                {error && (
                    <div className="login-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-form-group">
                        <label htmlFor="nomUtil">Nom d'utilisateur</label>
                        <input
                            id="nomUtil"
                            name="nomUtil"
                            type="text"
                            value={credentials.nomUtil}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="mdp">Mot de passe</label>
                        <input
                            id="mdp"
                            name="mdp"
                            type="password"
                            value={credentials.mdp}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="login-submit">
                        Se connecter
                    </button>
                </form>

                <div className="login-links">
                    <button onClick={() => navigate('/password-reset')}>
                        Mot de passe oublié ?
                    </button>
                    <button onClick={() => navigate('/create-account')}>
                        Créer un compte
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;