const pool = require("../database")

/* *****************************
* Add vehicle to favorites
* ***************************** */
// async function addToFavorites(account_id, inv_id) {
//   try {
//     const sql = "INSERT INTO favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *"
//     return await pool.query(sql, [account_id, inv_id])
//   } catch (error) {
//     console.error("addToFavorites error: " + error)
//     return false
//   }
// }
async function addToFavorites(account_id, inv_id) {
  try {
    console.log('🔍 Model: Adding to favorites:', { account_id, inv_id });
    const sql = "INSERT INTO favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *"
    const result = await pool.query(sql, [account_id, inv_id])
    console.log('✅ Model: Added to favorites, result:', result.rows[0]);
    return result.rows[0]
  } catch (error) {
    console.error("addToFavorites error: " + error.message)
    // Re-lanzar el error para que el controlador lo maneje
    throw error
  }
}
/* *****************************
* Remove vehicle from favorites
* ***************************** */
// async function removeFromFavorites(account_id, inv_id) {
//   try {
//     const sql = "DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2"
//     const result = await pool.query(sql, [account_id, inv_id])
//     return result.rowCount > 0
//   } catch (error) {
//     console.error("removeFromFavorites error: " + error)
//     return false
//   }
// }
// MODIFICA TEMPORALMENTE esta función en models/favorites-model.js para debug:

async function removeFromFavorites(account_id, inv_id) {
  try {
    // 🔍 DEBUG: Imprimir los valores que estamos intentando eliminar
    console.log("🔍 DEBUG removeFromFavorites:");
    console.log("  - account_id:", account_id, "tipo:", typeof account_id);
    console.log("  - inv_id:", inv_id, "tipo:", typeof inv_id);
    
    // 🔍 DEBUG: Primero verificar si el registro existe
    const checkSql = "SELECT * FROM favorites WHERE account_id = $1 AND inv_id = $2";
    const checkResult = await pool.query(checkSql, [account_id, inv_id]);
    console.log("  - Registros encontrados:", checkResult.rows.length);
    console.log("  - Datos encontrados:", checkResult.rows);
    
    // Si no existe el registro, retornar false
    if (checkResult.rows.length === 0) {
      console.log("❌ No se encontró el registro para eliminar");
      return false;
    }
    
    // 🔍 DEBUG: Intentar eliminar
    const sql = "DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2";
    console.log("  - SQL a ejecutar:", sql);
    console.log("  - Parámetros:", [account_id, inv_id]);
    
    const result = await pool.query(sql, [account_id, inv_id]);
    console.log("  - Filas afectadas:", result.rowCount);
    
    return result.rowCount > 0;
  } catch (error) {
    console.error("❌ removeFromFavorites error:", error);
    console.error("Error completo:", error.message);
    return false;
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
// VERIFICA que esta función en models/favorites-model.js esté así:

async function isFavorite(account_id, inv_id) {
  try {
    // 🔍 DEBUG temporal: agregar logs para verificar
    console.log('🔍 isFavorite check:', { account_id, inv_id });
    
    const sql = "SELECT 1 FROM favorites WHERE account_id = $1 AND inv_id = $2"
    const result = await pool.query(sql, [account_id, inv_id])
    
    console.log('🔍 isFavorite result:', result.rows.length > 0);
    
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