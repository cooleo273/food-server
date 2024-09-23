const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer (for handling file uploads)
const upload = multer({ dest: 'uploads/' }); // Temporary storage for files

// MongoDB URI from .env file
const uri = process.env.MONGODB_URI;

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: ["https://savoraddis.netlify.app", "http://localhost:3000"] }));
app.use(express.json());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Upload image to Cloudinary function
const uploadImageToCloudinary = async (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result.secure_url); // Return the URL of the uploaded image
    });
  });
};

// Delete local file after uploading to Cloudinary (optional)
const deleteLocalFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error('Failed to delete local file:', err);
  });
};

// File Upload Route
app.post('/api/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }
    const imageUrl = await uploadImageToCloudinary(req.file.path);
    deleteLocalFile(req.file.path); // Clean up local file after uploading to Cloudinary
    res.json({ message: 'File uploaded successfully', imageUrl: imageUrl });
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

// Root Route (Optional: to list uploaded images stored in Cloudinary)
app.get('/', (req, res) => {
  fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
    if (err) {
      return res.status(500).send({ message: 'Error reading directory' });
    }
    res.json({ images: files });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
