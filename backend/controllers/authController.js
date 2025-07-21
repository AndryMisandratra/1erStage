const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ajoutez cette ligne en haut du fichier


const token = jwt.sign(
  { 
    matricule: user.Matricule,
  }, 
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);