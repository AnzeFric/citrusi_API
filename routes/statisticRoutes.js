/*
 * statisticRoutes.js
 */
 
var express = require('express');
var router = express.Router();
var statisticController = require('../controllers/statisticController.js');

module.exports = (supabase) => {
    // Display all statistics of user
    router.get('/:id', (req, res) => statisticController.display(req, res, supabase));

    return router;
};