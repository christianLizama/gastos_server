import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js'; // Importa tu modelo de Usuario

const secretKey = process.env.SEED_AUTENTICACION;
const duracionToken = process.env.CADUCIDAD_TOKEN;

const verificarTokenValido = async (token) => {
  try {
    const { _id } = jwt.verify(token, secretKey);
    const user = await Usuario.findOne({ _id });
    if (user) {
      return user; // Devuelve el usuario si el token es válido
    } else {
      throw new Error('Usuario no encontrado');
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado'); // Lanza un error si el token ha expirado
    } else {
      throw new Error('Token inválido'); // Lanza un error si el token es inválido
    }
  }
};

const encode = async (_id,email,nombreCompleto,rol) => {
  const token = jwt.sign(
    { _id, email, nombreCompleto, rol },
    secretKey,
    { expiresIn: duracionToken }
  );
  return token;
};

const decode = async (token) => {
  try {
    const { _id } = jwt.verify(token, secretKey);
    const user = await Usuario.findOne({ _id });
    if (user) {
      return { user:user, message: 'Token válido'};
    } else {
      return { message: 'Usuario no encontrado' }; // Devuelve un mensaje específico
    }
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return { message: 'Token expirado' }; // Devuelve un mensaje específico para token expirado
    } else {
      return { message: 'Token inválido' }; // Devuelve un mensaje específico para token inválido
    }
  }
};

export default { verificarTokenValido, encode, decode };

