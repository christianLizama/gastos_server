import './config.js';
// Importa Express y otros módulos usando import
import express from 'express';
import cors from 'cors';
// Importa mongoose
import mongoose from 'mongoose';

// Rutas
import router from './routes/index.js';
import usuario from './routes/user.js';
import e from "express";

const uri = process.env.MONGO_URI;
const options = {
};

mongoose.connect(uri, options).then((client) => { 
    console.log('Conectado a DB')
  },
  err => { console.log(err) }
);

const app = express();

// Debes habilitar CORS antes de definir tus rutas
app.use(cors());

app.use(express.json());

// Luego, configura tus rutas
app.use('/', router);
app.use('/usuario', usuario);

const appPort = process.env.PORT_SERVER || 3030

app.listen(appPort, () => console.log(`Server esuchando en el puerto ${appPort}!`))