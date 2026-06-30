const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const Artwork = require('../models/Artwork');
const Comment = require('../models/Comment');
const User = require('../models/User');

// @desc    Get all artworks
// @route   GET /api/artworks
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, sort } = req.query;
        let query = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        let artworks = await Artwork.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        // Sort options
        if (sort === 'popular') {
            artworks = artworks.sort((a, b) => b.likes.length - a.likes.length);
        } else if (sort === 'views') {
            artworks = artworks.sort((a, b) => b.views - a.views);
        }

        res.status(200).json({
            success: true,
            count: artworks.length,
            artworks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get single artwork
// @route   GET /api/artworks/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id)
            .populate('user', 'name email bio location');

        if (!artwork) {
            return res.status(404).json({
                success: false,
                message: 'Artwork not found'
            });
        }

        artwork.views += 1;
        await artwork.save();

        const comments = await Comment.find({ artwork: req.params.id })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            artwork,
            comments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Create artwork
// @route   POST /api/artworks
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const artwork = await Artwork.create({
            title: req.body.title,
            artist: req.body.artist,
            year: req.body.year,
            category: req.body.category,
            medium: req.body.medium,
            dimensions: req.body.dimensions || '',
            price: req.body.price || 0,
            description: req.body.description || '',
            imageUrl: imageUrl,
            user: req.user.id
        });

        res.status(201).json({
            success: true,
            artwork
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Like/Unlike artwork
// @route   PUT /api/artworks/:id/like
// @access  Private
router.put('/:id/like', protect, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) {
            return res.status(404).json({ success: false, message: 'Artwork not found' });
        }

        const index = artwork.likes.indexOf(req.user.id);
        let liked = false;

        if (index === -1) {
            artwork.likes.push(req.user.id);
            liked = true;
        } else {
            artwork.likes.splice(index, 1);
        }

        await artwork.save();

        res.status(200).json({
            success: true,
            liked,
            likes: artwork.likes.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Save/Unsave artwork
// @route   PUT /api/artworks/:id/save
// @access  Private
router.put('/:id/save', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({ success: false, message: 'Artwork not found' });
        }

        const index = user.savedArtworks.indexOf(req.params.id);
        let saved = false;

        if (index === -1) {
            user.savedArtworks.push(req.params.id);
            saved = true;
        } else {
            user.savedArtworks.splice(index, 1);
        }

        await user.save();

        res.status(200).json({
            success: true,
            saved
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Increment shares
// @route   PUT /api/artworks/:id/share
// @access  Public
router.put('/:id/share', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) {
            return res.status(404).json({ success: false, message: 'Artwork not found' });
        }

        artwork.shares += 1;
        await artwork.save();

        res.status(200).json({
            success: true,
            shares: artwork.shares
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Increment downloads
// @route   PUT /api/artworks/:id/download
// @access  Public
router.put('/:id/download', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) {
            return res.status(404).json({ success: false, message: 'Artwork not found' });
        }

        artwork.downloads += 1;
        await artwork.save();

        res.status(200).json({
            success: true,
            downloads: artwork.downloads
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;