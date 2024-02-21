import Usuario from "../models/Usuario.js";
import Evento from "../models/Evento.js";
import tokenService from "../services/token.js";
import bcrypt from "bcrypt";
import axios from "axios";
import removeAccents from "remove-accents";
import auth from "../middlewares/auth.js";
import excel from "excel4node";
import path from 'path';
import fs from 'fs';

//Función para iniciar sesión de un usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //Quitar espacios en blanco al inicio y al final
    const emailTrim = email.trim();
    const passwordTrim = password.trim();

    // Buscar usuario por email
    const findUser = await Usuario.findOne({ email: emailTrim });
    // Si el usuario no existe
    if (!findUser) {
      console.log("Usuario no encontrado");
      return res.status(400).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    // Si el usuario existe, verificar la contraseña
    const passwordIsValid = bcrypt.compareSync(passwordTrim, findUser.clave);
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
      findUser.nombreCompleto,
      findUser.rol
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

//Función para obtener todos los usuarios por los administradores
const obtenerUsuarios = async (req, res) => {
  try {
    const searchQuery = {}; // Objeto de consulta vacío por defecto
    if (req.query.search) {
      // Quitamos los acentos de la búsqueda y la convertimos a minúsculas
      const normalizedSearchTerm = removeAccents(
        req.query.search
      ).toLowerCase();
      // Si se proporciona un término de búsqueda en la consulta, agregamos criterios de búsqueda
      searchQuery.$or = [
        { nombreCompleto: { $regex: normalizedSearchTerm, $options: "i" } }, // Búsqueda insensible a mayúsculas y minúsculas en el campo "value"
        { rut: { $regex: normalizedSearchTerm, $options: "i" } },
      ];
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const sortOptions = {};
    if (req.query.sortBy) {
      sortOptions[req.query.sortBy] = req.query.sortDesc === "true" ? -1 : 1;
    }

    sortOptions.nombreCompleto = 1; // Ordenar por nombreCompleto de forma predeterminada

    const options = {
      page,
      limit,
      sort: sortOptions,
    };
    //Decodificamos el token para ver el rol del usuario que está haciendo la petición
    const tokenDecodificado = await tokenService.decode(req.headers.token);
    const user = tokenDecodificado.user;

    let empresasPermitidas = [];
    let roles = [];
    //Si el rol del usuario es "ADMINAPP"
    if (user.rol === "ADMINAPP") {
      // Obtener los usuarios de los roles "ADMIN", "LECTOR", "CONDUCTOR", "TRNEDITOR" "TIREDITOR" con paginación
      roles = [
        "ADMIN",
        "ADMINTRN",
        "ADMINTIR",
        "LECTOR",
        "LECTORTRN",
        "LECTORTIR",
        "EDITOR",
        "TRNEDITOR",
        "TIREDITOR",
      ];
      empresasPermitidas = ["TRN", "TIR"];
    }
    //Si el rol del usuario es "ADMINTRN"
    else if (user.rol === "ADMINTRN") {
      roles = ["LECTORTRN", "TRNEDITOR"];
      empresasPermitidas = ["TRN"];
    }

    //Si el rol del usuario es "ADMINTIR"
    else if (user.rol === "ADMINTIR") {
      roles = ["LECTORTIR", "TIREDITOR"];
      empresasPermitidas = ["TIR"];
    }

    //Si el rol del usuario es ADMIN
    else if (user.rol === "ADMIN") {
      roles = [
        "ADMINTRN",
        "ADMINTIR",
        "LECTOR",
        "LECTORTRN",
        "LECTORTIR",
        "EDITOR",
        "TRNEDITOR",
        "TIREDITOR",
      ];
      empresasPermitidas = ["TRN", "TIR"];
    }

    // Agregar el filtro de empresa a la consulta
    if (empresasPermitidas.length > 0) {
      searchQuery.empresa = { $in: empresasPermitidas };
    }

    const usuarios = await Usuario.paginate(
      { rol: { $in: roles }, ...searchQuery },
      options
    );

    res.status(200).json({
      message: "Usuarios obtenidos correctamente",
      data: usuarios.docs,
      totalPages: usuarios.totalPages,
      currentPage: usuarios.page,
      totalItems: usuarios.totalDocs,
      roles: roles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener los usuarios",
      data: {},
    });
  }
};

// Función para convertir fecha manualmente de "dd/mm/yyyy" a "yyyy-mm-dd"

function convertirFecha(fecha) {
  const partesFecha = fecha.split("/");
  if (partesFecha.length !== 3) {
    return null; // La fecha no tiene tres partes separadas por "/"
  }
  const dia = partesFecha[0];
  const mes = partesFecha[1];
  const annio = partesFecha[2];

  const fechaObjeto = new Date(annio, mes - 1, dia);

  // Verificar si la fecha es válida
  if (isNaN(fechaObjeto.getTime())) {
    return null; // La fecha no es válida
  }

  return fechaObjeto;
}

//Función para obtener todos los conductores
const obtenerConductores = async (req, res) => {
  try {
    const { mes, annio, empresa } = req.query;
    let fechaInicio;
    let fechaFin;

    const year = parseInt(annio, 10); // Convirtiendo strings a enteros
    const month = parseInt(mes, 10);

    fechaInicio = new Date(year, month, 1);
    fechaFin = new Date(year, month + 1, 0);

    const conductores = await Usuario.find({
      rol: "CONDUCTOR",
      empresa: empresa,
    }).sort({
      nombreCompleto: 1,
    });
    const eventosAgregados = await Evento.find({
      user: { $in: conductores.map((conductor) => conductor._id) },
      fecha: { $gte: fechaInicio, $lte: fechaFin },
    });

    const eventosPorUsuario = {};

    // Obtener eventos entre fechaInicio y fechaFin para cada conductor
    for (const conductor of conductores) {
      eventosPorUsuario[conductor._id] = {};

      // Convertir fechaIngreso y fechaTermino a objetos Date
      const fechaIngreso = convertirFecha(conductor.fechaIngreso);
      const fechaTermino = convertirFecha(conductor.fechaTermino);
      const fechaInicioMes = fechaInicio;
      const fechaFinMes = fechaFin;

      // Verificar si la fecha de ingreso está dentro del mes o es posterior a la fecha de inicio
      if (fechaIngreso >= fechaInicioMes && fechaIngreso <= fechaFinMes) {
        let fechaActual = new Date(fechaInicioMes);
        while (fechaActual < fechaIngreso) {
          const diaActual = fechaActual.getDate();
          eventosPorUsuario[conductor._id][`dia${diaActual}`] = "NC";
          fechaActual.setDate(fechaActual.getDate() + 1);
        }
      }
      // Si la fecha de ingreso es anterior a la fecha de inicio
      else if (fechaIngreso > fechaInicioMes) {
        let fechaActual = new Date(fechaInicioMes);
        while (fechaActual <= fechaFinMes) {
          const diaActual = fechaActual.getDate();
          eventosPorUsuario[conductor._id][`dia${diaActual}`] = "NC";
          fechaActual.setDate(fechaActual.getDate() + 1);
        }
      }

      // Verificar si la fecha de termino está dentro del mes o es anterior a la fecha de inicio
      if (fechaTermino >= fechaInicioMes && fechaTermino <= fechaFinMes) {
        let fechaActual = new Date(fechaTermino);
        fechaActual.setDate(fechaActual.getDate() + 1); // Avanzar un día
        while (fechaActual <= fechaFinMes) {
          const diaActual = fechaActual.getDate();
          eventosPorUsuario[conductor._id][`dia${diaActual}`] = "TC";
          fechaActual.setDate(fechaActual.getDate() + 1);
        }
      } else if (fechaTermino < fechaInicioMes) {
        let fechaActual = new Date(fechaInicioMes);
        while (fechaActual <= fechaFinMes) {
          const diaActual = fechaActual.getDate();
          eventosPorUsuario[conductor._id][`dia${diaActual}`] = "TC";
          fechaActual.setDate(fechaActual.getDate() + 1);
        }
      }
    }

    eventosAgregados.forEach((evento) => {
      if (!eventosPorUsuario[evento.user]) {
        eventosPorUsuario[evento.user] = {};
      }

      const dia = evento.fecha.getDate();
      let valor = "";
      if (evento.nombre === "ausentismo") {
        valor = "A";
      } else if (evento.nombre === "descanso") {
        valor = "D";
      } else if (evento.nombre === "vacacion") {
        valor = "V";
      } else if (evento.nombre === "licencia") {
        valor = "L";
      } else if (evento.nombre === "mediotrabajo") {
        valor = "MT";
      }

      eventosPorUsuario[evento.user][`dia${dia}`] = valor;
    });

    // Formatear los resultados para incluir los datos de usuario
    const usuariosConEventos = conductores.map((conductor) => {
      const eventosUsuario = eventosPorUsuario[conductor._id] || {};
      const conductorObjeto = {
        nombreCompleto: conductor.nombreCompleto,
        rut: conductor.rut,
        email: conductor.email,
        rol: conductor.rol,
        empresa: conductor.empresa,
        _id: conductor._id,
      };

      return {
        ...conductorObjeto, // Convertir a objeto para modificar propiedades
        ...eventosUsuario,
      };
    });

    res.status(200).json({
      message: "Usuarios con eventos obtenidos correctamente",
      data: usuariosConEventos,
    });
  } catch (error) {
    //console.error(error);
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
    const conductores = await Usuario.find({
      rol: "CONDUCTOR",
      empresa: empresa,
    }).sort({ nombreCompleto: 1 });
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
    const { nombreCompleto, rut, email, rol, empresa, cambioClave, newClave } =
      req.body;

    //Verificar que los campos obligatorios no estén vacíos
    if (!nombreCompleto || !rut || !email || !rol || !empresa) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
        data: {},
      });
    }

    // Verificar si el email ya existe en la base de datos
    const usuarioExistente = await Usuario.findOne({ email });

    // Si el email ya existe y pertenece a otro usuario
    if (usuarioExistente && usuarioExistente._id.toString() !== id) {
      // Si el email ya existe y no pertenece al usuario que se está actualizando
      return res.status(400).json({
        message: "El email ya está registrado por otro usuario",
        data: {},
      });
    }

    // Si es con cambio de clave
    if (cambioClave) {
      const emailEnMinuscula = email.toLowerCase();
      const usuario = await Usuario.findByIdAndUpdate(
        id,
        {
          nombreCompleto: nombreCompleto,
          rut: rut,
          email: emailEnMinuscula,
          clave: bcrypt.hashSync(newClave, 10),
          rol: rol,
          empresa: empresa,
        },
        { new: true }
      );
      res.status(200).json({
        message: "Usuario actualizado correctamente",
        data: usuario,
      });
    } else {
      const usuario = await Usuario.findByIdAndUpdate(
        id,
        {
          nombreCompleto: nombreCompleto,
          rut: rut,
          email: email,
          // clave: bcrypt.hashSync(clave, 10),
          rol: rol,
        },
        { new: true }
      );
      res.status(200).json({
        message: "Usuario actualizado correctamente",
        data: usuario,
      });
    }
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
    const { usuario, contrasena, empresa } = req.body;
    console.log("Cargando usuarios de api externa");
    // Autenticación para obtener el token
    const urlDestino = process.env.URL_API_USERS;
    const urlAutenticar = urlDestino + "Autenticar";
    const bodyAutenticar = { usuario, contrasena };
    const responseAutenticar = await axios.post(urlAutenticar, bodyAutenticar);
    const token = responseAutenticar.data.token;

    // Llamada a la API externa con el token obtenido
    const url = urlDestino + "auditeris/getemployee";
    let empresaRut = "";
    if (empresa === "TRN") {
      empresaRut = process.env.RUT_TRN;
    } else if (empresa === "TIR") {
      empresaRut = process.env.RUT_TIR;
    }

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
      empresa: empresa,
      clave: bcrypt.hashSync(user.ficha.rut, 10),
      fechaIngreso: user.contrato.fechaingreso,
      fechaTermino: user.contrato.fechatermino,
    }));

    // Verificar correos electrónicos duplicados en la API
    const apiEmails = conductoresInfo.map((conductor) => conductor.email);
    const duplicateApiEmails = apiEmails.filter(
      (email, index) => apiEmails.indexOf(email) !== index
    );

    // Verificar correos electrónicos duplicados en la base de datos
    const existingEmails = await Usuario.find({ email: { $in: apiEmails } });
    const dbEmails = existingEmails.map((user) => user.email);
    const duplicateDbEmails = dbEmails.filter(
      (email, index) => dbEmails.indexOf(email) !== index
    );

    // Manejar correos electrónicos duplicados
    const allDuplicateEmails = [...duplicateApiEmails, ...duplicateDbEmails];
    const updatedEmails = new Set();

    conductoresInfo.forEach((conductor) => {
      if (allDuplicateEmails.includes(conductor.email)) {
        let updatedEmail = conductor.email;
        let index = 1;

        // Agregar un número al final hasta que sea único
        while (updatedEmails.has(updatedEmail)) {
          updatedEmail = `${conductor.email}_${index}`;
          index++;
        }

        updatedEmails.add(updatedEmail);
        conductor.email = updatedEmail;
      }
    });

    // Guardar conductores en la base de datos
    const conductoresAgregados = await Promise.all(
      conductoresInfo.map(async (conductor) => {
        const newConductor = new Usuario(conductor);
        await newConductor.save();
        return newConductor;
      })
    );

    const cantidadConductores = conductoresAgregados.length;

    res.status(200).json({
      emails: conductoresInfo,
      cantidadAgregados: cantidadConductores,
      message: "Conductores agregados correctamente",
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error en la solicitud" });
  }
};

