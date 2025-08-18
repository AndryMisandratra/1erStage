const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Connexion MySQL

// 📬 POST /api/conges
router.post('/', async (req, res) => {
    try {
        const {
            TypeC,
            DateDemCong,
            DebC,
            FinC,
            TotalCP,
            StatueC,
            Matricule,
            CheminDem,       // reçu directement depuis frontend
            TitresPaths = [],// tableau de chemins de titres (pour "Annuel")
            CheminOrd        // chemin de l’ordonnance (pour Maladie, Maternité, Paternité)
        } = req.body;

        if (!CheminDem) {
            return res.status(400).json({ error: 'Lettre de demande manquante' });
        }

        // 🔽 Insertion dans CONGE
        const [result] = await db.query(`
            INSERT INTO conge (TypeC, DateDemCong, DebC, FinC, TotalCP, StatueC, CheminDem, Matricule)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [TypeC, DateDemCong, DebC, FinC, TotalCP, StatueC, CheminDem, Matricule]
        );

        const newIdC = result.insertId;

        // 🧾 Si "Annuel", enregistrer chaque titre
        if (TypeC === 'Annuel' && TitresPaths.length > 0) {
            for (const cheminTitre of TitresPaths) {
                const [titreResult] = await db.query(
                    `INSERT INTO titre (CheminTitre) VALUES (?)`,
                    [cheminTitre]
                );
                const idTitre = titreResult.insertId;

                await db.query(
                    `INSERT INTO utiliser (IdC, IdTitre) VALUES (?, ?)`,
                    [newIdC, idTitre]
                );
            }
        } 
        else if (['Maladie', 'Maternité', 'Paternité'].includes(TypeC)) {
            if (!CheminOrd) {
                return res.status(400).json({ error: 'Ordonnance obligatoire pour ce type de congé' });
            }

            await db.query(
                'INSERT INTO ordonnance (IdC, CheminOrd) VALUES (?, ?)',
                [newIdC, CheminOrd]
            );
        }

        return res.json({ success: true, message: 'Demande de congé enregistrée avec succès' });

    } catch (e) {
        console.error('Erreur dans POST /api/conges :', e);
        res.status(500).json({ error: 'Erreur interne lors de l\'enregistrement' });
    }
});


module.exports = router;
