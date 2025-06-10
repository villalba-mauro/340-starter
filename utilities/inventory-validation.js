const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Classification Data Validation Rules
  * ********************************* */
validate.classificationRules = () => {
  return [
    // classification name is required and must be string without spaces or special characters
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .isAlpha()
      .withMessage("Classification name does not meet requirements."),
  ]
}

/* ******************************
 * Check classification data and return errors or continue to registration
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

/*  **********************************
  *  Vehicle Data Validation Rules (NUEVAS VALIDACIONES)
  *  Esta función define las reglas de validación para vehículos
  * ********************************* */
validate.vehicleRules = () => {
  return [
    // Classification is required
    body("classification_id")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Please select a classification."),

    // Make is required and must be string (minimum 3 characters)
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters."),

    // Model is required and must be string (minimum 3 characters)
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters."),

    // Year must be 4 digits
    body("inv_year")
      .trim()
      .notEmpty()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .isLength({ min: 4, max: 4 })
      .withMessage("Year must be a 4-digit number."),

    // Description is required
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Description is required."),

    // Image path is required
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),

    // Thumbnail path is required
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),

    // Price must be decimal or integer (positive number)
    body("inv_price")
      .trim()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    // Miles must be digits only (no commas or spaces)
    body("inv_miles")
      .trim()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Miles must be digits only (no commas)."),

    // Color is required
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Color is required."),
  ]
}

/* ******************************
 * Check vehicle data and return errors or continue to processing
 * Esta función verifica los datos del vehículo y maneja errores
 * ***************************** */
validate.checkVehicleData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body
  
  let errors = []
  errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(classification_id)
    
    // Form stickiness: retorna todos los valores para mantener el formulario
    res.render("inventory/add-vehicle", {
      errors,
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
    return
  }
  next()
}




/* ******************************
 * Check data and return errors to edit view or redirect to management
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    })
    return
  }
  next()
}

module.exports = validate// module.exports = { 
//   classificationRules, 
//   checkClassificationData, 
//   vehicleRules, 
//   checkVehicleData,
//   checkUpdateData 
// }
