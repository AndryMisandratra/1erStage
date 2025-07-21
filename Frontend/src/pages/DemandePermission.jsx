import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import '../styles/DemandePermission.css';

const DemandePermission = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [formData, setFormData] = useState({
        TypeP: 'Permission d\'absence',
        DateDemPerm: new Date().toISOString().split('T')[0],
        DebP: '',
        FinP: '',
        NbrjP: 0,
        Motif: '',
        LienPerm: '',
        Matricule: user.matricule,
        StatueP: 'En attente'
    });

    // Calcul du nombre de jours
    useEffect(() => {
        if (formData.DebP && formData.FinP) {
            const debut = new Date(formData.DebP);
            const fin = new Date(formData.FinP);
            const jours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
            
            if (jours > 3) {
                alert('La permission ne peut excéder 3 jours');
                setFormData(prev => ({ ...prev, FinP: '', NbrjP: 0 }));
            } else {
                setFormData(prev => ({ ...prev, NbrjP: jours }));
            }
        }
    }, [formData.DebP, formData.FinP]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Vérification du type
        if (file.type !== 'application/pdf') {
            alert('Veuillez sélectionner un fichier PDF');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setFormData(prev => ({
                    ...prev,
                    LienPerm: response.data.path
                }));
                alert('Fichier téléversé avec succès!');
            }
        } catch (error) {
            console.error('Erreur détaillée:', {
                error: error.message,
                response: error.response?.data,
                config: error.config
            });
            alert(`Échec du téléversement: ${error.response?.data?.error || error.message}`);
        }
    };


    const genererLettre = () => {
        try {
            const doc = new jsPDF();
            
            // Configuration de base
            doc.setFont('Times', 'Normal');
            doc.setFontSize(12);
            let y = 20
            // Vérification et conversion des dates
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                return isNaN(date) ? dateStr : date.toLocaleDateString('fr-FR');
            };

            // En-tête
            doc.text(`Antananarivo, ${formatDate(formData.DateDemPerm) || ''}`, 110, y);
            
            // Destinataire
            const destinataire = user.IdDiv === 1 ?
                'Madame LA COMMISSAIRE FINANCIER DU TRIBUNAL FINANCIER D\'ANTANANARIVO':
                'Monsieur LE PRESIDENT DU TRIBUNAL FINANCIER D\'ANTANANARIVO' ;

            // Coordonnées de l'expéditeur
            const expediteur = [
                `               ${user.nom} ${user.prenom}, IM : ${user.matricule}`,
                `         ${user.corps}`,
                '                                           à                  ',
                destinataire.split(" ").slice(0, 6).join(" "),
                `                           ${destinataire.split(" ").slice(6, 8).join(" ")}`,           
            ];
            
            expediteur.forEach((line, index) => {
                if (line) doc.text(line, 85, 30 + (index * 8));
            });

            // Objet
            doc.setFontSize(12);
            const objet = `OBJET : demande de permission d'absence de ${formData.NbrjP} jours.`;
            if (objet) doc.text(objet, 15, 95);

            // Corps de la lettre
            doc.setFontSize(12);
            const corps = [
                `   ${destinataire.split(' ').slice(0, 3).join(" ")},`,
                `       J'ai l'honneur de solliciter votre haute bienveillance de bien vouloir`,
                `accorder ma demande de permission d'absence de ${formData.NbrjP} jours,`,
                `pour raison ${formData.Motif || 'raison personnelle'}, du ${formatDate(formData.DebP)} au ${formatDate(formData.FinP)}.`
            ];
            
            corps.forEach((line, index) => {
                if (line) doc.text(line, 60, 120 + (index * 8));
            });

            // Formule de politesse
            const politesse = [
                `Veuillez agréer, ${destinataire.split(' ').slice(0, 3).join(" ")}, l'expression de ma très`,
                `haute considération.`,
                `                                                           L'INTERESSE,`,
                
            ];
            
            politesse.forEach((line, index) => {
                if (line) doc.text(line, 60, 160 + (index * 8));
            });
            doc.text(`${user.nom} ${user.prenom}`, 110,200);

            // Sauvegarde du PDF
            doc.save(`demande_permission_${user.matricule}_${formatDate(formData.DateDemPerm)}.pdf`);
        } catch (err) {
            console.error('Erreur génération PDF:', err);
            alert('Erreur lors de la génération du PDF');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Vérification du nombre de jours
        if (formData.NbrjP > 3) {
            alert('La permission ne peut excéder 3 jours');
            return;
        }

        // Vérification que le fichier est bien téléversé
        if (!formData.LienPerm) {
            alert("Veuillez téléverser votre demande en PDF avant d'envoyer.");
            return;
        }

        try {
            // Envoi de la demande vers le bon endpoint
            const response = await axios.post('http://localhost:5000/api/permissions', formData);

            if (response.data.success) {
                alert('✅ Demande de permission envoyée avec succès!');
                // Réinitialiser le formulaire si besoin
                setFormData({
                    TypeP: 'Permission d\'absence',
                    DateDemPerm: new Date().toISOString().split('T')[0],
                    DebP: '',
                    FinP: '',
                    NbrjP: 0,
                    Motif: '',
                    LienPerm: '',
                    Matricule: user.matricule,
                    StatueP: 'En attente'
                });
            } else {
                alert('⚠️ Une erreur est survenue : ' + response.data.message);
            }
        } catch (err) {
            console.error('Erreur envoi demande:', err);
            const msg = err.response?.data?.message || 'Erreur lors de l\'envoi de la demande';
            alert(`❌ ${msg}`);
        }
    };


    return (
        <div className="demande-permission-container">
            <h1>Demande de Permission</h1>
            
            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <div className="form-group">
                        <label>Date de demande:</label>
                        <input 
                            type="date" 
                            name="DateDemPerm" 
                            value={formData.DateDemPerm} 
                            readOnly
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Date de début:</label>
                        <input 
                            type="date" 
                            name="DebP" 
                            value={formData.DebP} 
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Date de fin:</label>
                        <input 
                            type="date" 
                            name="FinP" 
                            value={formData.FinP} 
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Nombre de jours:</label>
                        <input 
                            type="number" 
                            name="NbrjP" 
                            value={formData.NbrjP} 
                            readOnly
                            min="1"
                            max="3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Motif:</label>
                        <input 
                            type="text" 
                            name="Motif" 
                            value={formData.Motif} 
                            onChange={handleChange}
                            required
                            placeholder="Raison personnelle / Familiale / etc."
                        />
                    </div>
                </div>
                
                <div className="form-section">
                    <div className="form-group">
                        <label>Lettre de demande (PDF):</label>
                        <input 
                            type="file" 
                            accept=".pdf"
                            onChange={handleFileUpload}
                            required
                        />
                    </div>
                    
                    <div className="button-group">
                        <button 
                            type="button" 
                            className="generate-btn"
                            onClick={genererLettre}
                        >
                            Générer la lettre
                        </button>
                        <button 
                            type="submit" 
                            className="submit-btn"
                        >
                            Envoyer la demande
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default DemandePermission;
