const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const passwordResetRoutes = require('./routes/passwordReset');
const congesRoutes = require('./routes/conges');
const permissionsRoutes = require('./routes/permissions');
const accountRoutes = require('./routes/account');
const uploadRoutes = require('./routes/upload');
const { verifyToken } = require('./middleware/auth');
const historiqueRoutes = require('./routes/historique');
const notificationRoutes = require('./routes/notifications');
const accueilRoutes = require('./routes/accueil');
const employerRoutes = require('./routes/employers');

const app = express();

// 🔓 Sert les fichiers PDF (lettres, titres, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ⚠️ CORS
app.use(cors({
    origin: ['http://localhost:5173', 'http://192.168.89.95:5173'], // frontend dev
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// 1️⃣ Routes API
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordResetRoutes);
app.use('/api/conges', congesRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/historique', historiqueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/accueil', accueilRoutes);
app.use('/api/employers', employerRoutes);

// Exemple route protégée
app.get('/api/test', verifyToken, (req, res) => {
    res.json({ message: 'Accès autorisé', user: req.user });
});

// Chemin vers le frontend Vite build
const frontendPath = path.resolve(__dirname, '../frontend/dist');

// Servir tous les fichiers statiques du build
app.use(express.static(frontendPath));

// Rediriger **toutes les routes non-API** vers index.html
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 3️⃣ Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
