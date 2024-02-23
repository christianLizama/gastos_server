import './config.js';
// Importa Express y otros módulos usando import
import express from 'express';
import cors from 'cors';
// Importa mongoose
import mongoose from 'mongoose';
// Rutas
import router from './routes/index.js';
import usuario from './routes/user.js';
import evento from './routes/event.js';
import solicitud from './routes/solicitud.js';
import clientes from './routes/clientes.js';

const uri = process.env.MONGO_URI;
const options = {
};

mongoose.connect(uri, options).then((client) => { 
    console.log('Conexión establecida con mongoDB')
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
app.use('/evento', evento);
app.use('/solicitud', solicitud);
app.use('/clientes', clientes);

const appPort = process.env.PORT_SERVER || 3030

app.listen(appPort, () => console.log(`Server esuchando en el puerto ${appPort}!`))