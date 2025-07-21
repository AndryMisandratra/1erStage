const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.post('/reset', async (req, res) => {
    const { nomUtil, newPassword } = req.body; // Changement de matricule vers nomUtil

    // Validation minimale
    if (typeof nomUtil !== 'string' || nomUtil.trim() === '') {
        return res.status(400).json({ success: false, message: 'Nom utilisateur requis' });
    }
    if (typeof newPassword !== 'string' || newPassword === '') {
        return res.status(400).json({ success: false, message: 'Mot de passe requis' });
    }

    try {
        // 1. Vérifier que l'utilisateur existe
        const [user] = await db.query(
            'SELECT * FROM employer WHERE NomUtil = ?', // Utilisation de NomUtil
            [nomUtil]
        );
        
        if (user.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Nom utilisateur non trouvé' 
            });
        }

        // 2. Mettre à jour le mot de passe (tous caractères acceptés, espaces inclus)
        await db.query(
            'UPDATE employer SET Mdp = ? WHERE NomUtil = ?',
            [newPassword, nomUtil] // Conservation exacte de la casse et des espaces
        );
        
        res.json({ 
            success: true, 
            message: 'Mot de passe mis à jour avec succès' 
        });

    } catch (err) {
        console.error('Erreur réinitialisation mot de passe:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur',
            detail: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

module.exports = router;