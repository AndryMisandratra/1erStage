const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 📚 Route GET /api/historique/:matricule
router.get('/:matricule', async (req, res) => {
    const { matricule } = req.params;

    try {
        // 📌 Récupérer les congés
        const [conges] = await db.query(`
            SELECT 
                'Congé' AS type,
                TypeC,
                DATE_FORMAT(DateDemCong, '%d-%m-%Y') AS date_demande,
                DATE_FORMAT(DebC , '%d-%m-%Y') AS debut,
                DATE_FORMAT(FinC , '%d-%m-%Y') AS fin,
                TotalCP AS jours,
                StatueC AS statut,
                CheminDem AS lettre,
                IdC
            FROM conge
            WHERE Matricule = ?
        `, [matricule]);

        // Ajouter les justificatifs (titres) si congé annuel
        for (const conge of conges) {
            if (conge.TypeC === 'Annuel') {
                const [titres] = await db.query(`
                    SELECT CheminTitre FROM titre 
                    WHERE IdTitre IN (
                        SELECT IdTitre FROM utiliser WHERE IdC = ?
                    )
                `, [conge.IdC]);
                conge.justificatifs = titres.map(t => t.CheminTitre);
            } else {
                conge.justificatifs = [];
            }

            delete conge.IdC; // ❌ Retirer IdC
        }

        // 📌 Récupérer les permissions
        const [permissions] = await db.query(`
            SELECT 
                'Permission' AS type,
                TypeP AS TypeC,
                DATE_FORMAT(DateDemPerm, '%d-%m-%Y') AS date_demande,
                DATE_FORMAT(DebP, '%d-%m-%Y') AS debut,
                DATE_FORMAT(FinP, '%d-%m-%Y') AS fin,
                NbrjP AS jours,
                StatueP AS statut,
                LienPerm AS lettre
            FROM permission
            WHERE Matricule = ?
        `, [matricule]);

        // Ajouter champs vides pour cohérence
        permissions.forEach(p => {
            p.justificatifs = [];
        });

        // 🔄 Fusionner les deux
        const historique = [...conges, ...permissions];

        // 📅 Trier par date de demande (et non date de début)
        historique.sort((a, b) => new Date(b.date_demande) - new Date(a.date_demande));

        res.json({ success: true, data: historique });

    } catch (error) {
        console.error("Erreur récupération historique :", error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

module.exports = router;
