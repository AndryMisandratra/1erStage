const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 📌 1. Récupérer les demandes en attente de la division
router.get('/demandes/:idDiv', async (req, res) => {
    const { idDiv } = req.params;

    try {
        // 📌 Récupération des congés "En attente"
        const [conges] = await db.query(`
            SELECT 
                c.IdC,
                c.TypeC,
                c.DateDemCong,
                c.DebC,
                c.FinC,
                c.TotalCP,
                c.StatueC,
                c.CheminDem AS lettre,
                e.Matricule,
                e.Nom,
                e.Prenom
            FROM conge c
            JOIN employer e ON c.Matricule = e.Matricule
            WHERE e.IdDiv = ? AND c.StatueC = 'En attente'
        `, [idDiv]);

        // 🔄 Ajouter les titres si type === 'Annuel'
        for (const conge of conges) {
            if (conge.TypeC === 'Annuel') {
                const [titres] = await db.query(`
                    SELECT CheminTitre FROM titre
                    WHERE IdTitre IN (
                        SELECT IdTitre FROM utiliser WHERE IdC = ?
                    )
                `, [conge.IdC]);
                conge.titres = titres.map(t => t.CheminTitre);
            } else {
                conge.titres = [];
            }
        }

        // 📌 Récupération des permissions "En attente"
        const [permissions] = await db.query(`
            SELECT 
                p.IdP,
                p.TypeP,
                p.DateDemPerm,
                p.DebP,
                p.FinP,
                p.NbrjP,
                p.Motif,
                p.StatueP,
                p.LienPerm AS lettre,
                e.Matricule,
                e.Nom,
                e.Prenom
            FROM permission p
            JOIN employer e ON p.Matricule = e.Matricule
            WHERE e.IdDiv = ? AND p.StatueP = 'En attente'
        `, [idDiv]);

        // Ajout d'un champ vide titres pour homogénéité
        permissions.forEach(p => {
            p.titres = [];
        });

        res.json({ success: true, conges, permissions });
    } catch (e) {
        console.error('Erreur GET /notifications/demandes:', e);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


// ✅ 2. Accepter ou refuser une demande de congé
router.put('/conge/:id', async (req, res) => {
    const { id } = req.params;
    const { statut } = req.body;

    try {
        await db.query(`UPDATE conge SET StatueC = ? WHERE IdC = ?`, [statut, id]);
        res.json({ success: true });
    } catch (e) {
        console.error('Erreur PUT /notifications/conge:', e);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ✅ 3. Accepter ou refuser une demande de permission
router.put('/permission/:id', async (req, res) => {
    const { id } = req.params;
    const { statut } = req.body;

    try {
        await db.query(`UPDATE permission SET StatueP = ? WHERE IdP = ?`, [statut, id]);
        res.json({ success: true });
    } catch (e) {
        console.error('Erreur PUT /notifications/permission:', e);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// 🔔 4. Rappels : employés revenant demain
router.get('/rappels/:idDiv', async (req, res) => {
    const { idDiv } = req.params;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    try {
        const [retoursConges] = await db.query(`
            SELECT e.Nom, e.Prenom, 'Congé' AS Type, c.FinC AS retour
            FROM conge c
            JOIN employer e ON c.Matricule = e.Matricule
            WHERE e.IdDiv = ? AND c.FinC = ?
        `, [idDiv, dateStr]);

        const [retoursPermissions] = await db.query(`
            SELECT e.Nom, e.Prenom, 'Permission' AS Type, p.FinP AS retour
            FROM permission p
            JOIN employer e ON p.Matricule = e.Matricule
            WHERE e.IdDiv = ? AND p.FinP = ?
        `, [idDiv, dateStr]);

        res.json({ success: true, retours: [...retoursConges, ...retoursPermissions] });
    } catch (e) {
        console.error('Erreur GET /notifications/rappels:', e);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.get('/count/:idDiv', async (req, res) => {
    const { idDiv } = req.params;

    try {
        // 🔹 1. Compter les congés en attente
        const [congesEnAttente] = await db.query(`
            SELECT COUNT(*) AS total
            FROM conge c
            JOIN employer e ON c.Matricule = e.Matricule
            WHERE e.IdDiv = ? AND c.StatueC = 'En attente'
        `, [idDiv]);

        // 🔹 2. Compter les permissions en attente
        const [permissionsEnAttente] = await db.query(`
            SELECT COUNT(*) AS total
            FROM permission p
            JOIN employer e ON p.Matricule = e.Matricule
            WHERE e.IdDiv = ? AND p.StatueP = 'En attente'
        `, [idDiv]);

        // 🔹 3. Compter les retours demain (congé)
        const [retoursConges] = await db.query(`
            SELECT COUNT(*) AS total
            FROM conge c
            JOIN employer e ON c.Matricule = e.Matricule
            WHERE e.IdDiv = ? 
            AND c.FinC = CURDATE() + INTERVAL 1 DAY
        `, [idDiv]);

        // 🔹 4. Compter les retours demain (permission)
        const [retoursPermissions] = await db.query(`
            SELECT COUNT(*) AS total
            FROM permission p
            JOIN employer e ON p.Matricule = e.Matricule
            WHERE e.IdDiv = ? 
            AND p.FinP = CURDATE() + INTERVAL 1 DAY
        `, [idDiv]);

        // 🔹 5. Total des notifications
        const totalNotifications =
            congesEnAttente[0].total +
            permissionsEnAttente[0].total +
            retoursConges[0].total +
            retoursPermissions[0].total;

        res.json({ success: true, count: totalNotifications });

    } catch (error) {
        console.error('Erreur GET /notifications/count:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});



module.exports = router;
