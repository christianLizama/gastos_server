import mongoose from "mongoose";
const Schema = mongoose.Schema;
import paginate from "mongoose-paginate-v2";

let estados = {
  values: ["NINGUNA","PARCIALMENTE","TODO"],
  message: "{VALUE} no es un estado válido",
};

const ContenedorSolicitudesSchema = new Schema({
  conductores: [
    {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "El usuario es necesario"],
    },
  ],
  viajes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Viaje",
      required: [true, "El viaje es necesario"],
    },
  ],
  estado: {
    type: String,
    required: [true, "El estado es necesario"],
    enum: estados,
  },
  solicitudes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Solicitud",
      required: [true, "La solicitud es necesaria"],
    },
  ],
  correlativo: {
    type: Number,
    default: 0,
    unique: true,
  },
  empresa: {
    type: String,
    required: [true, "La empresa es necesaria"],
  },
  creadoPor: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: [true, "El usuario es necesario"],
  },
  subTotales: [
    {
      type: Number,
      required: [true, "El subtotal es necesario"],
    },
  ],
  fechaCreacion: {
    type: Date,
    required: [true, "La fecha de creación es necesaria"],
    default: Date.now,
  },
  montoTotal: {
    type: Number,
    required: [true, "El monto total es necesario"],
  },
});

ContenedorSolicitudesSchema.plugin(paginate);
const contenedorSolicitudes = mongoose.model("ContenedorSolicitudes", ContenedorSolicitudesSchema);
contenedorSolicitudes.paginate().then({});

export default contenedorSolicitudes;
