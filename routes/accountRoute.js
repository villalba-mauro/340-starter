// Needed Resources 
const express = require("express")
const router = new express.Router() 
const { buildLogin, 
        buildRegister, 
        registerAccount, 
        accountLogin, 
        buildAccountManagement,
        buildAccountUpdate,
        updateAccountInfo,
        updatePassword,
        accountLogout,
        buildFavorites,
        addToFavorites,
        removeFromFavorites
} = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

// Route to build login view
router.get("/login", utilities.handleErrors(buildLogin))

// Route to build registration view
router.get("/register", utilities.handleErrors(buildRegister))

// Esta ruta maneja "/account/" cuando el usuario hace login exitoso
// POR ESTA LÍNEA:
router.get("/", utilities.checkLogin, utilities.handleErrors(buildAccountManagement))

// 🔴 NUEVA RUTA: Route to build account update view
router.get("/update/:account_id", 
  utilities.checkLogin, 
  utilities.handleErrors(buildAccountUpdate)
)
// Process the login attempt (POST route)
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(registerAccount)
)

// Process the login attempt (placeholder for future implementation)
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountLogin)
)

// 🔴 NUEVA RUTA: Process account information update
router.post(
  "/update-info",
  utilities.checkLogin,
  regValidate.accountUpdateRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(updateAccountInfo)
)

// 🔴 NUEVA RUTA: Process password change
router.post(
  "/update-password", 
  utilities.checkLogin,
  regValidate.passwordUpdateRules(),
  regValidate.checkPasswordUpdateData,
  utilities.handleErrors(updatePassword)
)
// 🔴 NUEVA RUTA: Process logout
router.get("/logout", utilities.handleErrors(accountLogout))

// Route to build favorites view
router.get("/favorites", utilities.checkLogin, utilities.handleErrors(buildFavorites))

// Route to add vehicle to favorites
router.get("/favorites/add/:inv_id", utilities.checkLogin, utilities.handleErrors(addToFavorites))

// Route to remove vehicle from favorites  
router.get("/favorites/remove/:inv_id", utilities.checkLogin, utilities.handleErrors(removeFromFavorites))



module.exports = router;