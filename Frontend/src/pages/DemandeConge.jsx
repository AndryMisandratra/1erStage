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
    nbTitres: 1,
    titres: [],
    anneesSelectionnees: [],
    ordonnance: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [titreUploads, setTitreUploads] = useState([]);
  const [ordonnanceUploaded, setOrdonnanceUploaded] = useState(false); // <-- ajout

  const anneesPossibles = Array.from({ length: 20 }, (_, i) => 2025 - i);

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

  const handleFileUpload = async (e, isTitre = false, index = null, isOrdonnance = false) => {
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

    let endpoint = "demandes";
    if (isTitre) endpoint = "titres";
    if (isOrdonnance) endpoint = "ordonnances";

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
            } else if (isOrdonnance) {
                setFormData(prev => ({ ...prev, ordonnance: res.data.path }));
                setOrdonnanceUploaded(true);
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


  const genererPDF = (user, formData, totalCP) => {
    const doc = new jsPDF();
    
    doc.setFontSize(12);
    let y = 20
    // Vérification et conversion des dates
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return isNaN(date) ? dateStr : date.toLocaleDateString('fr-FR');
    };

    // Police
    doc.setFont("times", "normal");

    // En-tête
    doc.text(`Antananarivo, le ${new Date().toLocaleDateString()}`, 115, y);

    
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
    const objet = `OBJET : demande de congé ${formData.type}.`;
    doc.text(objet, 15, 95);

    // Corps de la lettre
    let corps = [
      `${destinataire.split(' ').slice(0, 3).join(" ")},`,
      `J'ai l'honneur de solliciter votre haute bienveillance de bien vouloir`,
      `m'accorder ma demande de congé de ${totalCP} jours, du ${formData.dateDebut} au ${formData.dateFin}.`
    ];

    // ➕ Si Annuel → inclure années
    if (formData.type === "Annuel" && formData.anneesSelectionnees?.length > 0) {
      corps.push(`Ce congé est pris au titre des années ${formData.anneesSelectionnees.join(", ")}.`);
    }

    // Ajout du corps
    const texteDemande = corps.join("\n");
    doc.text(texteDemande, 20, 120, { maxWidth: 170, lineHeightFactor: 1.5 });

    // Formule de politesse (ajoutée après le texte)
    let yFin = 160; // tu peux calculer en fonction de texteDemande
    const politesse = [
      `Veuillez agréer, ${destinataire.split(' ').slice(0, 3).join(" ")}, l'expression de ma très haute considération.`,
      `L'INTERESSE,`
    ];
    politesse.forEach((line, index) => {
      doc.text(line, 20, yFin + (index * 120));
    });

    doc.text(`${user.nom} ${user.prenom}`, 110,200);

    // Sauvegarde du PDF
    doc.save(`demande_congé_${user.matricule}_${new Date().toLocaleDateString()}.pdf`);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.cheminDemande) throw new Error("Veuillez téléverser la lettre de demande");

      if (formData.type === "Annuel" && formData.titres.some(t => !t)) {
        throw new Error("Veuillez téléverser tous les titres requis");
      }

      if ((formData.type === "Maladie" || formData.type === "Maternité" || formData.type === "Paternité") 
          && !formData.ordonnance) {
        throw new Error("Veuillez téléverser l’ordonnance médicale");
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
        CheminOrd: formData.ordonnance || null // <-- ajout
      };

      const response = await axios.post("http://localhost:5000/api/conges", payload);
      
      if (response.data.success) {
        alert("✅ Demande envoyée avec succès !");
        setFormData({
          type: "Annuel",
          dateDebut: "",
          dateFin: "",
          cheminDemande: null,
          nbTitres: 0,
          titres: [],
          anneesSelectionnees: [],
          ordonnance: null
        });
        setFileUploaded(false);
        setTitreUploads([]);
        setOrdonnanceUploaded(false);
      }
    } catch (err) {
      console.error(err);
      alert(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigate = useNavigate();
  const handleReturn = () => navigate('/DashboardEmployer');

  return (
    <div className="conge-container">
      <div className="conge-header">
        <div className="header-top">
          <button className="back-button" onClick={handleReturn}>
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
              <input type="text" value={`${user.nom} ${user.prenom}`} readOnly className="readonly"/>
            </div>
            <div className="form-group">
              <label>Matricule</label>
              <input type="text" value={user.matricule} readOnly className="readonly"/>
            </div>
          </div>

          <div className="form-card">
            <h2><FiCalendar /> Détails du Congé</h2>
            <div className="form-group">
              <label>Type de congé <span className="required">*</span></label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                {typesPossibles.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date de début <span className="required">*</span></label>
                <input type="date" name="dateDebut" value={formData.dateDebut} onChange={handleChange} required
                  min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="form-group">
                <label>Date de fin <span className="required">*</span></label>
                <input type="date" name="dateFin" value={formData.dateFin} onChange={handleChange} required
                  min={formData.dateDebut || new Date().toISOString().split("T")[0]} />
              </div>
            </div>

            <div className="form-group">
              <label>Durée (jours)</label>
              <input type="number" value={totalCP} readOnly className="readonly"/>
            </div>
          </div>

          {formData.type === "Annuel" && (
            <div className="form-card">
              <h2><FiFileText /> Titres de Congé</h2>
              <div className="form-group">
                <label>Années concernées <span className="required">*</span></label>
                <select multiple name="anneesSelectionnees" value={formData.anneesSelectionnees} 
                  onChange={(e) => {
                    const options = [...e.target.selectedOptions];
                    const values = options.map(opt => opt.value);
                    setFormData(prev => ({ ...prev, anneesSelectionnees: values }));
                  }} required>
                  {anneesPossibles.map(annee => <option key={annee} value={annee}>{annee}</option>)}
                </select>
                <small className="hint">Maintenez Ctrl/Cmd pour sélection multiple</small>
              </div>

              <div className="form-group">
                <label>Nombre de titres à joindre</label>
                <input type="number" name="nbTitres" min="0" value={formData.nbTitres} onChange={handleChange}/>
              </div>

              {Array.from({ length: formData.nbTitres }).map((_, index) => (
                <div key={index} className="form-group file-upload">
                  <label>
                    <FiUpload /> Titre {index + 1} <span className="required">*</span>
                  </label>
                  <div className="upload-area">
                    <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, true, index, false)} required
                      id={`titre-upload-${index}`}/>
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
                <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, false, null, false)} required id="lettre-upload"/>
                <label htmlFor="lettre-upload" className="upload-label">
                  {fileUploaded ? 'Fichier téléversé ✓' : 'Choisir un fichier'}
                </label>
              </div>
            </div>
          </div>

          {(formData.type === "Maladie" || formData.type === "Maternité" || formData.type === "Paternité") && (
            <div className="form-card">
              <h2><FiFileText /> Ordonnance médicale</h2>
              <div className="form-group file-upload">
                <label>
                  <FiUpload /> Ordonnance (PDF) <span className="required">*</span>
                </label>
                <div className="upload-area">
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, false, null, true)} required id="ordonnance-upload"/>
                  <label htmlFor="ordonnance-upload" className="upload-label">
                    {ordonnanceUploaded ? 'Fichier téléversé ✓' : 'Choisir un fichier'}
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="action-buttons">
          <button 
            type="button" 
            className="generate-btn" 
            onClick={() => genererPDF(user, formData, totalCP)}
            disabled={!formData.dateDebut || !formData.dateFin}
          >
            <FiDownload /> Générer modèle
          </button>

          
          <button type="submit" className="submit-btn"
            disabled={isSubmitting || !fileUploaded || 
              (formData.type === "Annuel" && formData.titres.some(t => !t)) ||
              ((formData.type === "Maladie" || formData.type === "Maternité" || formData.type === "Paternité") && !ordonnanceUploaded)}
          >
            {isSubmitting ? 'Envoi en cours...' : <><FiSend /> Envoyer la demande</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DemandeConge;
