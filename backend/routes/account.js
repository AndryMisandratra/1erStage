const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.post('/create', async (req, res) => {
    const { matricule, nomUtil, mdp } = req.body;

    // Validation
    if (!matricule || !nomUtil || !mdp) {
        return res.status(400).json({ 
            success: false,
            message: 'Tous les champs sont obligatoires' 
        });
    }

    if (nomUtil.length > 10) {
        return res.status(400).json({
            success: false,
            message: 'Le nom utilisateur ne doit pas dépasser 10 caractères'
        });
    }

    try {
        // Vérifier si le matricule existe
        const [employe] = await db.query(
            'SELECT * FROM employer WHERE Matricule = ?',
            [matricule]
        );

        if (employe.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Matricule non trouvé'
            });
        }

        // Vérifier si le compte existe déjà
        if ((employe[0].NomUtil && employe[0].NomUtil.trim() !== '') || 
            (employe[0].Mdp && employe[0].Mdp.trim() !== '')) {
            return res.status(409).json({
                success: true,
                message: 'Un compte existe déjà pour ce matricule'
            });
        }


        // Mettre à jour le compte
        await db.query(
            'UPDATE employer SET NomUtil = ?, Mdp = ? WHERE Matricule = ?',
            [nomUtil, mdp, matricule]
        );

        res.json({
            success: true,
            message: 'Compte créé avec succès'
        });

    } catch (err) {
        console.error('Erreur création compte:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

module.exports = router;