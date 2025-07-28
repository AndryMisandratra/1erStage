const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { TypeP, DateDemPerm, DebP, FinP, NbrjP, Motif, LienPerm, Matricule } = req.body;
        
        // Validation
        if (NbrjP > 3) {
            return res.status(400).json({ 
                success: false, 
                message: 'La permission ne peut excéder 3 jours' 
            });
        }

        const [result] = await db.query(
            `INSERT INTO PERMISSION 
            (TypeP, DateDemPerm, DebP, FinP, NbrjP, Motif, LienPerm, Matricule, StatueP) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'En attente')`,
            [TypeP, DateDemPerm, DebP, FinP, NbrjP, Motif, LienPerm, Matricule]
        );

        res.json({ 
            success: true, 
            message: 'Demande de permission enregistrée',
            IdP: result.insertId
        });
    } catch (err) {
        console.error('Erreur création permission:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});




module.exports = router;