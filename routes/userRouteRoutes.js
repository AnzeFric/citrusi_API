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
  router.get("/sendGyroDataToApi", (req, res) =>
    userRouteController.sendGyroDataToApi(req, res)
  );

  // Get data from database
  router.get("/getGyroDataFromApi", (req, res) =>
    userRouteController.getGyroDataFromApi(req, res)
  );

  // Send data from gyro to web
  router.post("/sendGyroDataToWeb", (req, res) =>
    userRouteController.sendGyroDataToWeb(req, res)
  );

  return router;
};
