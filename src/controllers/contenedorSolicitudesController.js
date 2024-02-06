import ContenedorSolicitudes from "../models/ContenedorSolicitudes.js";

//Funcion para obtener todos los contenedores de solicitudes
const obtenerContenedoresSolicitudes = async (req, res) => {
  try {
    const searchQuery = {}; // Objeto de consulta vacío por defecto
    if (req.query.search) {
      // Quitamos los acentos de la búsqueda y la convertimos a minúsculas
      const normalizedSearchTerm = removeAccents(
        req.query.search
      ).toLowerCase();
      // Si se proporciona un término de búsqueda en la consulta, agregamos criterios de búsqueda
      searchQuery.$or = [
        { correlativo: { $regex: normalizedSearchTerm, $options: "i" } }, // Búsqueda insensible a mayúsculas y minúsculas en el campo "value"
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



    const contenedoresSolicitudes = await ContenedorSolicitudes.find()
      .populate("conductores")
      .populate("viajes")
      .populate("solicitudes")
      .populate("creadoPor");
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
    contenedor.forEach(element => {
        console.log(element);    
    });

    res
      .status(200)
      .json({ mensaje: "Contenedor de solicitudes registrado con éxito" });
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
