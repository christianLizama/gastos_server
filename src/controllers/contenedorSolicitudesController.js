import ContenedorSolicitudes from "../models/ContenedorSolicitudes.js";
import Solicitud from "../models/Solicitud.js";
import tokenService from "../services/token.js";
import Viaje from "../models/Viaje.js";

//Funcion para obtener todos los contenedores de solicitudes
const obtenerContenedoresSolicitudes = async (req, res) => {
  try {
    const searchQuery = {}; // Objeto de consulta vacío por defecto
    if (req.query.search) {
      // Quitamos los acentos de la búsqueda y la convertimos a minúsculas
      const normalizedSearchTerm = req.query.search.toLowerCase();
      // Si se proporciona un término de búsqueda en la consulta, agregamos criterios de búsqueda
      searchQuery.$or = [
        { correlativo: parseInt(normalizedSearchTerm) } 
      ];
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const sortOptions = {};
    if (req.query.sortBy) {
      sortOptions[req.query.sortBy] = req.query.sortDesc === "true" ? -1 : 1;
    }

    const options = {
      page,
      limit,
      sort: sortOptions,
      populate: [
        "conductores",
        "viajes",
        {
          path: "solicitudes",
          populate: {
            path: "conductor viaje creadoPor", // Agrega aquí los campos que deseas poblar dentro de las solicitudes
          },
        },
        "creadoPor",
      ],
    };
    
    //Decodificamos el token para ver el rol del usuario que está haciendo la petición
    const tokenDecodificado = await tokenService.decode(req.headers.token);
    const user = tokenDecodificado.user;

    const contenedoresSolicitudes = await ContenedorSolicitudes.paginate(
      searchQuery,
      options
    );

    res.status(200).json(contenedoresSolicitudes);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ mensaje: "Error al obtener los contenedores de solicitudes" });
  }
};

//Funcion para obtener un contenedor de solicitudes por id
const obtenerContenedorSolicitudesPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const contenedorSolicitudes = await ContenedorSolicitudes.findById(id)
      .populate("conductores")
      .populate("viajes")
      .populate("solicitudes")
      .populate("creadoPor");
    res.status(200).json(contenedorSolicitudes);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ mensaje: "Error al obtener el contenedor de solicitudes" });
  }
};

//Funcion para registrar un contenedor de solicitudes
const registrarContenedorSolicitudes = async (req, res) => {
  try {
    const { contenedor } = req.body;
    //Decodificamos el token para ver el rol del usuario que está haciendo la petición
    const tokenDecodificado = await tokenService.decode(req.headers.token);
    const user = tokenDecodificado.user;

    let solicitudes = [];
    let idsConductores = [];
    let viajes = [];
    let empresa = "";
    let index = 0;
    for (let i = 0; i < contenedor.length; i++) {
      let solicitud = contenedor[i];
      
      empresa = solicitud.empresa;
      const conductorID = solicitud.conductor._id;
      idsConductores.push(conductorID);
      solicitud.conductor = conductorID;
      solicitud.viaje.clienteID = index;
      solicitud.lineaSolicitud = index;
      index++;
      solicitud.viaje.conductor = conductorID;

      const fechaViaje = new Date();
      solicitud.viaje.fecha = fechaViaje;
      solicitud.creadoPor = user._id;
      //creamos el viaje
      const viaje = new Viaje(solicitud.viaje);
      await viaje.save();
      viajes.push(viaje._id);
      solicitud.viaje = viaje._id;
      //creamos la solicitud
      const solicitudNueva = new Solicitud(solicitud);
      await solicitudNueva.save();
      solicitudes.push(solicitudNueva._id);
    }

    // Consultar el valor máximo existente en la base de datos
    const maxCorrelativo = await ContenedorSolicitudes.findOne(
      {},
      { correlativo: 1 }
    )
      .sort({ correlativo: -1 })
      .limit(1)
      .exec();

    // Establecer el valor correlativo para el nuevo contenedor
    const nuevoCorrelativo = maxCorrelativo
      ? maxCorrelativo.correlativo + 1
      : 1;

    //Creamos el contenedor de solicitudes
    const contenedorSolicitudes = new ContenedorSolicitudes({
      conductores: idsConductores,
      viajes: viajes,
      estado: "NINGUNA",
      solicitudes: solicitudes,
      empresa: empresa,
      creadoPor: user._id,
      subTotales: contenedor.montos,
      montoTotal: 0,
      correlativo: nuevoCorrelativo,
    });

    const contenedorCreado = await contenedorSolicitudes.save();

    res.status(200).json({
      message: "Contenedor de solicitudes registrado con éxito",
      data: contenedorCreado,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ mensaje: "Error al registrar el contenedor de solicitudes" });
  }
};

export default {
  obtenerContenedoresSolicitudes,
  obtenerContenedorSolicitudesPorId,
  registrarContenedorSolicitudes,
};