const agregarEventos = async (req, res) => {
  try {
    const { eventos, fechas } = req.body;
    const eventosNoAgregados = [];
    const eventosAgregados = [];

    for (const evento of eventos) {
      const usuario = await Usuario.findById(evento.user);
      const fechaEvento = new Date(evento.fecha);
      const fechaIngreso = convertirFecha(usuario.fechaIngreso);
      const fechaTermino = convertirFecha(usuario.fechaTermino);

      // Verificar si la fecha de ingreso del usuario es mayor a la fecha de inicio del mes
      if (fechaEvento < fechaIngreso) {
        const user = {
          nombreCompleto: usuario.nombreCompleto,
          rut: usuario.rut,
          email: usuario.email,
        };

        eventosNoAgregados.push({
          user,
          evento,
          motivo:
            "El usuario aún no se encontraba trabajando en la empresa en esta fecha",
        });
        continue; // Pasar al siguiente evento
      }

      // Verificar si la fecha de término del usuario es menor a la fecha de inicio del mes
      if (fechaEvento > fechaTermino) {
        const user = {
          nombreCompleto: usuario.nombreCompleto,
          rut: usuario.rut,
          email: usuario.email,
        };
        eventosNoAgregados.push({
          user,
          evento,
          motivo:
            "El usuario ya no se encuentra trabajando en la empresa en esta fecha",
        });
        continue; // Pasar al siguiente evento
      }

      // Verificar si ya existe un evento para esa fecha para el usuario
      const eventoExistente = await Evento.findOne({
        user: evento.user,
        fecha: fechaEvento,
      });

      if (eventoExistente) {
        const user = {
          nombreCompleto: usuario.nombreCompleto,
          rut: usuario.rut,
          email: usuario.email,
        };
        eventosNoAgregados.push({
          user,
          evento,
          motivo: "Ya existe un evento para esta fecha y usuario",
        });
        continue; // Pasar al siguiente evento
      }

      //Si no hay restricciones, agregar el evento
      const newEvento = new Evento(evento);
      const eventoGuardado = await newEvento.save();
      eventosAgregados.push(eventoGuardado);
    }

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
      const atributo = "dia" + evento.fecha.getDate();
      let valor = "";
      if (evento.nombre === "ausentismo") {
        valor = "A";
      } else if (evento.nombre === "descanso") {
        valor = "D";
      } else if (evento.nombre === "vacacion") {
        valor = "V";
      } else if (evento.nombre === "licencia") {
        valor = "L";
      } else if (evento.nombre === "mediotrabajo") {
        valor = "MT";
      }

      const event = {
        nombre: evento.nombre,
        tipo: evento.tipo,
        fecha: evento.fecha,
        [atributo]: valor,
      };

      eventosPorUsuario[evento.user].eventos.push(event);
    });

    const resultadoFinal = Object.values(eventosPorUsuario);

    res.status(200).json({
      eventos: resultadoFinal,
      eventosNoAgregados: eventosNoAgregados,
    }); // Devolver los eventos organizados por usuario
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

