// Needed Resources 
const express = require("express")
const router = new express.Router() 
const { buildLogin, buildRegister, registerAccount  } = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

// Route to build login view
router.get("/login", utilities.handleErrors(buildLogin))

// Route to build registration view
router.get("/register", utilities.handleErrors(buildRegister))

// Process the login attempt (POST route)
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(registerAccount)
)

// Process the login attempt (placeholder for future implementation)
router.post("/login", (req, res) => {
  res.status(200).send('Login attempt received! This will be implemented later.')
})


module.exports = router;