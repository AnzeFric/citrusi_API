/*
 * routeRoutes.js
 */

var express = require('express');
var router = express.Router();
var routeController = require('../controllers/routeController.js');

module.exports = (supabase) => {
    // List all routes
    router.get('/list', (req, res) => routeController.list(req, res, supabase));

    // List all routes with pagination
    router.get('/list-paginated', (req, res) => {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;
        routeController.listPaged(req, res, supabase, limit, offset);
    });

    // Create a new route
    router.post('/create', (req, res) => routeController.create(req, res, supabase));

    router.get('/in-proximity', (req, res) => routeController.inProximity(req, res, supabase));

    router.get('/get-route', (req, res) => routeController.getSingle(req, res, supabase));
    return router;
};