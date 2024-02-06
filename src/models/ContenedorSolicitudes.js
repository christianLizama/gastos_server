import mongoose from "mongoose";
const Schema = mongoose.Schema;
import paginate from "mongoose-paginate-v2";

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
  solicitudes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Solicitud",
      required: [true, "La solicitud es necesaria"],
    },
  ],
  correlativo: {
    type: Number,
    default: function () {
      // Encuentra el valor máximo actual en la colección y agrega 1
      return this.constructor
        .find()
        .sort({ campoIncremental: -1 })
        .limit(1)
        .then(([lastItem]) => {
          return (lastItem && lastItem.campoIncremental + 1) || 1;
        });
    },
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
  montoTotal: {
    type: Number,
    required: [true, "El monto total es necesario"],
  },
});

ContenedorSolicitudesSchema.plugin(paginate);
const contenedorSolicitudes = mongoose.model("ContenedorSolicitud", ContenedorSolicitudesSchema);
contenedorSolicitudes.paginate().then({});

export default contenedorSolicitudes;
