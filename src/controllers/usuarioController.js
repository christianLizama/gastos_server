import Usuario from "../models/Usuario.js";
import Evento from "../models/Evento.js";
import tokenService from "../services/token.js";
import bcrypt from "bcrypt";
import axios from "axios";

//Función para iniciar sesión de un usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Buscar usuario por email
    const findUser = await Usuario.findOne({ email: email });
    // Si el usuario no existe
    if (!findUser) {
      return res.status(400).json({
        message: "Usuario o contraseña incorrectos",
      });
    }
    // Si el usuario existe, verificar la contraseña
    const passwordIsValid = bcrypt.compareSync(password, findUser.clave);
    // Si la contraseña no es válida
    if (!passwordIsValid) {
      return res.status(400).json({
        message: "Usuario o contraseña incorrectos",
      });
    }
    // Si la contraseña es válida, generar token
    const token = await tokenService.encode(
      findUser._id,
      findUser.email,
      findUser.nombreCompleto
    );
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
    const { nombreCompleto, rut, email, clave, rol, empresa } = req.body;
    //Crear un nuevo usuario
    const usuario = new Usuario({
      nombreCompleto,
      rut,
      email,
      clave: bcrypt.hashSync(clave, 10),
      rol,
      empresa,
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
    if (error.name === "ValidationError") {
      // Manejar errores de validación de Mongoose
      const validationErrors = Object.values(error.errors).map(
        ({ message }) => message
      );
      return res.status(400).json({
        message: "Error de validación al crear el usuario",
        errors: validationErrors,
      });
    }
    res.status(500).json({
      message: "Error al crear el usuario",
      data: { error },
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

//Función para obtener todos los conductores
const obtenerConductores = async (req, res) => {
  try {
    const { mes } = req.query; // Supongamos que se envía el mes en el query
    // Validar que el mes esté en un formato válido (por ejemplo, 01 para enero)
    // Asumiendo que mes es un número entre 1 y 12
    const anioActual = new Date().getFullYear();
    const fechaInicio = new Date(anioActual, mes , 1);
    const fechaFin = new Date(anioActual, mes+1, 0);

    const conductores = await Usuario.find({ rol: "CONDUCTOR" }).sort({ nombreCompleto: 1 });

    const eventosAgregados = await Evento.find({
      user: { $in: conductores.map((conductor) => conductor._id) },
      fecha: { $gte: fechaInicio, $lte: fechaFin },
    });

    const eventosPorUsuario = {};

    eventosAgregados.forEach((evento) => {
      if (!eventosPorUsuario[evento.user]) {
        eventosPorUsuario[evento.user] = {};
      }

      const dia = evento.fecha.getDate();
      let valor = "";
      if (evento.nombre === "ausente") {
        valor = "A";
      } else if (evento.nombre === "descanso") {
        valor = "D";
      }

      eventosPorUsuario[evento.user][`dia${dia}`] = valor;
    });

    // Formatear los resultados para incluir los datos de usuario
    const usuariosConEventos = conductores.map((conductor) => {
      const eventosUsuario = eventosPorUsuario[conductor._id] || {};
      return {
        ...conductor.toObject(), // Convertir a objeto para modificar propiedades
        ...eventosUsuario,
      };
    });

    res.status(200).json({
      message: "Usuarios con eventos obtenidos correctamente",
      data: usuariosConEventos,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los usuarios con eventos",
      data: {},
    });
  }
};

//Obtener conductores por empresa
const obtenerConductoresPorEmpresa = async (req, res) => {
  try {
    const { empresa } = req.params;
    const conductores = await Usuario.find({ rol: "CONDUCTOR", empresa: empresa }).sort({ nombreCompleto: 1 });
    res.status(200).json({
      message: "Conductores obtenidos correctamente",
      data: conductores,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los conductores",
      data: {},
    });
  }
}

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

//Función para validar si el token aún es válido
const validarToken = async (req, res) => {
  try {
    const { token } = req.body;
    const response = await tokenService.decode(token);

    if (response.message === "Token expirado") {
      return res.status(200).json({
        message: "Token expirado",
        data: false,
      });
    } else if (response.message === "Token inválido") {
      return res.status(200).json({
        message: "Token inválido",
        data: false,
      });
    } else if (response.message === "Usuario no encontrado") {
      return res.status(200).json({
        message: "Usuario no encontrado",
        data: false,
      });
    }
    res.status(200).json({
      message: "Token válido",
      data: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Token inválido",
      data: false,
    });
  }
};

//Función para cargar usuarios desde una API externa
const cargarUsuarios = async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    // Autenticación para obtener el token
    const urlDestino = process.env.URL_API_USERS;
    const urlAutenticar = urlDestino + "Autenticar";
    const bodyAutenticar = { usuario, contrasena };
    const responseAutenticar = await axios.post(urlAutenticar, bodyAutenticar);
    const token = responseAutenticar.data.token;

    // Llamada a la API externa con el token obtenido
    const url = urlDestino + "auditeris/getemployee";
    const empresaRut = process.env.RUT_TIR;
    const headers = {
      Authorization: token,
      "Content-Type": "application/json",
    };
    const bodyAPI = {
      rut_empresa: empresaRut,
      movimientos_personal: "S",
    };
    const responseAPI = await axios.get(url, {
      headers: headers,
      data: bodyAPI,
    });

    // Filtrar usuarios por cargo "Conductor" y obtener email, nombre completo y rut
    const usuarios = responseAPI.data.result.filter((user) =>
      user.contrato.cargo.toLowerCase().includes("conductor")
    );
    const conductoresInfo = usuarios.map((user) => ({
      nombreCompleto: user.ficha.nombrecompleto,
      rut: user.ficha.rut,
      email: user.ficha.email,
      rol: "CONDUCTOR",
      empresa: "TRN",
      clave: bcrypt.hashSync(user.ficha.rut, 10),
    }));

    const emails = conductoresInfo.map((conductor) => conductor.email);


    // // Guardar conductores en la base de datos
    // const conductoresAgregados = await Promise.all(
    //   conductoresInfo.map(async (conductor) => {
    //     const newConductor = new Usuario(conductor);
    //     await newConductor.save();
    //     return newConductor;
    //   })
    // );

    // const emailsConductores = conductoresAgregados.map((conductor) => conductor.email);
    // const cantidadConductores = conductoresAgregados.length;

    res.status(200).json({ emails: conductoresInfo, cantidadAgregados: 1 , message: "Conductores agregados correctamente"});
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error en la solicitud" });
  }
};

const agregarEventos = async (req, res) => {
  try {
    const { eventos } = req.body;

    // Guardar eventos en la base de datos
    const eventosAgregados = await Promise.all(
      eventos.map(async (evento) => {
        const newEvento = new Evento(evento);
        return await newEvento.save(); // Guardar el evento y devolverlo
      })
    );

    // Organizar los eventos por usuario
    const eventosPorUsuario = {};

    eventosAgregados.forEach((evento) => {
      // Si el usuario aún no tiene eventos, crear un arreglo vacío para él
      if (!eventosPorUsuario[evento.user]) {
        eventosPorUsuario[evento.user] = {
          usuario: evento.user, // Puedes agregar más detalles del usuario aquí si es necesario
          eventos: [],
        };
      }
      const atributo= "dia"+evento.fecha.getDate();
      let valor = "";
      if(evento.nombre==="ausente"){
        valor = "A"; 
      }
      else if(evento.nombre==="descanso"){
        valor = "D";
      }

      const event = {
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        fecha: evento.fecha,
        [atributo]: valor,
      };

      eventosPorUsuario[evento.user].eventos.push(event);
    });

    const resultadoFinal = Object.values(eventosPorUsuario);

    res.status(200).json(resultadoFinal); // Devolver los eventos organizados por usuario
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};


export default {
  login,
  registrarUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuarioPorId,
  eliminarUsuarioPorId,
  validarToken,
  cargarUsuarios,
  obtenerConductores,
  obtenerConductoresPorEmpresa,
  agregarEventos
};
