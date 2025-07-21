const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        /*const [conges] = await db.query(
            `SELECT 'Congé' AS type, IdC as id, Matricule, DebC as debut, FinC as fin, LienC as lien
             FROM CONGE WHERE Statut = 'En attente'`
        );*/

        const [permissions] = await db.query(
            `SELECT  Permission.TypeP, Permission.NbrjP, Permission.Datedeb, Permission.DateFin, Permission.Motif, 
            Permission.LienPerm, Permission.StatueP, Permission.Matricule, Employer.Nom 
            FROM PERMISSION, EMPLOYER WHERE Permission.Matricule = Emplyer.Matricule, StatueP = 'En attente'`
        );

        //console.log("Congés :", conges);
        console.log("Permissions :", permissions);

        res.json([...permissions]);
    } catch (err) {
        console.error('Erreur dans /api/notifications :', err.message);
        res.status(500).json({ message: 'Erreur serveur', details: err.message });
    }
});


module.exports = router;
