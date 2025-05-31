const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the detail view HTML (NUEVA FUNCIÓN PARA TASK 1)
* ************************************ */
Util.buildDetailView = async function(vehicle){
  let detailHtml = "";
  if(vehicle){
    detailHtml += '<div class="detail-grid">';
    detailHtml += '<div class="detail-item">';
    
    // Image Container - usa imagen completa, no thumbnail
    detailHtml += '<div class="image-container">';
    detailHtml += '<img src="' + vehicle.inv_image + '" alt="Image of ' 
    + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" />';
    detailHtml += '</div>';
    
    // Details Container
    detailHtml += '<div class="details-container">';
    
    // Vehicle Title (Make and Model)
    detailHtml += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h2>';
    
    // Price - formato igual que buildDetailGrid
    detailHtml += '<p class="price"><strong> Price:'  
    + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</strong></p>';
    
    // Description
    detailHtml += '<p class="description"><strong>Description</strong>: ' 
    + vehicle.inv_description + '</p>';
    
    // Color
    detailHtml += '<p class="miles"><strong>Color:</strong> ' + vehicle.inv_color + '</p>';
    
    // Miles
    detailHtml += '<p class="miles"><strong>Miles:</strong> ' 
    + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</p>';
    
    // Botón especial para DeLorean vs otros vehículos
    if (vehicle.inv_model === "DeLorean") {
      detailHtml += '<a class="cta-button" href="/own/special/' + vehicle.inv_id 
      + '" title="View special DeLorean details"><button>Special DeLorean!</button></a>';
    } else {
      detailHtml += '<a class="cta-button" href="/own/own-today/' + vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model 
      + ' details"><button>Buy now!</button></a>';
    }
    
    detailHtml += '</div>'; // close details-container
    detailHtml += '</div>'; // close detail-item
    detailHtml += '</div>'; // close detail-grid
  } else { 
    detailHtml += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return detailHtml;
}

/* ************************
 * Constructs el dropdown de clasificaciones (FUNCIÓN FALTANTE)
 * Esta función crea el HTML select para elegir clasificación en formularios
 ************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classification_id" class="input" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}