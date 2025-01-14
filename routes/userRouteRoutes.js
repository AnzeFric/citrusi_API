/*
 * userRouteRoutes.js
 */

const express = require("express");
const router = express.Router();
const userRouteController = require("../controllers/userRouteController");

module.exports = (supabase) => {
  // Get all user routes
  router.get("/", (req, res) => userRouteController.list(req, res, supabase));

  // Create a new user route
  router.post("/", (req, res) =>
    userRouteController.create(req, res, supabase)
  );

  // Update a user route
  router.put("/:id", (req, res) =>
    userRouteController.update(req, res, supabase)
  );

  // Delete a user route
  router.delete("/:id", (req, res) =>
    userRouteController.delete(req, res, supabase)
  );

  // Send data from gyro to api to save on database
  router.post("/add-gyro-measurement", (req, res) =>
    userRouteController.sendGyroDataToApi(req, res, supabase)
  );

  // Get data from database
  router.get("/getGyroDataFromApi/:id", (req, res) =>
    userRouteController.getGyroDataFromApi(req, res, supabase)
  );

  // Get step count
  router.get("/getStepCount/:id", (req, res) =>
    userRouteController.getStepCount(req, res, supabase)
  );

  return router;
};
