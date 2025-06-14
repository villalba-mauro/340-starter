const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const favoritesModel = require("../models/favorites-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcrypt")
/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword  
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null
  })
}


/* ****************************************
*  Build account update view
* *************************************** */
async function buildAccountUpdate(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  
  // Verificar que el usuario solo pueda editar su propia cuenta
  if (account_id !== parseInt(res.locals.accountData.account_id)) {
    req.flash("notice", "You can only edit your own account.")
    return res.redirect("/account/")
  }
  
  // Obtener datos de la cuenta para pre-poblar formulario
  const accountData = await accountModel.getAccountById(account_id)
  
  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account/")
  }
  
  res.render("account/account-update", {
    title: "Update Account Information",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email
  })
}

/* ****************************************
*  Process Account Information Update
* *************************************** */
async function updateAccountInfo(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  
  // Verificar que el usuario solo pueda editar su propia cuenta
  if (parseInt(account_id) !== parseInt(res.locals.accountData.account_id)) {
    req.flash("notice", "You can only edit your own account.")
    return res.redirect("/account/")
  }
  
  // Actualizar información en la base de datos
  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )
  
  if (updateResult) {
    // Obtener datos actualizados para mostrar en management
    const updatedAccountData = await accountModel.getAccountById(account_id)
    
    // Actualizar JWT token con nueva información
    const accessToken = jwt.sign(updatedAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    
    req.flash("notice", `Congratulations, your account has been updated.`)
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    res.status(501).render("account/account-update", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}

/* ****************************************
*  Process Password Change
* *************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body
  
  // Verificar que el usuario solo pueda editar su propia cuenta
  if (parseInt(account_id) !== parseInt(res.locals.accountData.account_id)) {
    req.flash("notice", "You can only edit your own account.")
    return res.redirect("/account/")
  }
  
  // Hash the new password
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the password change.')
    return res.redirect(`/account/update/${account_id}`)
  }
  
  // Actualizar contraseña en la base de datos
  const updateResult = await accountModel.updatePassword(account_id, hashedPassword)
  
  if (updateResult) {
    req.flash("notice", "Your password has been successfully updated.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    res.redirect(`/account/update/${account_id}`)
  }
}

/* ****************************************
*  Process Logout
* *************************************** */
async function accountLogout(req, res) {
  // Eliminar cookie JWT
  res.clearCookie("jwt")
  
  // Opcional: mensaje de confirmación
  req.flash("notice", "You have been logged out.")
  
  // Redirigir a home
  res.redirect("/")
}

/* ****************************************
*  Build favorites view
* *************************************** */
async function buildFavorites(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id
  
  try {
    const favorites = await favoritesModel.getFavoritesByAccount(account_id)
    res.render("account/favorites", {
      title: "My Favorites",
      nav,
      favorites,
      errors: null
    })
  } catch (error) {
    req.flash("notice", "Error loading favorites.")
    res.redirect("/account/")
  }
}

/* ****************************************
*  Add to favorites
* *************************************** */
// async function addToFavorites(req, res) {
//   const account_id = res.locals.accountData.account_id
//   const inv_id = parseInt(req.params.inv_id)
  
//   try {
//     const result = await favoritesModel.addToFavorites(account_id, inv_id)
//     if (result) {
//       // Respuesta JSON en lugar de redirección
//       res.json({ 
//         success: true, 
//         message: "Vehicle added to favorites!",
//         action: "added"
//       })
//     } else {
//       res.json({ 
//         success: false, 
//         message: "Error adding to favorites." 
//       })
//     }
//   } catch (error) {
//     res.json({ 
//       success: false, 
//       message: "Vehicle is already in your favorites." 
//     })
//   }
// }
async function addToFavorites(req, res) {
  const account_id = res.locals.accountData.account_id
  const inv_id = parseInt(req.params.inv_id)
  
  // 🔧 VERIFICAR que res sea un objeto response válido
  if (!res || typeof res.json !== 'function') {
    console.error('❌ Response object is invalid');
    return;
  }
  
  try {
    const result = await favoritesModel.addToFavorites(account_id, inv_id)
    if (result) {
      // 🔧 ASEGURAR que devolvemos JSON con headers correctos
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({ 
        success: true, 
        message: "Vehicle added to favorites!",
        action: "added"
      });
    } else {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ 
        success: false, 
        message: "Error adding to favorites." 
      });
    }
  } catch (error) {
    console.error('❌ addToFavorites error:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ 
      success: false, 
      message: "Vehicle is already in your favorites." 
    });
  }
}


/* ****************************************
*  Remove from favorites
* *************************************** */
// MODIFICA TEMPORALMENTE esta función en controllers/accountController.js:

async function removeFromFavorites(req, res) {
  const account_id = res.locals.accountData.account_id
  const inv_id = parseInt(req.params.inv_id)
  
  // 🔧 VERIFICAR que res sea un objeto response válido
  if (!res || typeof res.json !== 'function') {
    console.error('❌ Response object is invalid');
    return;
  }
  
  try {
    const result = await favoritesModel.removeFromFavorites(account_id, inv_id)
    if (result) {
      // 🔧 ASEGURAR que devolvemos JSON con headers correctos
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({ 
        success: true, 
        message: "Vehicle removed from favorites!",
        action: "removed"
      });
    } else {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ 
        success: false, 
        message: "Error removing from favorites." 
      });
    }
  } catch (error) {
    console.error('❌ removeFromFavorites error:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ 
      success: false, 
      message: "Error removing from favorites." 
    });
  }
}

/* ****************************************
*  Remove from favorites
* *************************************** */
// async function removeFromFavorites(req, res) {
//   const account_id = res.locals.accountData.account_id
//   const inv_id = parseInt(req.params.inv_id)
  
//   try {
//     const result = await favoritesModel.removeFromFavorites(account_id, inv_id)
//     if (result) {
//       res.json({ 
//         success: true, 
//         message: "Vehicle removed from favorites!",
//         action: "removed"
//       })
//     } else {
//       res.json({ 
//         success: false, 
//         message: "Error removing from favorites." 
//       })
//     }
//   } catch (error) {
//     res.json({ 
//       success: false, 
//       message: "Error removing from favorites." 
//     })
//   }
// }

module.exports = { 
  buildLogin, 
  buildRegister,
  registerAccount, 
  accountLogin , 
  buildAccountManagement,
  buildAccountUpdate,
  updateAccountInfo,
  updatePassword,
  accountLogout,
  buildFavorites,
  addToFavorites,
  removeFromFavorites
}