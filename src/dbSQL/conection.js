import sql from 'mssql';

// Configuración de la conexión a la primera base de datos
const configDB1 = {
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  server: process.env.MYSQL_HOST,
  database: 'produccion_transportes_rio_cautin_ltda_1',
  options: {
    encrypt: false, // Establecer a true si estás utilizando conexiones seguras (SSL)
  },
};

// Configuración de la conexión a la segunda base de datos
const configDB2 = {
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  server: process.env.MYSQL_HOST,
  database: 'produccion_transportes_ruiz_ltda_1',
  options: {
    encrypt: false, // Establecer a true si estás utilizando conexiones seguras (SSL)
  },
};

// Crear pools de conexión para cada base de datos
const poolDB1 = new sql.ConnectionPool(configDB1);
const poolDB2 = new sql.ConnectionPool(configDB2);

// Conectar al servidor SQL Server para cada pool
const connectDB1 = poolDB1.connect().then(() => console.log('Conexión establecida con DB1 mysql')).catch(err => console.error('Error de conexión DB1 mysql:', err));
const connectDB2 = poolDB2.connect().then(() => console.log('Conexión establecida con DB2 mysql')).catch(err => console.error('Error de conexión DB2 mysql:', err));

// Exportar los pools de conexión para que puedan ser utilizados desde otros archivos
export default {
  poolDB1,
  poolDB2,
  connectDB1,
  connectDB2
};
