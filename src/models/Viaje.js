import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ViajeSchema = new Schema({
  clienteID: {
    type: String,
    required: [true, "El cliente es necesario"],
  },
  nombreCliente: {
    type: String,
    required: [true, "El nombre del cliente es necesario"],
  },
  origen: {
    type: String,
    required: [true, "El origen es necesario"],
  },
  destino: {
    type: String,
    required: [true, "El destino es necesario"],
  },
  pais : {
    type: String,
    required: [true, "El pais es necesario"],
  },
  fecha: {
    type: Date,
    required: [true, "La fecha es necesaria"],
  },
  conductor: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: [true, "El usuario es necesario"],
  },
  centroDeCosto: {
    type: String,
    required: [true, "El tipo de viaje es necesario"],
  },
  estado: {
    type: String,
    required: [true, "El estado es necesario"],
  },
  
});

const viaje = mongoose.model("Viaje", ViajeSchema);

export default viaje;
