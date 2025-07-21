import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PasswordReset.css';

const PasswordReset = () => {
    const [nomUtil, setNomUtil] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/password/reset', {
                nomUtil,
                newPassword
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
        <div className="reset-container">
            <div className="reset-card">
                <h2 className="reset-title">Réinitialisation du mot de passe</h2>

                {error && <div className="reset-error">{error}</div>}

                {success && (
                    <div className="reset-success">
                        Mot de passe modifié avec succès! Redirection vers la page de connexion...
                    </div>
                )}

                {!success && (
                    <form className="reset-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nomUtil">Nom d'utilisateur</label>
                            <input
                                id="nomUtil"
                                name="nomUtil"
                                type="text"
                                required
                                maxLength={10}
                                value={nomUtil}
                                onChange={(e) => setNomUtil(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">Nouveau mot de passe</label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <small className="hint">Tous les caractères sont acceptés (espaces inclus)</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="reset-button">
                            Modifier le mot de passe
                        </button>

                        <div className="reset-footer">
                            <a
                                href="/login"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/login');
                                }}
                            >
                                Se connecter
                            </a>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PasswordReset;