const pool = require("../database")

/* *****************************
* Add vehicle to favorites
* ***************************** */
async function addToFavorites(account_id, inv_id) {
  try {
    const sql = "INSERT INTO favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *"
    return await pool.query(sql, [account_id, inv_id])
  } catch (error) {
    console.error("addToFavorites error: " + error)
    return false
  }
}

/* *****************************
* Remove vehicle from favorites
* ***************************** */
async function removeFromFavorites(account_id, inv_id) {
  try {
    const sql = "DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2"
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("removeFromFavorites error: " + error)
    return false
  }
}

/* *****************************
* Get all favorites for a user
* ***************************** */
async function getFavoritesByAccount(account_id) {
  try {
    const sql = `
      SELECT f.favorite_id, f.date_added,
             i.inv_id, i.inv_make, i.inv_model, i.inv_year, 
             i.inv_price, i.inv_thumbnail, i.inv_miles,
             c.classification_name
      FROM favorites f
      JOIN inventory i ON f.inv_id = i.inv_id
      JOIN classification c ON i.classification_id = c.classification_id
      WHERE f.account_id = $1
      ORDER BY f.date_added DESC`
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("getFavoritesByAccount error: " + error)
    return []
  }
}

/* *****************************
* Check if vehicle is in favorites
* ***************************** */
async function isFavorite(account_id, inv_id) {
  try {
    const sql = "SELECT 1 FROM favorites WHERE account_id = $1 AND inv_id = $2"
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rows.length > 0
  } catch (error) {
    console.error("isFavorite error: " + error)
    return false
  }
}

/* *****************************
* Get favorite count for a vehicle
* ***************************** */
async function getFavoriteCount(inv_id) {
  try {
    const sql = "SELECT COUNT(*) as count FROM favorites WHERE inv_id = $1"
    const result = await pool.query(sql, [inv_id])
    return parseInt(result.rows[0].count)
  } catch (error) {
    console.error("getFavoriteCount error: " + error)
    return 0
  }
}

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavoritesByAccount,
  isFavorite,
  getFavoriteCount
}