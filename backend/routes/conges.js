const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Route pour soumettre une demande
router.post('/', async (req, res) => {
    try {
        const { TypeC, DateDemCong, DebC, FinC, TotalCP, CheminDem, Matricule, titres } = req.body;

        // Insérer la demande avec statut "En attente"
        const [resultConge] = await db.query(
            `INSERT INTO CONGE 
            (TypeC, DateDemCong, DebC, FinC, TotalCP, CheminDem, Matricule, StatueC) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'En attente')`,
            [TypeC, DateDemCong, DebC, FinC, TotalCP, CheminDem, Matricule]
        );

        const IdC = resultConge.insertId;

        // Gestion différente selon le type de congé
        if (TypeC === 'Annuel') {
            for (const titre of titres) {
                // Vérifier si le titre existe déjà
                const [existingTitre] = await db.query(
                    'SELECT * FROM TITRE WHERE NumDesc = ?',
                    [titre.NumDesc]
                );

                if (existingTitre.length === 0) {
                    // Créer un nouveau titre
                    await db.query(
                        `INSERT INTO TITRE 
                        (NumDesc, NbrAnne, DC, CP, Reliquat) 
                        VALUES (?, ?, ?, ?, ?)`,
                        [titre.NumDesc, titre.NbrAnne, titre.DC, titre.CP, titre.Reliquat]
                    );
                } else {
                    // Vérifier la cohérence du DC
                    if (existingTitre[0].DC !== titre.DC) {
                        await db.query(
                            `UPDATE CONGE SET StatueC = 'Erreur DC' WHERE IdC = ?`,
                            [IdC]
                        );
                        return res.json({ 
                            success: true, 
                            message: 'Demande enregistrée avec erreur DC',
                            IdC 
                        });
                    }
                }

                // Lier le titre au congé
                await db.query(
                    `INSERT INTO UTILISER 
                    (IdC, NumDesc, CheminTitre) 
                    VALUES (?, ?, ?)`,
                    [IdC, titre.NumDesc, titre.CheminTitre]
                );
            }
        }

        res.json({ 
            success: true, 
            message: 'Demande enregistrée avec succès',
            IdC 
        });

    } catch (err) {
        console.error('Erreur création congé:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Route pour admin - accepter/refuser
router.post('/:id/action', async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'accept' ou 'reject'

        // Récupérer la demande
        const [demande] = await db.query(
            'SELECT * FROM CONGE WHERE IdC = ?',
            [id]
        );

        if (demande.length === 0) {
            return res.status(404).json({ success: false, message: 'Demande non trouvée' });
        }

        // Mettre à jour le statut
        const newStatus = action === 'accept' ? 'Accepté' : 'Refusé';
        await db.query(
            'UPDATE CONGE SET StatueC = ? WHERE IdC = ?',
            [newStatus, id]
        );

        // Si accepté et congé annuel, mettre à jour les titres
        if (action === 'accept' && demande[0].TypeC === 'Annuel') {
            const [titres] = await db.query(
                'SELECT * FROM UTILISER WHERE IdC = ?',
                [id]
            );

            for (const titre of titres) {
                const [titreInfo] = await db.query(
                    'SELECT * FROM TITRE WHERE NumDesc = ?',
                    [titre.NumDesc]
                );

                if (titreInfo.length > 0) {
                    await db.query(
                        'UPDATE TITRE SET CP = CP + ?, Reliquat = Reliquat - ? WHERE NumDesc = ?',
                        [demande[0].TotalCP, demande[0].TotalCP, titre.NumDesc]
                    );
                }
            }
        }

        res.json({ 
            success: true, 
            message: `Demande ${newStatus.toLowerCase()} avec succès` 
        });

    } catch (err) {
        console.error('Erreur traitement demande:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET /api/conge - Liste des demandes
router.get('/', async (req, res) => {
    try {
        const { statut } = req.query;
        let query = `
            SELECT c.*, e.Nom, e.Prenom 
            FROM CONGE c
            JOIN employer e ON c.Matricule = e.Matricule
        `;
        
        if (statut) {
            query += ` WHERE c.StatueC = '${statut}'`;
        }

        const [demandes] = await db.query(query);
        
        // Pour chaque demande, récupérer les titres si nécessaire
        for (const demande of demandes) {
            if (demande.TypeC === 'Annuel') {
                const [titres] = await db.query(`
                    SELECT u.NumDesc, u.CheminTitre, t.DC, t.CP, t.Reliquat
                    FROM UTILISER u
                    LEFT JOIN TITRE t ON u.NumDesc = t.NumDesc
                    WHERE u.IdC = ?
                `, [demande.IdC]);
                demande.titres = titres;
            }
        }

        res.json(demandes);
    } catch (err) {
        console.error('Erreur liste demandes:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET /api/files/:path - Servir les fichiers
router.get('/files/:path', (req, res) => {
    const filePath = path.join(__dirname, '../../uploads', req.params.path);
    res.sendFile(filePath);
});

module.exports = router;