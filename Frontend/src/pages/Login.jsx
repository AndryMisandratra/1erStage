import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
    const [nomUtil, setNomUtil] = useState('');
    const [mdp, setMdp] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validation côté client
        if (!nomUtil.trim() || !mdp.trim()) {
            setError('Tous les champs sont obligatoires');
            return;
        }

        const result = await login(nomUtil, mdp);
        
        if (result.success) {
            navigate(result.isAdmin ? '/DashboardAdmin' : '/DashboardEmployer');
        } else {
            setError(result.message || 'Échec de la connexion');
        }
    };

    return (
        <div>
            <div>


                <h2>
                Tribunal Financier - Connexion
                </h2>

                {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                    {error}
                </div>
                )}

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                    <label htmlFor="nomUtil" className="block text-sm font-medium text-[#2c3e50]">
                        Nom d'utilisateur
                    </label>
                    <input
                        id="nomUtil"
                        name="nomUtil"
                        type="text"
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2980b9] focus:border-[#2980b9]"
                        value={nomUtil}
                        onChange={(e) => setNomUtil(e.target.value)}
                    />
                    </div>

                    <div>
                    <label htmlFor="mdp" className="block text-sm font-medium text-[#2c3e50]">
                        Mot de passe
                    </label>
                    <input
                        id="mdp"
                        name="mdp"
                        type="password"
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2980b9] focus:border-[#2980b9]"
                        value={mdp}
                        onChange={(e) => setMdp(e.target.value)}
                    />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-md bg-[#2c3e50] text-white font-medium hover:bg-[#34495e] transition duration-200"
                >
                    Se connecter
                </button>
                </form>

                <div className="text-center mt-4">
                <a
                    href="/password-reset"
                    className="text-[#2980b9] hover:underline text-sm"
                    onClick={(e) => {
                    e.preventDefault();
                    navigate('/password-reset');
                    }}
                >
                    Mot de passe oublié ?
                </a>
                </div>

                <div className="text-center mt-2">
                <a
                    href="/create-account"
                    className="text-[#2980b9] hover:underline text-sm"
                    onClick={(e) => {
                    e.preventDefault();
                    navigate('/create-account');
                    }}
                >
                    Créer un compte
                </a>
                </div>
            </div>
            </div>

    );
};

export default Login;