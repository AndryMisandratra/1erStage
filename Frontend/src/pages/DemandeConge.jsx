import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import '../styles/DemandeConge.css';

const DemandeConge = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [formData, setFormData] = useState({
        TypeC: 'Annuel',
        DateDemCong: new Date().toISOString().split('T')[0],
        DebC: '',
        FinC: '',
        TotalCP: 0,
        CheminDem: '',
        Matricule: user.matricule
    });

    const [titreForms, setTitreForms] = useState([
        { NumDesc: '', NbrAnne: 1, DC: 30, CP: 0, Reliquat: 30, estUtilise: false, CheminTitre: '' }
    ]);

    const [recommendationMed, setRecommendationMed] = useState(null);
    const [userGenre] = useState(user.genre);
    const [joursConges, setJoursConges] = useState(0);

    useEffect(() => {
        if (formData.DebC && formData.FinC) {
            const debut = new Date(formData.DebC);
            const fin = new Date(formData.FinC);
            const jours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
            setJoursConges(jours);

            if (formData.TypeC === 'Annuel') {
                setFormData(prev => ({ ...prev, TotalCP: jours }));
            }
        }

        if (formData.TypeC === 'Maternité') {
            setFormData(prev => ({ ...prev, TotalCP: 90 }));
        } else if (formData.TypeC === 'Paternité') {
            setFormData(prev => ({ ...prev, TotalCP: 15 }));
        }

    }, [formData.DebC, formData.FinC, formData.TypeC]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTitreChange = (index, e) => {
        const { name, value } = e.target;
        const titres = [...titreForms];
        let titre = titres[index];

        if (name === 'NbrAnne') {
            titre.NbrAnne = parseInt(value) || 1;
            if (!titre.estUtilise) {
                titre.DC = titre.NbrAnne * 30;
            }
        }

        if (name === 'CP') {
            titre.CP = parseInt(value) || 0;
        }

        if (name === 'NumDesc') {
            titre.NumDesc = value;
        }

        titre.Reliquat = titre.DC - titre.CP;
        titres[index] = titre;
        setTitreForms(titres);
    };

    const handleToggleUtilise = (index) => {
        const titres = [...titreForms];
        titres[index].estUtilise = !titres[index].estUtilise;

        if (!titres[index].estUtilise) {
            titres[index].DC = titres[index].NbrAnne * 30;
        }

        titres[index].Reliquat = titres[index].DC - titres[index].CP;
        setTitreForms(titres);
    };

    const addTitreForm = () => {
        const totalCP = formData.TotalCP;
        const sumCP = titreForms.reduce((s, t) => s + (parseInt(t.CP) || 0), 0);
        if (sumCP >= totalCP) {
            alert("La somme des jours pris atteint déjà le total demandé.");
            return;
        }

        setTitreForms([...titreForms, {
            NumDesc: '', NbrAnne: 1, DC: 30, CP: 0, Reliquat: 30, estUtilise: false, CheminTitre: ''
        }]);
    };

    const removeTitreForm = (index) => {
        const updated = titreForms.filter((_, i) => i !== index);
        setTitreForms(updated);
    };

    const handleFileUpload = async (e, type, index = null) => {
        const file = e.target.files[0];
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await axios.post('/api/upload', data);
            const filePath = res.data.path;

            if (type === 'recommendation') {
                setRecommendationMed(filePath);
            } else if (type === 'demande') {
                setFormData(prev => ({ ...prev, CheminDem: filePath }));
            } else if (type === 'titre') {
                const titres = [...titreForms];
                titres[index].CheminTitre = filePath;
                setTitreForms(titres);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.TypeC === 'Maladie' && !recommendationMed) {
            alert("Recommandation requise.");
            return;
        }

        const sumCP = titreForms.reduce((s, t) => s + (parseInt(t.CP) || 0), 0);
        if (formData.TypeC === 'Annuel' && sumCP !== formData.TotalCP) {
            alert(`La somme des CP (${sumCP}) doit correspondre à ${formData.TotalCP}`);
            return;
        }

        try {
            const resConge = await axios.post('/api/conge', formData);
            const IdC = resConge.data.IdC;

            for (const titre of titreForms) {
                await axios.post('/api/titre', titre);
                await axios.post('/api/utiliser', {
                    IdC,
                    NumDesc: titre.NumDesc,
                    CheminTitre: titre.CheminTitre
                });
            }

            alert("Envoyé !");
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'envoi.");
        }
    };

    const genererLettre = () => {
        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text(`Objet : Demande de congé ${formData.TypeC}`, 20, 20);
        doc.text(`Je soussigné(e) ${user.nom} ${user.prenom},`, 20, 35);
        doc.text(`matricule ${user.matricule}, sollicite un congé de type ${formData.TypeC}`, 20, 45);
        doc.text(`du ${formData.DebC} au ${formData.FinC} (${formData.TotalCP} jours).`, 20, 55);
        doc.text(`Fait à Antananarivo, le ${formData.DateDemCong}`, 20, 70);
        doc.text(`${user.nom} ${user.prenom}`, 20, 85);

        doc.save(`demande_conge_${user.matricule}.pdf`);
    };

    return (
        <div className="demande-conge-container">
            <h1>Demande de Congé</h1>
            <form onSubmit={handleSubmit}>
                {/* === PARTIE 1 === */}
                <div className="form-section">
                    <label>Type de congé:</label>
                    <select name="TypeC" value={formData.TypeC} onChange={handleChange}>
                        <option value="Annuel">Annuel</option>
                        <option value="Maladie">Maladie</option>
                        {userGenre === 'Femme' && <option value="Maternité">Maternité</option>}
                        {userGenre === 'Homme' && <option value="Paternité">Paternité</option>}
                    </select>

                    <label>Date début:</label>
                    <input type="date" name="DebC" value={formData.DebC} onChange={handleChange} required />

                    <label>Date fin:</label>
                    <input type="date" name="FinC" value={formData.FinC} onChange={handleChange} required />

                    {formData.TypeC === 'Maladie' && (
                        <input type="file" accept=".pdf,.jpg" onChange={(e) => handleFileUpload(e, 'recommendation')} />
                    )}
                </div>

                {/* === PARTIE TITRES === */}
                {formData.TypeC === 'Annuel' && (
                    <div className="form-section">
                        <h3>Jours demandés: {joursConges} | TotalCP: {formData.TotalCP}</h3>
                        {titreForms.map((titre, index) => (
                            <div key={index} className="titre-form">
                                <label>Déjà utilisé ?
                                    <input type="checkbox" checked={titre.estUtilise} onChange={() => handleToggleUtilise(index)} />
                                </label>

                                <label>Numéro description</label>
                                <input type="text" name="NumDesc" value={titre.NumDesc} onChange={(e) => handleTitreChange(index, e)} />
                                <label>Années</label>
                                <input type="number" name="NbrAnne" value={titre.NbrAnne} onChange={(e) => handleTitreChange(index, e)} min="1" />
                                {titre.estUtilise && (
                                    <>
                                        <label>DC</label>
                                        <input type="number" value={titre.DC} min="0"/>
                                    </>
                                )}

                                <label>CP</label>
                                <input type="number" name="CP" value={titre.CP} onChange={(e) => handleTitreChange(index, e)} min="0" max={joursConges}/>
                                <label>Reliquat</label>
                                <input type="number" value={titre.Reliquat} readOnly min="0" />

                                <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, 'titre', index)} />
                                {index > 0 && <button type="button" onClick={() => removeTitreForm(index)}>Supprimer</button>}
                            </div>
                        ))}
                        <button type="button" onClick={addTitreForm}>➕ Ajouter titre</button>
                    </div>
                )}


                <div className="form-section">
                    <label>Lettre de demande (PDF)</label>
                    <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, 'demande')} required />

                    <button type="button" onClick={genererLettre}>📄 Générer PDF</button>
                    <button type="submit">📤 Envoyer</button>
                </div>
            </form>
        </div>
    );
};

export default DemandeConge;
