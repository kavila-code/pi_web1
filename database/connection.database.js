import 'dotenv/config'
import pg from 'pg'
import fs from 'fs'
import path from 'path'

const { Pool } = pg;

const config = {
    user: 'postgres',
    password: '0330',
    host: 'localhost',
    port: 5432,
    database: 'jwt_db',
    allowExitOnIdle: true,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20,
    retry: {
        match: [
            /Connection terminated/,
            /Connection was forcibly closed/,
            /read ECONNRESET/,
        ],
        max: 3
    }
}

export const db = new Pool(config)

// Agregar listeners para manejar errores del pool
db.on('error', (err, client) => {
    console.error('Error inesperado en el cliente PostgreSQL:', err);
});

// Función para probar la conexión
async function testConnection() {
    let client;
    try {
        client = await db.connect();
        console.log('✅ Conexión exitosa a PostgreSQL!');
        const result = await client.query('SELECT NOW()');
        console.log('Timestamp from DB:', result.rows[0]);
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('Asegúrate que PostgreSQL esté corriendo y accesible');
        }
    } finally {
        if (client) {
            client.release(true); // true fuerza la liberación
        }
    }
}

// Ejecutar prueba de conexión
testConnection()

// Función para inicializar la base de datos
export async function initDatabase() {
    try {
        const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        await db.query(schema);
        console.log('✅ Tablas creadas exitosamente!');
    } catch (error) {
        console.error('❌ Error creando tablas:', error.message);
    }
}

// Ejecutar inicialización de la base de datos
initDatabase();

// Exportar la instancia de Pool para usar en otros archivos
export default db