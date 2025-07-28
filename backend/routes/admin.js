const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/employes', authMiddleware, async (req, res) => {
  const admin = req.user; // contient IdDiv de l'admin
  const { Nom, Prenom, Corps, Attribution, Genre } = req.body;

  await db.query(
    `INSERT INTO employer (Matricule, Nom, Prenom, Corps, Attribution, Genre, IdDiv)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [Matricule, Nom, Prenom, Corps, Attribution, Genre, admin.IdDiv]
  );
  res.json({ success: true });
});


router.get('/notifications', async (req, res) => {
  const { IdDiv } = req.user;
  // demandes congés en attente
  const [conges] = await db.query(
    `SELECT c.IdC, e.Matricule, e.Nom, e.Prenom, c.TypeC, c.DateDemCong
     FROM conge c
     JOIN employer e ON c.Matricule = e.Matricule
     WHERE c.StatueC = 'En attente' AND e.IdDiv = ?`, [IdDiv]);

  const [perms] = await db.query(
    `SELECT p.IdP, e.Matricule, e.Nom, e.Prenom, p.TypeP, p.DateDemPerm
     FROM permission p
     JOIN employer e ON p.Matricule = e.Matricule
     WHERE p.StatueP = 'En attente' AND e.IdDiv = ?`, [IdDiv]);

  res.json({ success: true, data: { conges, perms } });
});


router.post('/notifications/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const statue = req.body.statut; // "Accepter" ou "Refuser"
  if (type === 'conge') {
    await db.query(`UPDATE conge SET StatueC = ? WHERE IdC = ?`, [statue, id]);
  } else {
    await db.query(`UPDATE permission SET StatueP = ? WHERE IdP = ?`, [statue, id]);
  }
  res.json({ success: true });
});


router.get('/retours-aujourdhui', async (req, res) => {
  const { IdDiv } = req.user;
  const today = new Date().toISOString().slice(0, 10);
  const [list] = await db.query(`
    SELECT e.Matricule, e.Nom, e.Prenom
    FROM employer e
    LEFT JOIN conge c ON e.Matricule = c.Matricule AND c.StatueC = 'Accepter'
    LEFT JOIN permission p ON e.Matricule = p.Matricule AND p.StatueP = 'Accepter'
    WHERE e.IdDiv = ? AND (
      (c.FinC = ?) OR (p.FinP = ?)
    )`, [IdDiv, today, today]);
  res.json({ success: true, data: list });
});


router.get('/calendrier-moispourdivision', async (req, res) => {
  const { IdDiv } = req.user;
  const mois = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [events] = await db.query(`
    SELECT e.Matricule, e.Nom, e.Prenom,
           c.DebC AS debut, c.FinC AS fin
    FROM conge c JOIN employer e ON c.Matricule = e.Matricule
    WHERE e.IdDiv = ? AND c.StatueC = 'Accepter' AND DATE_FORMAT(c.DebC, '%Y-%m') = ?
    UNION ALL
    SELECT e.Matricule, e.Nom, e.Prenom,
           p.DebP AS debut, p.FinP AS fin
    FROM permission p JOIN employer e ON p.Matricule = e.Matricule
    WHERE e.IdDiv = ? AND p.StatueP = 'Accepter' AND DATE_FORMAT(p.DebP, '%Y-%m') = ?
    `, [IdDiv, mois, IdDiv, mois]);
  res.json({ success: true, data: events });
});
