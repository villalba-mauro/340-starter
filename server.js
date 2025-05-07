/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")

/* ***********************
 * Database Connection
 *************************/
const { Pool } = require("pg")
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// Make the pool available to the app
app.locals.pool = pool


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", function(req, res){
  res.render("index", {title: "Home"})
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Error handling
 *************************/
// 404 Page not found
app.use(function (req, res, next) {
  res.status(404).render("errors/404", { title: "404 - Page Not Found" })
})

// 500 Server Error
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).render("errors/500", { title: "500 - Server Error" })
})

/* ***********************
 * Log statement to confirm server operation
 *************************/

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
