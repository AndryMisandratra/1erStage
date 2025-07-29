const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 📌 1. Récupérer les demandes en attente de la division
router.get('/demandes/:idDiv', async (req, res) => {
    const { idDiv } = req.params;

    try {
        const [conges] = await db.query(`
            SELECT c.IdC, e.Nom, e.Prenom, c.TypeC, c.DebC, c.FinC, c.StatueC
            FROM conge c
            JOIN employer e ON c.Matricule = e.Matricule
            WHERE e.IdDiv = ? AND c.StatueC = 'En attente'
        `, [idDiv]);

        const [permissions] = await db.query(`
            SELECT p.IdP, e.Nom, e.Prenom, p.TypeP, p.DebP, p.FinP, p.StatueP
            FROM permission p
            JOIN employer e ON p.Matricule = e.Matricule
            WHERE e.IdDiv = ? AND p.StatueP = 'En attente'
        `, [idDiv]);

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

module.exports = router;
