/*
 * routeRoutes.js
 */
 
var express = require('express');
var router = express.Router();
var routeController = require('../controllers/routeController.js');

module.exports = (supabase) => {
    // List all routes
    router.get('/list', (req, res) => routeController.list(req, res, supabase));

    // Create a new route
    router.post('/create', (req, res) => routeController.create(req, res, supabase));

    return router;
};