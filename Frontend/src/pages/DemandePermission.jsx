import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import { FiUpload, FiDownload, FiSend, FiCalendar, FiFileText, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileUploaded, setFileUploaded] = useState(false);

    useEffect(() => {
        if (formData.DebP && formData.FinP) {
            const debut = new Date(formData.DebP);
            const fin = new Date(formData.FinP);
            const diffTime = fin - debut;
            const jours = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            if (jours < 1) {
                alert('La date de fin doit être après la date de début');
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

        if (file.size > 5 * 1024 * 1024) {
            alert('Le fichier ne doit pas dépasser 5MB');
            return;
        }

        if (file.type !== 'application/pdf') {
            alert('Seuls les fichiers PDF sont acceptés');
            return;
        }

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await axios.post(
                'http://192.168.89.95:5000/api/upload/permissions',
                uploadData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                setFormData(prev => ({
                    ...prev,
                    LienPerm: response.data.path
                }));
                setFileUploaded(true);
            }
        } catch (error) {
            console.error('Erreur de téléversement:', error);
            alert(`Erreur: ${error.response?.data?.error || error.message}`);
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
            doc.text(`Antananarivo, ${formatDate(formData.DateDemPerm) || ''}`, 115, y);
            
            // Destinataire
            let destinataire ;
            if (user.idDiv === 1){
                destinataire = 'Monsieur LE PRESIDENT DU TRIBUNAL FINANCIER D\'ANTANANARIVO' ;
            }else {
                destinataire =  'Madame LA COMMISSAIRE FINANCIER DU TRIBUNAL FINANCIER D\'ANTANANARIVO' ;
            }
                

            // Coordonnées de l'expéditeur
            const expediteur = [
                `              ${user.nom} ${user.prenom}, IM : ${user.matricule}`,
                `                                    ${user.attribution}`,
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
                `                                      L'INTERESSE,`,
                
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
        setIsSubmitting(true);

        try {


            if (!formData.LienPerm) {
                throw new Error('Veuillez téléverser votre demande en PDF');
            }

            // Envoi
            const response = await axios.post('http://192.168.89.95:5000/api/permissions', formData);

            if (response.data.success) {
                alert('✅ Demande envoyée avec succès !');
                // Réinitialisation
                setFormData({
                    ...formData,
                    DebP: '',
                    FinP: '',
                    NbrjP: 0,
                    Motif: '',
                    LienPerm: ''
                });
                setFileUploaded(false);
            }
        } catch (err) {
            console.error('Erreur:', err);
            alert(`❌ ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const navigate = useNavigate();

    const handleReturn = () => {
        navigate('/DashboardEmployer');
    };

    return (
        <div className="permission-container">
            <div className="permission-header">
                <div className="header-top">
                    <button 
                        
                        className="back-button"
                        onClick={handleReturn}
                    >
                        <FiArrowLeft /> Retour au tableau de bord
                    </button>    
                </div>
                <h1><FiCalendar /> Demande de Permission</h1>
                <p>Formulaire de demande d'autorisation d'absence</p>
            </div>

            <div className="info-box">
                <h3>Instructions importantes :</h3>
                <ul>
                    <li>La durée maximale est de 3 jours consécutifs</li>
                    <li>Le fichier joint doit être au format PDF</li>
                    <li>Toute fausse déclaration entraîne le rejet de la demande</li>
                </ul>
            </div>
            
            <form onSubmit={handleSubmit} className="permission-form">
                <div className="form-grid">
                    <div className="form-card">
                        <h2><FiFileText /> Informations de base</h2>
                        
                        <div className="form-group">
                            <label>Date de demande</label>
                            <input 
                                type="date" 
                                name="DateDemPerm" 
                                value={formData.DateDemPerm} 
                                readOnly
                                className="readonly"
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Date de début <span className="required">*</span></label>
                                <input 
                                    type="date" 
                                    name="DebP" 
                                    value={formData.DebP} 
                                    onChange={handleChange}
                                    required
                                    min={formData.DateDemPerm}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Date de fin <span className="required">*</span></label>
                                <input 
                                    type="date" 
                                    name="FinP" 
                                    value={formData.FinP} 
                                    onChange={handleChange}
                                    required
                                    min={formData.DebP || formData.DateDemPerm}
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Nombre de jours</label>
                            <input 
                                type="number" 
                                name="NbrjP" 
                                value={formData.NbrjP} 
                                readOnly
                                className="readonly"
                            />
                        </div>
                    </div>
                    
                    <div className="form-card">
                        <h2><FiAlertTriangle /> Détails complémentaires</h2>
                        
                        <div className="form-group">
                            <label>Motif <span className="required">*</span></label>
                            <select
                                name="Motif" 
                                value={formData.Motif} 
                                onChange={handleChange}
                                required
                            >
                                <option value="">Sélectionnez un motif</option>
                                <option value="Familiale">familiale</option>
                                <option value="Personnelle">personnelle</option>
                                <option value="Décè">Décè</option>
                            </select>
                        </div>
                        
                        {formData.Motif === 'Autre' && (
                            <div className="form-group">
                                <label>Précisez le motif</label>
                                <input 
                                    type="text" 
                                    name="MotifPrecision" 
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        
                        <div className="form-group file-upload">
                            <label>
                                <FiUpload /> Joindre la lettre (PDF) <span className="required">*</span>
                            </label>
                            <div className="upload-area">
                                <input 
                                    type="file" 
                                    accept=".pdf"
                                    onChange={handleFileUpload}
                                    required
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="upload-label">
                                    {fileUploaded ? 'Fichier téléversé ✓' : 'Choisir un fichier'}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="action-buttons">
                    <button 
                        type="button" 
                        className="generate-btn"
                        onClick={genererLettre}
                        disabled={!formData.DebP || !formData.FinP}
                    >
                        <FiDownload /> Générer le modèle
                    </button>
                    
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isSubmitting || !fileUploaded}
                    >
                        {isSubmitting ? 'Envoi en cours...' : (
                            <>
                                <FiSend /> Envoyer la demande
                            </>
                        )}
                    </button>
                </div>
            </form>
            
            
        </div>
    );
};

export default DemandePermission;