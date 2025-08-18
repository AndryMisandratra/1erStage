const jwt = require('jsonwebtoken');
require('dotenv').config();


const token = jwt.sign(
  { 
    matricule: user.Matricule,
  }, 
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);