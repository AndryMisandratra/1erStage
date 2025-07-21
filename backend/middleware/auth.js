const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) return res.status(403).send('Token required');
    
    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send('Invalid token');
        req.user = decoded;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user.attribution !== 'Président' && req.user.attribution !== 'Commissaire Financier') {
        return res.status(403).send('Admin access required');
    }
    next();
};

module.exports = { verifyToken, isAdmin };