import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "./../styles/DemandeConge.css";

const DemandeConge = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [type, setType] = useState("Annuel");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [cheminDemande, setCheminDemande] = useState(null);
  const [nbTitres, setNbTitres] = useState(0);
  const [titres, setTitres] = useState([]); // Contient les chemins des titres uploadés
  const [anneesSelectionnees, setAnneesSelectionnees] = useState([]);

  const matricule = user.matricule;

  // Liste des années possibles (à adapter selon vos besoins)
  const anneesPossibles = Array.from({ length: 20 }, (_, i) => 2025 - i);

  // Calcul de durée de congé
  const calculerDureeConge = () => {
    if (type === "Maternité") return 90;
    if (type === "Paternité") return 15;
    if (dateDebut && dateFin) {
      const deb = new Date(dateDebut);
      const fin = new Date(dateFin);
      const diff = (fin - deb) / (1000 * 60 * 60 * 24) + 1;
      return diff > 0 ? diff : 0;
    }
    return 0;
  };

  const totalCP = calculerDureeConge();

  // Réinitialise la liste des titres quand nbTitres change
  useEffect(() => {
    setTitres(Array(nbTitres).fill(null));
  }, [nbTitres]);

  // Upload lettre de demande (lettre PDF)
  const handleLettreUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Veuillez sélectionner un fichier PDF valide.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/upload/demandes",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        setCheminDemande(res.data.path);
        alert("Lettre téléversée avec succès.");
      } else {
        alert("Échec du téléversement de la lettre.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors du téléversement de la lettre.");
    }
  };

  // Upload un titre individuel (PDF)
  const handleTitreChange = async (index, file) => {
    if (!file || file.type !== "application/pdf") {
      alert("Veuillez sélectionner un fichier PDF valide.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/upload/titres",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        const newTitres = [...titres];
        newTitres[index] = res.data.path;
        setTitres(newTitres);
        alert(`Titre ${index + 1} téléversé.`);
      } else {
        alert(`Échec du téléversement du titre ${index + 1}.`);
      }
    } catch (err) {
      console.error(err);
      alert(`Erreur lors du téléversement du titre ${index + 1}`);
    }
  };

  // Génération de la lettre PDF modèle (facultatif)
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

  // Types de congé disponibles selon le genre
  const typesPossibles = ["Annuel", "Maladie"];
  if (user.genre === "Femme") typesPossibles.push("Maternité");
  if (user.genre === "Homme") typesPossibles.push("Paternité");

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cheminDemande) {
      alert("Veuillez téléverser la lettre de demande (PDF).");
      return;
    }

    if (type === "Annuel" && titres.some((t) => !t)) {
      alert("Veuillez téléverser tous les titres requis.");
      return;
    }

    const payload = {
      TypeC: type,
      TotalCP: totalCP,
      DateDemCong: new Date().toISOString().split("T")[0],
      DebC: dateDebut,
      FinC: dateFin,
      StatueC: "En attente",
      Matricule: matricule,
      CheminDem: cheminDemande,
      TitresPaths: titres,
      Annees: anneesSelectionnees,
    };

    try {
      await axios.post("http://localhost:5000/api/conges", payload);
      alert("Demande de congé envoyée avec succès !");
      // Reset form
      setType("Annuel");
      setDateDebut("");
      setDateFin("");
      setCheminDemande(null);
      setNbTitres(0);
      setTitres([]);
      setAnneesSelectionnees([]);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi de la demande");
    }
  };

  return (
    <div className="form-conge-container">
      <h2>Demande de congé</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Type de congé */}
        <div className="form-group">
          <label>Type de congé :</label>
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            {typesPossibles.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="form-group">
          <label>Date début :</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Date fin :</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Nombre de jours :</label>
          <input type="number" value={totalCP} readOnly />
        </div>

        {/* Pour les congés annuels seulement */}
        {type === "Annuel" && (
          <>
            <div className="form-group">
              <label>Années concernées :</label>
              <select
                multiple
                value={anneesSelectionnees}
                onChange={(e) => {
                  const options = [...e.target.selectedOptions];
                  const values = options.map((opt) => opt.value);
                  setAnneesSelectionnees(values);
                }}
                required
              >
                {anneesPossibles.map((annee) => (
                  <option key={annee} value={annee}>
                    {annee}
                  </option>
                ))}
              </select>
              <small>Maintenez Ctrl/Cmd pour sélectionner plusieurs années</small>
            </div>

            <div className="form-group">
              <label>Nombre de titres à joindre :</label>
              <input
                type="number"
                min="0"
                value={nbTitres}
                onChange={(e) => setNbTitres(parseInt(e.target.value) || 0)}
              />
            </div>

            {Array.from({ length: nbTitres }).map((_, index) => (
              <div key={index} className="form-group">
                <label>Titre {index + 1} (PDF) :</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleTitreChange(index, e.target.files[0])}
                  required
                />
                {titres[index] && (
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    Téléversé
                  </span>
                )}
              </div>
            ))}
          </>
        )}

        {/* Lettre de demande */}
        <div className="form-group">
          <label>Lettre de demande (PDF) :</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleLettreUpload}
            required
          />
          {cheminDemande && (
            <p style={{ color: "green", fontWeight: "bold" }}>
              Lettre téléversée
            </p>
          )}
        </div>

        <div className="buttons">
          <button type="button" onClick={genererPDF}>
            Générer modèle de lettre
          </button>
          <button type="submit">Envoyer la demande</button>
        </div>
      </form>
    </div>
  );
};

export default DemandeConge;
