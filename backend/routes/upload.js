const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();


// Fonction utilitaire pour configurer Multer dynamiquement
const getStorage = (folderName) => multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, `../../uploads/${folderName}`);
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
};

// ===== Route: Lettre de permission =====
router.post('/permissions', multer({
    storage: getStorage('permissions'),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
    res.json({ success: true, path: `/uploads/permissions/${req.file.filename}` });
});

// ===== Route: Lettre de demande de congé =====
router.post('/demandes', multer({
    storage: getStorage('demandes'),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
    res.json({ success: true, path: `/uploads/demandes/${req.file.filename}` });
});

// ===== Route: Titre justificatif =====
router.post('/titres', multer({
    storage: getStorage('titres'),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
    res.json({ success: true, path: `/uploads/titres/${req.file.filename}` });
});

// ===== Route: Ordonnance ====
router.post('/ordonnances', multer({
    storage: getStorage('ordonnances'),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
    res.json({ success: true, path: `/uploads/ordonnances/${req.file.filename}` });
});
module.exports = router;
