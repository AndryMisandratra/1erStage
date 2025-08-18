import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import jsPDF from "jspdf";
import { FiUpload, FiDownload, FiSend, FiCalendar, FiFileText, FiUser, FiArrowLeft } from "react-icons/fi";
import "./../styles/DemandeConge.css";

const DemandeConge = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] = useState({
    type: "Annuel",
    dateDebut: "",
    dateFin: "",
    cheminDemande: null,
    nbTitres: 0,
    titres: [],
    anneesSelectionnees: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [titreUploads, setTitreUploads] = useState([]);

  const anneesPossibles = Array.from({ length: 20 }, (_, i) => 2025 - i);

  // Types de congé disponibles selon le genre
  const typesPossibles = ["Annuel", "Maladie"];
  if (user.genre === "Femme") typesPossibles.push("Maternité");
  if (user.genre === "Homme") typesPossibles.push("Paternité");

  const calculerDureeConge = () => {
    if (formData.type === "Maternité") return 90;
    if (formData.type === "Paternité") return 15;
    if (formData.dateDebut && formData.dateFin) {
      const deb = new Date(formData.dateDebut);
      const fin = new Date(formData.dateFin);
      const diff = (fin - deb) / (1000 * 60 * 60 * 24) + 1;
      return diff > 0 ? diff : 0;
    }
    return 0;
  };

  const totalCP = calculerDureeConge();

  useEffect(() => {
    setTitreUploads(Array(formData.nbTitres).fill(false));
  }, [formData.nbTitres]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, isTitre = false, index = null) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
        alert("Veuillez sélectionner un fichier PDF valide.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Le fichier ne doit pas dépasser 5MB");
        return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    const endpoint = isTitre ? "titres" : "demandes";

    try {
        const res = await axios.post(
            `http://localhost:5000/api/upload/${endpoint}`,
            uploadData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.data.success) {
            if (isTitre) {
                const newTitres = [...formData.titres];
                newTitres[index] = res.data.path;
                const newTitreUploads = [...titreUploads];
                newTitreUploads[index] = true;
                setFormData(prev => ({ ...prev, titres: newTitres }));
                setTitreUploads(newTitreUploads);
            } else {
                setFormData(prev => ({ ...prev, cheminDemande: res.data.path }));
                setFileUploaded(true);
            }
        }
    } catch (err) {
        console.error(err);
        alert(`Erreur: ${err.response?.data?.error || err.message}`);
    }
};



const genererPDF = () => {
    const doc = new jsPDF();

    // En-tête
    doc.setFontSize(12);
    doc.text(`Antananarivo, le ${new Date().toLocaleDateString()}`, 20, 20);
    doc.text(`${user.nom} ${user.prenom}`, 20, 30);
    doc.text(`Matricule: ${user.matricule}`, 20, 40);

    // Destinataire
    doc.text("À", 20, 60);
    doc.text(
      "MONSIEUR LE PRESIDENT DU TRIBUNAL FINANCIER D'ANTANANARIVO",
      20,
      70
    );

    // Objet
    doc.setFontSize(14);
    doc.text("OBJET: Demande de congé", 20, 100);

    // Corps de la lettre
    doc.setFontSize(12);
    doc.text("Monsieur Le Président,", 20, 120);

    let texteDemande = `Je viens par la présente solliciter votre haute bienveillance pour m'accorder `;
    texteDemande += `un congé de ${totalCP} jours, du ${dateDebut} au ${dateFin}.`;

    if (type === "Annuel" && anneesSelectionnees.length > 0) {
      texteDemande += `\n\nCe congé est pris au titre des années: ${anneesSelectionnees.join(
        ", "
      )}.`;
    }

    doc.text(texteDemande, 20, 130, { maxWidth: 170 });

    // Signature
    doc.text("Veuillez agréer, Monsieur Le Président,", 20, 180);
    doc.text("l'expression de ma très haute considération.", 20, 190);
    doc.text("L'INTÉRESSÉ(E)", 20, 210);

    doc.save(`demande_conge_${matricule}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.cheminDemande) {
        throw new Error("Veuillez téléverser la lettre de demande");
      }

      if (formData.type === "Annuel" && formData.titres.some(t => !t)) {
        throw new Error("Veuillez téléverser tous les titres requis");
      }

      const payload = {
        TypeC: formData.type,
        TotalCP: totalCP,
        DateDemCong: new Date().toISOString().split("T")[0],
        DebC: formData.dateDebut,
        FinC: formData.dateFin,
        StatueC: "En attente",
        Matricule: user.matricule,
        CheminDem: formData.cheminDemande,
        TitresPaths: formData.titres,
        Annees: formData.anneesSelectionnees,
      };

      const response = await axios.post("http://localhost:5000/api/conges", payload);
      
      if (response.data.success) {
        alert("✅ Demande envoyée avec succès !");
        // Reset form
        setFormData({
          type: "Annuel",
          dateDebut: "",
          dateFin: "",
          cheminDemande: null,
          nbTitres: 0,
          titres: [],
          anneesSelectionnees: []
        });
        setFileUploaded(false);
        setTitreUploads([]);
      }
    } catch (err) {
      console.error(err);
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
    <div className="conge-container">
      <div className="conge-header">
        <div className="header-top">
            <button 
                className="back-button"
                onClick={handleReturn}
            >
                <FiArrowLeft /> Retour au tableau de bord
            </button>    
        </div>
        <h1><FiCalendar /> Demande de Congé</h1>
        <p>Formulaire de demande d'autorisation d'absence</p>
      </div>

      <div className="info-box">
        <h3>Instructions importantes :</h3>
        <ul>
          <li>Les congés annuels nécessitent l'upload des titres correspondants</li>
          <li>Les fichiers doivent être au format PDF (max 5MB)</li>
          <li>Pour les congés maladie/maternité/paternité, joindre les justificatifs médicaux</li>
          <li>Toute fausse déclaration entraîne le rejet de la demande</li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit} className="conge-form">
        <div className="form-grid">
          <div className="form-card">
            <h2><FiUser /> Informations Personnelles</h2>
            
            <div className="form-group">
              <label>Nom complet</label>
              <input 
                type="text" 
                value={`${user.nom} ${user.prenom}`} 
                readOnly 
                className="readonly"
              />
            </div>
            
            <div className="form-group">
              <label>Matricule</label>
              <input 
                type="text" 
                value={user.matricule} 
                readOnly 
                className="readonly"
              />
            </div>
          </div>

          <div className="form-card">
            <h2><FiCalendar /> Détails du Congé</h2>
            
            <div className="form-group">
              <label>Type de congé <span className="required">*</span></label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange} 
                required
              >
                {typesPossibles.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date de début <span className="required">*</span></label>
                <input
                  type="date"
                  name="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              
              <div className="form-group">
                <label>Date de fin <span className="required">*</span></label>
                <input
                  type="date"
                  name="dateFin"
                  value={formData.dateFin}
                  onChange={handleChange}
                  required
                  min={formData.dateDebut || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Durée (jours)</label>
              <input 
                type="number" 
                value={totalCP} 
                readOnly 
                className="readonly"
              />
            </div>
          </div>

          {formData.type === "Annuel" && (
            <div className="form-card">
              <h2><FiFileText /> Titres de Congé</h2>
              
              <div className="form-group">
                <label>Années concernées <span className="required">*</span></label>
                <select
                  multiple
                  name="anneesSelectionnees"
                  value={formData.anneesSelectionnees}
                  onChange={(e) => {
                    const options = [...e.target.selectedOptions];
                    const values = options.map(opt => opt.value);
                    setFormData(prev => ({ ...prev, anneesSelectionnees: values }));
                  }}
                  required
                >
                  {anneesPossibles.map(annee => (
                    <option key={annee} value={annee}>{annee}</option>
                  ))}
                </select>
                <small className="hint">Maintenez Ctrl/Cmd pour sélection multiple</small>
              </div>

              <div className="form-group">
                <label>Nombre de titres à joindre</label>
                <input
                  type="number"
                  name="nbTitres"
                  min="0"
                  value={formData.nbTitres}
                  onChange={handleChange}
                />
              </div>

              {Array.from({ length: formData.nbTitres }).map((_, index) => (
                <div key={index} className="form-group file-upload">
                  <label>
                    <FiUpload /> Titre {index + 1} <span className="required">*</span>
                  </label>
                  <div className="upload-area">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e, true, index)}
                      required
                      id={`titre-upload-${index}`}
                    />
                    <label htmlFor={`titre-upload-${index}`} className="upload-label">
                      {titreUploads[index] ? 'Fichier téléversé ✓' : 'Choisir un fichier'}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="form-card">
            <h2><FiFileText /> Documents Requis</h2>
            
            <div className="form-group file-upload">
              <label>
                <FiUpload /> Lettre de demande (PDF) <span className="required">*</span>
              </label>
              <div className="upload-area">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  required
                  id="lettre-upload"
                />
                <label htmlFor="lettre-upload" className="upload-label">
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
            onClick={genererPDF}
            disabled={!formData.dateDebut || !formData.dateFin}
          >
            <FiDownload /> Générer modèle
          </button>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting || !fileUploaded || 
              (formData.type === "Annuel" && formData.titres.some(t => !t))}
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

export default DemandeConge;