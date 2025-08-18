const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

//Route api/auth/login
router.post('/login', async (req, res) => {
    const { nomUtil, mdp } = req.body;
    
    // Validation des entrées
    if (typeof nomUtil !== 'string' || typeof mdp !== 'string' || 
        nomUtil.trim() !== nomUtil || mdp.trim() !== mdp) {
        return res.status(400).json({ 
            success: false,
            message: 'Format des données invalide' 
        });
    }

    try {
        //Recherche de l'utilisateur par NomUtil (sensible à la casse)
        const [rows] = await db.query(
            `SELECT e.*, d.Libelle as division_libelle 
             FROM employer e 
             JOIN division d ON e.IdDiv = d.IdDiv 
             WHERE BINARY e.NomUtil = ?`,
            [nomUtil]
        );

        // Gestion utilisateur
        if (rows.length === 0) {
            const [anyUser] = await db.query('SELECT 1 FROM employer LIMIT 1');
            return res.status(401).json({
                success: false,
                message: anyUser.length > 0 ? 'Nom utilisateur incorrect' : 'Aucun compte existant'
            });
        }

        //Vérification mot de passe
        const user = rows[0];
        if (user.Mdp !== mdp) {
            return res.status(401).json({ 
                success: false,
                message: 'Mot de passe erroné' 
            });
        }

        //Connexion réussie
        const token = jwt.sign(
            { 
                matricule: user.Matricule,
                nomUtil: user.NomUtil,
                nom: user.Nom,
                prenom: user.Prenom,
                attribution: user.Attribution,
                idDiv: user.IdDiv
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            success: true,
            token,
            isAdmin: user.Attribution === 'Président' || user.Attribution === 'Commissaire Financier',
            user: {
                nomUtil: user.NomUtil,
                matricule: user.Matricule,
                nom: user.Nom,
                prenom: user.Prenom,
                corps: user.Corps,
                attribution: user.Attribution,
                genre: user.Genre,
                idDiv: user.IdDiv,
                division: user.division_libelle
            }
        });

    } catch (err) {
        console.error('Erreur connexion:', err);
        res.status(500).json({ 
            success: false,
            message: 'Erreur interne du serveur' 
        });
    }
});

module.exports = router;