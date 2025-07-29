const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 📌 GET /api/accueil/:idDiv?mois=7&annee=2025
router.get('/:idDiv', async (req, res) => {
  const { idDiv } = req.params;
  const { mois, annee } = req.query;

  try {
    const [conges] = await db.query(`
      SELECT e.Nom, e.Prenom, 'Congé' AS Type, c.DateDemCong AS dateDemande, c.DebC AS debut, c.FinC AS fin
      FROM conge c
      JOIN employer e ON c.Matricule = e.Matricule
      WHERE e.IdDiv = ? AND MONTH(c.DebC) = ? AND YEAR(c.DebC) = ? AND c.StatueC = 'Accepter'
    `, [idDiv, mois, annee]);

    const [permissions] = await db.query(`
      SELECT e.Nom, e.Prenom, 'Permission' AS Type, p.DateDemPerm AS dateDemande, p.DebP AS debut, p.FinP AS fin
      FROM permission p
      JOIN employer e ON p.Matricule = e.Matricule
      WHERE e.IdDiv = ? AND MONTH(p.DebP) = ? AND YEAR(p.DebP) = ? AND p.StatueP = 'Accepter'
    `, [idDiv, mois, annee]);

    const absences = [...conges, ...permissions];
    absences.sort((a, b) => new Date(a.debut) - new Date(b.debut));

    res.json({ success: true, data: absences });
  } catch (e) {
    console.error('Erreur GET /accueil/:idDiv', e);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
