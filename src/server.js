const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const upload = require('./middlewares/upload'); // Use Cloudinary storage upload middleware

// MongoDB URI from .env file
const uri = process.env.MONGODB_URI;

// Initialize Express app
const app = express();

// Middleware
app.options('*', cors());
app.use(cors({ origin: ["https://savoraddis.netlify.app", "http://localhost:3000"] }));
app.use(express.json());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// File Upload Route (Upload directly to Cloudinary)
app.post('/api/upload', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }
    res.json({ message: 'File uploaded successfully', imageUrl: req.file.path });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed', details: error });
  }
});

// Import Routes
const menuRoutes = require('./routes/menus');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

// Use Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
