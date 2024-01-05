import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const EventoSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario'],
    },
    descripcion:{
        type: String,
        required: [true, 'La descripcion es necesaria'],
    },
    fecha: { 
        type: Date, 
        required: [true, "La fecha es necesaria"],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, "El usuario es necesario"],
    },
});

const evento = mongoose.model("Evento", EventoSchema);

export default evento;