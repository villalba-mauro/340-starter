// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// NUEVA RUTA: Route to build inventory detail view (TASK 1)
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

// TASK 3: Intentional Error Route (ruta para generar error intencional)
router.get("/trigger-error", utilities.handleErrors(invController.triggerError));

module.exports = router;