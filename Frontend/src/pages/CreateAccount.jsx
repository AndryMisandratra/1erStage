import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateAccount.css';

const CreateAccount = () => {
    const [formData, setFormData] = useState({
        matricule: '',
        nomUtil: '',
        mdp: '',
        confirmMdp: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0,6);
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setFormData({ ...formData, matricule: digitsOnly });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.mdp !== formData.confirmMdp) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            // Simulation de création de compte
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError('Erreur lors de la création du compte');
        }
    };

    return (
        <div className="create-account-container">
            <div className="create-account-card">
                <h2 className="create-account-title">
                    <span className="create-account-icon">👤</span>
                    Création de compte
                </h2>

                {error && (
                    <div className="create-account-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {success ? (
                    <div className="create-account-success">
                        ✅ Compte créé avec succès!<br/>
                        Redirection vers la page de connexion...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="create-account-form">
                        <div className="create-account-form-group">
                            <label htmlFor="matricule">Matricule</label>
                            <input
                                id="matricule"
                                name="matricule"
                                type="text"
                                required
                                value={formData.matricule}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="create-account-form-group">
                            <label htmlFor="nomUtil">Nom d'utilisateur (max 10 caractères)</label>
                            <input
                                id="nomUtil"
                                name="nomUtil"
                                type="text"
                                maxLength="10"
                                required
                                value={formData.nomUtil}
                                onChange={handleChange}
                            />
                            <small className="create-account-hint">
                                Sensible à la casse (ex: "User123" ≠ "user123")
                            </small>
                        </div>

                        <div className="create-account-form-group">
                            <label htmlFor="mdp">Mot de passe</label>
                            <input
                                id="mdp"
                                name="mdp"
                                type="password"
                                required
                                value={formData.mdp}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="create-account-form-group">
                            <label htmlFor="confirmMdp">Confirmation</label>
                            <input
                                id="confirmMdp"
                                name="confirmMdp"
                                type="password"
                                required
                                value={formData.confirmMdp}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="create-account-submit">
                            Créer le compte
                        </button>
                    </form>
                )}

                <div className="create-account-footer">
                    <button 
                        type="button"
                        className="create-account-link"
                        onClick={() => navigate('/login')}
                    >
                        Déjà un compte? Se connecter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateAccount;