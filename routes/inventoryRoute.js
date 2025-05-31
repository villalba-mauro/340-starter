// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// NUEVA RUTA: Route to build inventory detail view (TASK 1)
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

router.get("/", utilities.handleErrors(invController.buildManagement));

// Route to build add classification view (TASK 2)
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// Route to process add classification (TASK 2)
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// TASK 3: Intentional Error Route (ruta para generar error intencional)
router.get("/trigger-error", utilities.handleErrors(invController.triggerError));

module.exports = router;