const obtenerUsuarioDesdeApiExterna = async (req, res) => {
  try {
    const { rut, empresa } = req.query;
    // console.log("Obteniendo usuario desde api externa");

    // console.log("Rut:", rut);
    // console.log("Empresa:", empresa);

    // Verificar que los campos obligatorios no estén vacíos
    if (!rut || !empresa) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
        data: {},
      });
    }

    // Verificar que el rut tenga puntos o guión
    const hasDotsOrDash = /[.-]/.test(rut);

    if (hasDotsOrDash) {
      return res.status(400).json({
        message: "El RUT no puede contener puntos ni guiones",
        data: {},
      });
    }

    // Autenticación para obtener el token
    const urlDestino = process.env.URL_API_USERS;
    const urlAutenticar = urlDestino + "Autenticar";
    const usuario = process.env.USUARIO;
    const contrasena = process.env.CONTRASENA;
    const bodyAutenticar = { usuario, contrasena };
    const responseAutenticar = await axios.post(urlAutenticar, bodyAutenticar);
    const token = responseAutenticar.data.token;

    // Llamada a la API externa con el token obtenido
    const url = urlDestino + "auditeris/getemployee";
    let empresaRut = "";
    if (empresa === "TRN") {
      empresaRut = process.env.RUT_TRN;
    } else if (empresa === "TIR") {
      empresaRut = process.env.RUT_TIR;
    }

    const headers = {
      Authorization: token,
      "Content-Type": "application/json",
    };
    const bodyAPI = {
      rut_empresa: empresaRut,
      movimientos_personal: "S",
      rut_trabajador: rut,
    };
    const responseAPI = await axios.get(url, {
      headers: headers,
      data: bodyAPI,
    });

    if (responseAPI.data.result[0]) {
      let usuario = responseAPI.data.result[0].ficha;
      //Agregar apartado empresa en el objeto usuario
      usuario.empresa = empresa;
      res.status(200).json({
        message: "Usuario obtenido correctamente",
        data: usuario,
        userFound: true,
      });
    } else {
      res.status(200).json({
        message: "Usuario no encontrado",
        data: {
          userFound: false,
        },
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error en la solicitud" });
  }
};

const contarEventosEmpresa = async (req, res) => {
  try {
    const { empresa, fechaInicio, fechaTermino } = req.query;
    
    const fechaIni = new Date(fechaInicio.replace(/-/g, "/"));
    const fechaFinal = new Date(fechaTermino.replace(/-/g, "/"));
    
    // Obtener usuarios de la empresa
    const usuarios = await Usuario.find({ empresa: empresa, rol: "CONDUCTOR" }).sort({ nombreCompleto: 1 });

    // Crear un array para almacenar usuarios con sus eventos
    const usuariosConEventos = [];

    // Iterar sobre la lista de usuarios
    for (const usuario of usuarios) {
      // Buscar eventos para el usuario actual
      const eventosUsuario = await Evento.find({
        user: usuario._id,
        fecha: { $gte: fechaIni, $lte: fechaFinal },
      });

      const fechaIngreso = convertirFecha(usuario.fechaIngreso);
      const fechaTermino = convertirFecha(usuario.fechaTermino);

      let diasAntesContrato = 0;
      // Conteo de días antes del contrato
      // Verificar si la fecha de ingreso está dentro del mes o es posterior a la fecha de inicio
      if (fechaIngreso >= fechaIni && fechaIngreso <= fechaFinal) {
        let fechaActual = new Date(fechaInicio.replace(/-/g, "/"));
        while (fechaActual < fechaIngreso) {
          fechaActual.setDate(fechaActual.getDate() + 1);
          diasAntesContrato++;
        }
      }
      // Si la fecha de ingreso es anterior a la fecha de inicio
      else if (fechaIngreso > fechaIni) {
        let fechaActual = new Date(fechaInicio.replace(/-/g, "/"));
        while (fechaActual <= fechaFinal) {
          fechaActual.setDate(fechaActual.getDate() + 1);
          diasAntesContrato++;
        }
      }

      let diasDespuesTermino = 0;

      // Conteo de días después del termino de contrato
      // Verificar si la fecha de termino está dentro del mes o es anterior a la fecha de inicio
      if (fechaTermino >= fechaIni && fechaTermino <= fechaFinal) {
        let fechaActual = fechaTermino.replace(/-/g, "/");
        fechaActual.setDate(fechaActual.getDate() + 1); // Avanzar un día
        while (fechaActual <= fechaFinal) {
          fechaActual.setDate(fechaActual.getDate() + 1);
          diasDespuesTermino++;
        }
      } else if (fechaTermino < fechaIni) {
        let fechaActual = Date(fechaInicio.replace(/-/g, "/"));
        while (fechaActual <= fechaFinal) {
          fechaActual.setDate(fechaActual.getDate() + 1);
          diasDespuesTermino++;
        }
      }
      
      //contar eventos de nombre "ausentismo"
      const ausentismo = eventosUsuario.filter(
        (evento) => evento.nombre === "ausentismo"
      ).length;
      //contar eventos de nombre "descanso"
      const descanso = eventosUsuario.filter(
        (evento) => evento.nombre === "descanso"
      ).length;
      //contar eventos de nombre "vacacion"
      const vacacion = eventosUsuario.filter(
        (evento) => evento.nombre === "vacacion"
      ).length;
      //contar eventos de nombre "licencia"
      const licencia = eventosUsuario.filter(
        (evento) => evento.nombre === "licencia"
      ).length;
      //contar eventos de nombre "mediotrabajo"
      const mediotrabajo = eventosUsuario.filter(
        (evento) => evento.nombre === "mediotrabajo"
      ).length;

      //Obtener la cantidad de días entre las fechas de inicio y fin
      const dias = obtenerDiferenciaDias(fechaIni, fechaFinal);
      const diasTrabajados = dias - ausentismo - descanso - vacacion - licencia - diasAntesContrato - diasDespuesTermino;

      // Crear un objeto que contenga la información del usuario y sus eventos
      const usuarioConEventos = {
        usuario: usuario,
        eventos: {
          ausentismo: ausentismo,
          descanso: descanso,
          vacacion: vacacion,
          licencia: licencia,
          mediotrabajo: mediotrabajo,
          diasInicioContrato: diasAntesContrato,
          diasTerminoContrato: diasDespuesTermino,
          diasTrabajados: diasTrabajados,
        },
      };

      // Agregar el objeto al array
      usuariosConEventos.push(usuarioConEventos);
    }

    // Crear un nuevo libro de Excel
    const wb = new excel.Workbook();
    const ws = wb.addWorksheet("Usuarios y Eventos");

    // Añadir encabezados al archivo Excel
    ws.cell(1, 1).string("Fecha de Inicio");
    ws.cell(1, 2).string(fechaIni.toLocaleDateString("es-CL"));

    ws.cell(2, 1).string("Fecha de Termino");
    ws.cell(2, 2).string(fechaFinal.toLocaleDateString("es-CL"));

    const dias = obtenerDiferenciaDias(fechaIni, fechaFinal);
    ws.cell(3,1).string("Cantidad de días del mes");
    ws.cell(3,2).number(dias);

    ws.cell(4,1).string("Fecha Informe");
    ws.cell(4,2).string(new Date().toLocaleString("es-CL"));
    
    ws.cell(5,1).string("Empresa");
    ws.cell(5,2).string(empresa);
    
    ws.cell(6,1).string("Total Trabajadores");
    ws.cell(6,2).number(usuariosConEventos.length);
    // Añadir encabezados al archivo Excel
    ws.cell(8, 1).string("Nombre Conductor");
    ws.cell(8, 2).string("Rut");
    ws.cell(8, 3).string("Ausentismo");
    ws.cell(8, 4).string("Descanso");
    ws.cell(8, 5).string("Vacación");
    ws.cell(8, 6).string("Licencia");
    ws.cell(8, 7).string("Medio Trabajo");
    ws.cell(8, 8).string("Días Trabajados");

    // Fila actual en el archivo Excel
    let currentRow = 9;

    // Iterar sobre la lista de usuariosConEventos
    for (const usuarioConEventos of usuariosConEventos) {
      const { usuario, eventos } = usuarioConEventos;

      // Escribir la información del usuario en el archivo Excel
      ws.cell(currentRow, 1).string(usuario.nombreCompleto);
      ws.cell(currentRow, 2).string(usuario.rut);
      ws.cell(currentRow, 3).number(eventos.ausentismo);
      ws.cell(currentRow, 4).number(eventos.descanso);
      ws.cell(currentRow, 5).number(eventos.vacacion);
      ws.cell(currentRow, 6).number(eventos.licencia);
      ws.cell(currentRow, 7).number(eventos.mediotrabajo);
      ws.cell(currentRow, 8).number(eventos.diasTrabajados);

      // Incrementar la fila actual
      currentRow++;
    }

    // Guardar el archivo Excel en un archivo
    const excelFilePath = path.join(new URL('usuarios_y_eventos.xlsx', import.meta.url).pathname);
    wb.write(excelFilePath,res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const contarEventosUsuario = async (req, res) => {
  try {
    const { rut, fechaInicio, fechaTermino } = req.query;

    //Buscar al usuario por su rut
    const usuario = await Usuario.findOne({ rut: rut });

    //Si el usuario no existe
    if (!usuario) {
      return res.status(400).json({
        message: "Usuario no encontrado",
        data: {},
      });
    }

    const fechaIni = new Date(fechaInicio);
    const fechaFinal = new Date(fechaTermino);

    //Obtenemos todos los eventos del usuario entre fechas
    const eventos = await Evento.find({
      user: usuario._id,
      fecha: { $gte: fechaIni, $lte: fechaFinal },
    });

    //Contamos los eventos de nombre "ausentismo"
    const ausentismo = eventos.filter(
      (evento) => evento.nombre === "ausentismo"
    ).length;

    //Contamos los eventos de nombre "descanso"
    const descanso = eventos.filter(
      (evento) => evento.nombre === "descanso"
    ).length;

    //Contamos los eventos de nombre "vacacion"
    const vacacion = eventos.filter(
      (evento) => evento.nombre === "vacacion"
    ).length;

    //Contamos los eventos de nombre "licencia"
    const licencia = eventos.filter(
      (evento) => evento.nombre === "licencia"
    ).length;

    //Contamos los eventos de nombre "mediotrabajo"
    const mediotrabajo = eventos.filter(
      (evento) => evento.nombre === "mediotrabajo"
    ).length;

    //Obtenemos la cantidad de días entre las fechas de inicio y fin
    const dias = obtenerDiferenciaDias(fechaIni, fechaFinal);
    const diasTrabajados =
      dias - ausentismo - descanso - vacacion - licencia - mediotrabajo;

    res.status(200).json({
      message: "Eventos contados correctamente",
      data: {
        ausentismo: ausentismo,
        descanso: descanso,
        vacacion: vacacion,
        licencia: licencia,
        mediotrabajo: mediotrabajo,
        diasTrabajados: diasTrabajados,
      },
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error en la solicitud" });
  }
};

function obtenerDiferenciaDias(fechaInicio, fechaFin) {
  // Convertir las fechas a objetos Date
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  // Calcular la diferencia en milisegundos
  const diferenciaEnMilisegundos = fin - inicio;

  // Convertir la diferencia de milisegundos a días
  const dias = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60 * 24)) + 1;

  return dias;
}

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
  agregarEventos,
  obtenerUsuarioDesdeApiExterna,
  contarEventosUsuario,
  contarEventosEmpresa,
};
