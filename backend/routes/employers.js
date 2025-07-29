const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 🧾 GET : Liste des employés d'une division
router.get('/division/:idDiv', async (req, res) => {
  const { idDiv } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT Matricule, Nom, Prenom, Corps, Attribution, Genre FROM employer WHERE IdDiv = ?',
      [idDiv]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erreur GET /employers/division/:idDiv:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

router.post('/', async (req, res) => {
  const { matricule, nom, prenom, corps, attribution, genre, idDiv } = req.body;

  try {
    await db.query(`
      INSERT INTO employer (Matricule, Nom, Prenom, Corps, Attribution, Genre, IdDiv)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [matricule, nom, prenom, corps, attribution, genre, idDiv]);

    res.json({ success: true, message: 'Employé ajouté' });
  } catch (error) {
    console.error('Erreur POST /employers:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout' });
  }
});


router.put('/:matricule', async (req, res) => {
  const { matricule } = req.params;
  const { nom, prenom, corps, attribution, genre, idDiv } = req.body;

  try {
    await db.query(`
      UPDATE employer 
      SET Nom = ?, Prenom = ?, Corps = ?, Attribution = ?, Genre = ?, IdDiv = ?
      WHERE Matricule = ?
    `, [nom, prenom, corps, attribution, genre, idDiv, matricule]);

    res.json({ success: true, message: 'Employé modifié' });
  } catch (error) {
    console.error('Erreur PUT /employers:', error);
    res.status(500).json({ error: 'Erreur lors de la modification' });
  }
});

router.delete('/:matricule', async (req, res) => {
  const { matricule } = req.params;

  try {
    await db.query('DELETE FROM employer WHERE Matricule = ?', [matricule]);
    res.json({ success: true, message: 'Employé supprimé' });
  } catch (error) {
    console.error('Erreur DELETE /employers:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});
