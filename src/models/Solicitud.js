import mongoose from "mongoose";
const Schema = mongoose.Schema;

let estados = {
    values: ["PENDIENTE","APROBADA","RECHZADA","CORREGIR","PAGADA"],
    message: "{VALUE} no es un rol válido",
  };

const SolicitudSchema = new Schema({
    conductor:{
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: [true, "El usuario es necesario"],
    },
    viaje:{
        type: Schema.Types.ObjectId,
        ref: "Viaje",
        required: [true, "El viaje es necesario"],
    },
    fechaActualizacion:{
        type: Date,
        required: [true, "La fecha de actualización es necesaria"],
        default: Date.now
    },
    fechaAprobacion:{
        type: Date,
        default: null
    },
    fechaSolicitud:{
        type: Date,
        required: [true, "La fecha de solicitud es necesaria"],
        default: Date.now
    },
    estado:{
        type: String,
        required: [true, "El estado es necesario"],
        default: "PENDIENTE",
        enum: estados,
    },
    aprobadoPor:{
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        default: null
    },
    empresa:{
        type: String,
        required: [true, "La empresa es necesaria"],
    },
    creadoPor:{
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: [true, "El usuario es necesario"],
    },
    montos: [{
        tipo: {
            type: String,
            required: [true, "El tipo de monto es necesario"],
        },
        monto: {
            type: Number,
            required: [true, "El número de monto es necesario"],
        },
    }],
    lineaSolicitud: {
        type: String,
        required: [true, "La linea de solicitud es necesaria"],
    },
    tienePedido: {
        type: Boolean,
        required: [true, "El pedido es necesario"],
        default: false
    },
    comentarios: {
        type: String,
        default: ""
    },

});

const solicitud = mongoose.model("Solicitud", SolicitudSchema);


export default solicitud;


