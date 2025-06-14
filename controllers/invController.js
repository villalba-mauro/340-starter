const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const favoritesModel = require("../models/favorites-model")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory detail view (NUEVA FUNCIÓN PARA TASK 1)
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInventoryByInvId(inv_id)
  const detailHtml = await utilities.buildDetailView(data)
  let nav = await utilities.getNav()
  const vehicleTitle = `${data.inv_year} ${data.inv_make} ${data.inv_model}`
  
  // Check if user is logged in and if vehicle is in favorites
  let isFavorite = false
  if (res.locals.loggedin) {
    // 🔍 DEBUG temporal: agregar logs
    console.log('🔍 Checking favorite for user:', res.locals.accountData.account_id, 'vehicle:', inv_id);
    isFavorite = await favoritesModel.isFavorite(res.locals.accountData.account_id, inv_id)
    console.log('🔍 Result isFavorite:', isFavorite);
  }
  
  console.log('🔍 Sending to view:', {
    inv_id,
    account_id: res.locals.accountData?.account_id,
    isFavorite,
    loggedin: res.locals.loggedin
  });
  
  res.render("./inventory/detail", {
    title: vehicleTitle,
    nav,
    detailHtml,
    vehicle: data,
    isFavorite,
  })
}
/* ***************************
 *  Build management view 
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  
  // AGREGAR ESTA LÍNEA:
  const classificationSelect = await utilities.buildClassificationList()
  
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect, // AGREGAR ESTA LÍNEA
  })
}

/* ***************************
 *  Build add classification view (TASK 2)
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Process add classification (TASK 2)
 * ************************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const addResult = await invModel.addClassification(classification_name)

  if (addResult) {
    req.flash(
      "notice",
      `The ${classification_name} classification was successfully added.`
    )
    nav = await utilities.getNav() // Regenerate nav to include new classification
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect: await utilities.buildClassificationList(), // AGREGAR ESTA LÍNEA
    })
  } else {
    req.flash("notice", "Sorry, adding the classification failed.")
    res.status(501).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  }
}


/* ***************************
 *  Trigger intentional error (NUEVA FUNCIÓN PARA TASK 3)
 * ************************** */
invCont.triggerError = async function (req, res, next) {
  // Genera un error intencional tipo 500 (Server Error)
  throw new Error("This is an intentional 500 error for testing purposes!")
}

/* ***************************
 *  Build add vehicle view (FUNCIÓN FALTANTE)
 *  Esta función construye la vista para agregar nuevos vehículos
 * ************************** */
invCont.buildAddVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  
  // Construye el dropdown de clasificaciones
  let classificationSelect = await utilities.buildClassificationList()
  
  res.render("./inventory/add-vehicle", {
    title: "Add New Vehicle",
    nav,
    classificationSelect,
    errors: null,
  })
}

/* ***************************
 *  Esta función procesa el formulario de agregar vehículo
 * ************************** */
invCont.addVehicle = async function (req, res) {
  let nav = await utilities.getNav()
  let classificationSelect = await utilities.buildClassificationList()
  
  // Extrae todos los campos del vehículo del cuerpo de la petición
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

  // Intenta agregar el vehículo a la base de datos
  const addResult = await invModel.addVehicle(
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
  )

  if (addResult) {
    // Si es exitoso, muestra mensaje de éxito
    req.flash(
      "notice",
      `The ${inv_year} ${inv_make} ${inv_model} was successfully added.`
    )
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect: await utilities.buildClassificationList(),
    })
  } else {
    // Si falla, muestra mensaje de error y regresa al formulario con datos (form stickiness)
    req.flash("notice", "Sorry, adding the vehicle failed.")
    res.status(501).render("./inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      errors: null,
      // Form stickiness: mantiene los datos ingresados
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
  }
}


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInvId(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInvId(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

/* ***************************
 *  Process Delete Inventory
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)
  
  const deleteResult = await invModel.deleteInventory(inv_id)
  
  if (deleteResult) {
    req.flash("notice", "The vehicle was successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}
// AGREGAR estas funciones al final del archivo, antes de:
// module.exports = invCont

module.exports = invCont