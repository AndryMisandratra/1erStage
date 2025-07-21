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

const app = express();

// ⚠️ 1. Autoriser les requêtes cross-origin AVANT les routes
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// 2. Routes API
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordResetRoutes);
app.use('/api/conges', congesRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/account', accountRoutes);

// ✅ NE PAS utiliser verifyToken ici sauf si nécessaire
app.use('/api/upload', uploadRoutes);

// 3. Pour permettre l'accès aux fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Route protégée exemple
app.get('/api/test', verifyToken, (req, res) => {
    res.json({ message: 'Accès autorisé', user: req.user });
});

const notifRoutes = require('./routes/notifications');
app.use('/api/notifications', notifRoutes);


// 5. Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Serveur démarré sur http://localhost:${PORT}`));
