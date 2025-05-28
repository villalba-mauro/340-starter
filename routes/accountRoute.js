// Needed Resources 
const express = require("express")
const router = new express.Router() 
const { buildLogin, buildRegister, registerAccount  } = require("../controllers/accountController")
const utilities = require("../utilities/")

// Route to build login view
router.get("/login", utilities.handleErrors(buildLogin))

// Route to build registration view
router.get("/register", utilities.handleErrors(buildRegister))

// Process the login attempt (POST route)
router.post("/login", (req, res) => {
  res.status(200).send('Login attempt received! This will be implemented later.')
})

// Process the registration data (POST route)
router.post("/register", utilities.handleErrors(registerAccount))


module.exports = router;