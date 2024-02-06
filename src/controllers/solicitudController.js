import e from "express";
import Solicitud from "../models/Solicitud.js";
import Usuario from "../models/Usuario.js";

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
};
