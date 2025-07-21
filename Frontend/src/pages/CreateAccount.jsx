import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateAccount = () => {
    const [matricule, setMatricule] = useState('');
    const [nomUtil, setNomUtil] = useState('');
    const [mdp, setMdp] = useState('');
    const [confirmMdp, setConfirmMdp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (mdp !== confirmMdp) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/account/create', {
                matricule,
                nomUtil,
                mdp
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création du compte');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Création de compte
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        Compte créé avec succès! Redirection...
                    </div>
                )}

                {!success && (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label htmlFor="matricule" className="block text-sm font-medium text-gray-700">
                                    Matricule
                                </label>
                                <input
                                    id="matricule"
                                    name="matricule"
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={matricule}
                                    onChange={(e) => setMatricule(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="nomUtil" className="block text-sm font-medium text-gray-700">
                                    Nom d'utilisateur (max 10 caractères)
                                </label>
                                <input
                                    id="nomUtil"
                                    name="nomUtil"
                                    type="text"
                                    maxLength="10"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={nomUtil}
                                    onChange={(e) => setNomUtil(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Sensible à la casse (ex: "User123" ≠ "user123")
                                </p>
                            </div>
                            <div>
                                <label htmlFor="mdp" className="block text-sm font-medium text-gray-700">
                                    Mot de passe
                                </label>
                                <input
                                    id="mdp"
                                    name="mdp"
                                    type="password"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={mdp}
                                    onChange={(e) => setMdp(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmMdp" className="block text-sm font-medium text-gray-700">
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    id="confirmMdp"
                                    name="confirmMdp"
                                    type="password"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={confirmMdp}
                                    onChange={(e) => setConfirmMdp(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Créer le compte
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center mt-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                        Déjà un compte? Se connecter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateAccount;