const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu.js');
const upload = require('../middlewares/upload');

// Get all menus
router.get('/', async (req, res) => {
    console.log('Received GET request for menus');
    try {
        const menus = await Menu.find();
        console.log('Menus fetched:', menus);
        res.json(menus);
    } catch (error) {
        console.error('Error fetching menus:', error);
        res.status(500).json({ error: 'Failed to fetch menus' });
    }
});

// Add a new menu item
router.post('/', upload.single('photo'), async (req, res) => {
    const { cafe, name, price, description, category } = req.body;

    if (!cafe || !name || !price || !description || !category) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
        return res.status(400).json({ error: 'Price must be a valid number' });
    }

    try {
        const newItem = {
            name,
            price: parsedPrice,
            photo: req.file.path, // Now this will be the Cloudinary URL
            description,
            category,
        };

        let menu = await Menu.findOne({ cafe });
        if (menu) {
            const itemExists = menu.items.some(item => item.name === name);
            if (itemExists) {
                return res.status(400).json({ error: 'Item already exists in this cafe menu' });
            }
            menu.items.push(newItem);
        } else {
            menu = new Menu({
                cafe,
                items: [newItem],
            });
        }

        await menu.save();
        res.status(201).json({ message: 'Menu item added successfully', menu });
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ error: 'Failed to add menu item', details: error.message });
    }
});


// Update a menu item
// Update a menu item
router.put('/:menuId/:itemId', upload.single('photo'), async (req, res) => {
    const { menuId, itemId } = req.params;
    const { name, price, description, category } = req.body;

    if (!name || !price || !description || !category) {
        return res.status(400).json({ error: 'Item name, price, description, and category are required' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
        return res.status(400).json({ error: 'Price must be a valid number' });
    }

    try {
        const menu = await Menu.findById(menuId);
        if (!menu) {
            return res.status(404).json({ error: 'Menu not found' });
        }

        const item = menu.items.id(itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        item.name = name;
        item.price = parsedPrice;
        item.description = description;
        item.category = category;

        if (req.file) {
            item.photo = req.file.path; // Update the photo if a new one is provided
        }

        await menu.save();
        res.json({ message: 'Menu item updated successfully' });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Failed to update menu item' });
    }
});


// Delete a menu item
router.delete('/:menuId/:itemId', async (req, res) => {
    const { menuId, itemId } = req.params;

    try {
        const menu = await Menu.findById(menuId);
        if (!menu) {
            return res.status(404).json({ error: 'Menu not found' });
        }

        const item = menu.items.id(itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        menu.items = menu.items.filter(item => item._id.toString() !== itemId);

        await menu.save();
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: 'Failed to delete menu item' });
    }
});

module.exports = router;
