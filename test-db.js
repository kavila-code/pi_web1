import { db } from "./database/connection.database.js";

const testConnection = async () => {
  try {
    const result = await db.query("SELECT NOW()");
    console.log("✅ Conectado a PostgreSQL:", result.rows[0]);
  } catch (error) {
    console.error("❌ Error de conexión:", error);
  }
};

testConnection();