import Usuario from "../models/Usuario.js";
import tokenService from "../services/token.js";
import bcrypt from "bcrypt";

//Función para iniciar sesión de un usuario
const login = async (req, res) => {
    try {
        const { email, clave } = req.body;
        // Buscar usuario por email
        const findUser = await Usuario.findOne({ email: email });
        // Si el usuario no existe
        if (!findUser) {
            return res.status(400).json({
                message: "Usuario o contraseña incorrectos",
            });
        }
        // Si el usuario existe, verificar la contraseña
        const passwordIsValid = bcrypt.compareSync(clave, findUser.clave);
        // Si la contraseña no es válida
        if (!passwordIsValid) {
            return res.status(400).json({
                message: "Usuario o contraseña incorrectos",
            });
        }
        // Si la contraseña es válida, generar token
        const token = await tokenService.encode(findUser._id);
        // Devolver el token
        res.status(200).json({
            message: "Inicio de sesión correcto",
            token: token,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al iniciar sesión",
        });
    }
};
        
//Función para registrar un usuario
const registrarUsuario = async (req, res) => {
  try {
    const { nombreCompleto, rut, email, clave, rol } = req.body;
    //Crear un nuevo usuario
    const usuario = new Usuario({
      nombreCompleto,
      rut,
      email,
      clave: bcrypt.hashSync(clave, 10),
      rol,
    });
    
    //Verificar si el email ya existe en la base de datos
    const findUser = await Usuario.findOne({ email: email });

    if (findUser) {
      return res.status(400).json({
        message: "El correo ya existe",
        data: {},
      });
    }
    //Guardar usuario en la base de datos
    const usuarioNuevo = await usuario.save();
    res.status(201).json({
      message: "Usuario creado correctamente",
      data: usuarioNuevo,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear el usuario",
    });
  }
};

//Función para obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.status(200).json({
      message: "Usuarios obtenidos correctamente",
      data: usuarios,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los usuarios",
      data: {},
    });
  }
};

//Función para obtener un usuario por su id
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);
    res.status(200).json({
      message: "Usuario obtenido correctamente",
      data: usuario,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el usuario",
      data: {},
    });
  }
};

//Función para actualizar un usuario por su id
const actualizarUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreCompleto, rut, email, clave, rol } = req.body;
    const usuario = await Usuario.findByIdAndUpdate(
      id,
      {
        nombreCompleto,
        rut,
        email,
        clave: bcrypt.hashSync(clave, 10),
        rol,
      },
      { new: true }
    );
    res.status(200).json({
      message: "Usuario actualizado correctamente",
      data: usuario,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el usuario",
      data: {},
    });
  }
};


//Función para eliminar un usuario por su id
const eliminarUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    await Usuario.findByIdAndDelete(id);
    res.status(200).json({
      message: "Usuario eliminado correctamente",
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el usuario",
      data: {},
    });
  }
};


export default {
  login,
  registrarUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuarioPorId,
  eliminarUsuarioPorId,
};