import Evento from "../models/Evento.js";

//Funcion para eliminar un evento de un determinado usuario y fecha
const eliminarEvento = async (req, res) => {
  try {
    const {idUser, fecha } = req.body;
    const diaFecha = fecha.dia;
    //Dar formato al dia de la fecha
    const dia = parseInt(fecha.dia.replace('dia', ''));

    const fechaEvento = new Date(fecha.anoActual, fecha.mesActual, dia);
    //Busca el evento por id de usuario y fecha
    const evento = await Evento.findOneAndDelete({ user: idUser, fecha: fechaEvento });
    if(evento){
        res.status(200).json({ mensaje: "Evento eliminado correctamente", evento: diaFecha });
    }
    else{
        res.status(400).json({ mensaje: "No se encontro el evento" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al eliminar el evento" });
  }
};


export default {
    eliminarEvento,
}