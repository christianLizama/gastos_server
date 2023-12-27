import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';

dotenv.config({ path: envFile });

export default {
  // Opcional: Puedes exportar las variables aquí si prefieres acceder a ellas directamente desde config.js
  // variableEjemplo: process.env.MI_VARIABLE,
};