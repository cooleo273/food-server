const express = require('express');
const router = express.Router();

// Dummy admin credentials
const ADMIN_USERNAME = 'Leul';
const ADMIN_PASSWORD = '1234';

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate admin credentials
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Generate a simple token (you can use JWT for better security)
    const token = 'secureAdminToken';
    return res.json({ isAdmin: true, token });
  } else {
    return res.json({ isAdmin: false });
  }
});

module.exports = router;
