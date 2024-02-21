import Solicitud from "../models/Solicitud.js";
import Usuario from "../models/Usuario.js";
import Viaje from "../models/Viaje.js";
import tokenService from "../services/token.js";

//Funcion para obtener todas las solicitudes
const obtenerSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Solicitud.find()
      .populate("creadoPor")
      .populate("aprobadoPor");
    res.status(200).json(solicitudes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener las solicitudes" });
  }
};

//Funcion para obtener una solicitud por id
const obtenerSolicitudPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await Solicitud.findById(id)
      .populate("creadoPor")
      .populate("aprobadoPor");
    res.status(200).json(solicitud);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener la solicitud" });
  }
};

//Funcion para registrar una solicitud
const registrarSolicitud = async (req, res) => {
  try {
    const {
      fechaActualizacion,
      fechaAprobacion,
      fechaSolicitud,
      estado,
      correlativo,
      aprobadoPor,
      empresa,
      creadoPor,
      subTotales,
      montoTotal,
    } = req.body;

    const solicitud = new Solicitud({
      fechaActualizacion,
      fechaAprobacion,
      fechaSolicitud,
      estado,
      correlativo,
      aprobadoPor,
      empresa,
      creadoPor,
      subTotales,
      montoTotal,
    });
    await solicitud.save();
    res.status(200).json({ mensaje: "Solicitud registrada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al registrar la solicitud" });
  }
};

//Funcion para actualizar una solicitud por id
const actualizarSolicitudPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fechaActualizacion,
      fechaAprobacion,
      fechaSolicitud,
      estado,
      correlativo,
      aprobadoPor,
      empresa,
      creadoPor,
      subTotales,
      montoTotal,
    } = req.body;
    await Solicitud.findByIdAndUpdate(id, {
      fechaActualizacion,
      fechaAprobacion,
      fechaSolicitud,
      estado,
      correlativo,
      aprobadoPor,
      empresa,
      creadoPor,
      subTotales,
      montoTotal,
    });
    res.status(200).json({ mensaje: "Solicitud actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al actualizar la solicitud" });
  }
};

//Funcion para actualizar multiples solicitudes
const updateMany = async (req, res) => {
  try {
    const { solicitudes } = req.body;
    const tokenDecodificado = await tokenService.decode(req.headers.token);
    const user = tokenDecodificado.user;

    // Iterar sobre cada solicitud y actualizar solo el estado y comentario
    const updates = solicitudes.map(async (solicitud) => {
      const { _id, estado, comentarios } = solicitud;

      // Validar si el ID y al menos uno de los campos (estado o comentario) están presentes
      if (_id && (estado || comentarios)) {
        const updateFields = {};

        if (estado) {
          updateFields.estado = estado;
        }

        if (comentarios) {
          updateFields.comentarios = comentarios;
        }

        updateFields.fechaActualizacion = new Date();
        updateFields.fechaAprobacion =
          estado === "APROBADA" ? new Date() : null;
        updateFields.aprobadoPor = estado === "APROBADA" ? user._id : null;

        // Realizar la actualización en la base de datos
        const solicitudActualizada = await Solicitud.findByIdAndUpdate(
          _id,
          updateFields
        );
      }
    });

    // Esperar a que todas las actualizaciones se completen
    await Promise.all(updates);

    // Retornar las solicitudes actualizadas populando los campos necesarios
    const solicitudesActualizadas = await Solicitud.find({
      _id: { $in: solicitudes.map((s) => s._id) },
    })
      .populate({
        path: "conductor",
        model: Usuario,
      })
      .populate({
        path: "viaje",
        model: Viaje,
      })
      .populate({
        path: "creadoPor",
        model: Usuario,
      });

    res
      .status(200)
      .json({
        mensaje: "Solicitudes actualizadas correctamente",
        solicitudes: solicitudesActualizadas,
      });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al actualizar las solicitudes" });
  }
};

//Funcion para eliminar una solicitud por id
const eliminarSolicitudPorId = async (req, res) => {
  try {
    const { id } = req.params;
    await Solicitud.findByIdAndDelete(id);
    res.status(200).json({ mensaje: "Solicitud eliminada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al eliminar la solicitud" });
  }
};

export default {
  obtenerSolicitudes,
  obtenerSolicitudPorId,
  registrarSolicitud,
  actualizarSolicitudPorId,
  eliminarSolicitudPorId,
  updateMany,
};
