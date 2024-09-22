const express = require('express');
const mongoose = require('mongoose');
// Load environment variables from .env file
require('dotenv').config();

const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const upload = require('./middlewares/upload'); // Import your upload middleware

const app = express();

// Middleware
app.use(cors({origin:["https://savoraddis.netlify.app", "http://localhost:3000"]}));
app.use(express.json());
app.use(bodyParser.json());

const uri = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(uri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Import Routes
const menuRoutes = require('./routes/menus');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

// File Upload Route
app.post('/api/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a file' });
    }
    res.json({ message: 'File uploaded successfully', filename: req.file.filename });
});

// Use Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Root Route to list files
app.get('/', (req, res) => {
    fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
        if (err) {
            return res.status(500).send({ message: 'Error reading directory' });
        }
        res.json({ images: files });
    });
});
console.log('Chapa Secret Key:', process.env.CHAPA_SECRET_KEY);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
