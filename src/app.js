import './config.js';
// Importa Express y otros módulos usando import
import express from 'express';
import cors from 'cors';
// Importa mongoose
import mongoose from 'mongoose';
import sql from 'mssql';
// Rutas
import router from './routes/index.js';
import usuario from './routes/user.js';
import evento from './routes/event.js';
import solicitud from './routes/solicitud.js';
import e from "express";

const uri = process.env.MONGO_URI;
const options = {
};

mongoose.connect(uri, options).then((client) => { 
    console.log('Conexión establecida con mongoDB')
  },
  err => { console.log(err) }
);

// Configuración de la conexión a tu base de datos
const config = {
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  server: process.env.MYSQL_HOST,
  database: 'produccion_transportes_rio_cautin_ltda_1',
  options: {
    encrypt: false, // Establecer a true si estás utilizando conexiones seguras (SSL)
  },
};

const pool = new sql.ConnectionPool(config);

// Conectar al servidor SQL Server
pool.connect()
  .then(() => console.log('Conexión establecida con SQL Server'))
  .catch(err => console.error('Error de conexión:', err))

const app = express();

// Debes habilitar CORS antes de definir tus rutas
app.use(cors());

app.use(express.json());

// Luego, configura tus rutas
app.use('/', router);
app.use('/usuario', usuario);
app.use('/evento', evento);
app.use('/solicitud', solicitud);

const appPort = process.env.PORT_SERVER || 3030

app.listen(appPort, () => console.log(`Server esuchando en el puerto ${appPort}!`))