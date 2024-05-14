/*
 * imageRoutes.js
 */
 
var express = require('express');
var router = express.Router();
var imageController = require('../controllers/imageController.js');

module.exports = (supabase) => {
    // Get all images
    router.get('/list', (req, res) => imageController.list(req, res, supabase));

    // Create a new image
    router.post('/create', (req, res) => imageController.create(req, res, supabase));

    // Delete an image
    router.delete('/delete/:id', (req, res) => imageController.delete(req, res, supabase));

    // Update an image
    router.put('/update/:id', (req, res) => imageController.update(req, res, supabase));

    return router;
};