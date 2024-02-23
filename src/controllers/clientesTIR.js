import db from "../dbSQL/conection.js";


const obtenerClientes = async (req, res) => {
  try {
    //await db.connectDB1;
    const consultaDB2 = 'SELECT * FROM ClientesxEmpresasTIR';
    const resultDB2 = await db.poolDB2.request().query(consultaDB2);

    res.status(200).json(resultDB2.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener los clientes" });
  }
};


export default {
    obtenerClientes,
}