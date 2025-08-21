import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PasswordReset.css';

const PasswordReset = () => {
    const [formData, setFormData] = useState({
        nomUtil: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            const response = await axios.post('http://192.168.89.95:5000/api/password/reset', {
                nomUtil: formData.nomUtil,
                newPassword: formData.newPassword
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la réinitialisation');
        }
    };

    return (
        <div className="password-reset-container">
            <div className="password-reset-card">
                <h2 className="password-reset-title">
                    <span className="password-reset-icon">🔒</span>
                    Réinitialisation du mot de passe
                </h2>

                {error && (
                    <div className="password-reset-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {success ? (
                    <div className="password-reset-success">
                        ✅ Mot de passe modifié avec succès!<br/>
                        Redirection vers la page de connexion...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="password-reset-form">
                        <div className="password-reset-form-group">
                            <label htmlFor="nomUtil">Nom d'utilisateur</label>
                            <input
                                id="nomUtil"
                                name="nomUtil"
                                type="text"
                                required
                                maxLength={10}
                                value={formData.nomUtil}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="password-reset-form-group">
                            <label htmlFor="newPassword">Nouveau mot de passe</label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                required
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                            <small className="password-reset-hint">
                                Tous les caractères sont acceptés (espaces inclus)
                            </small>
                        </div>

                        <div className="password-reset-form-group">
                            <label htmlFor="confirmPassword">Confirmation</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="password-reset-submit">
                            Modifier le mot de passe
                        </button>

                        <div className="password-reset-footer">
                            <button 
                                type="button"
                                className="password-reset-link"
                                onClick={() => navigate('/login')}
                            >
                                ← Retour à la connexion
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PasswordReset;