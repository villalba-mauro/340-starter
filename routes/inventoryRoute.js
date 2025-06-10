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

router.get("/",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildManagement));

// Route to build add classification view (TASK 2)
router.get("/add-classification",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddClassification));

// Route to process add classification (TASK 2)
router.post(
  "/add-classification",
  utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route to build add vehicle view (NUEVA RUTA)
router.get("/add-vehicle", 
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddVehicle));

// Route to process add vehicle (NUEVA RUTA con validaciones)
router.post(
  "/add-vehicle",
  utilities.checkAccountType,
  invValidate.vehicleRules(),
  invValidate.checkVehicleData,
  utilities.handleErrors(invController.addVehicle)
);

// NUEVA RUTA: Route to get inventory items by classification as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to build edit inventory view  
router.get("/edit/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.editInventoryView));

// Route to process the inventory update
router.post("/update", 
  utilities.checkAccountType,
  invValidate.vehicleRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// TASK 3: Intentional Error Route (ruta para generar error intencional)
router.get("/trigger-error", utilities.handleErrors(invController.triggerError));

module.exports = router;