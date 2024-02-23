import db from "../dbSQL/conection.js";
import sql from "mssql";

const obtenerClientes = async (req, res) => {
  try {
    const consultaDB1 = 'SELECT * FROM ClientesxEmpresasTRN';
    const resultDB1 = await db.poolDB1.request().query(consultaDB1);

    res.status(200).json(resultDB1.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener los clientes" });
  }
};

const obtenerPedidos = async (req, res) => {
  try {
    const { idCliente } = req.query;
    // Utilizar parámetros en lugar de concatenar directamente
    const consultaDB1 = 'SELECT * FROM [dbo].[ObtenerDatosPedidoTRN](@idCliente)';
    const resultDB1 = await db.poolDB1.request()
      .input('idCliente', sql.Char, idCliente)
      .query(consultaDB1);

    res.status(200).json(resultDB1.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener los pedidos" });
  }
};

const obtenerPedidosConductor = async (req, res) => {
  try {
    const { cardCode,rutConductor } = req.query;
    console.log(rut);
    // Utilizar parámetros en lugar de concatenar directamente
    const consultaDB1 = 'SELECT * FROM [dbo].[ObtenerPedidosporRutyClienteTRN](@CardCode,@U_Rut)';
    const resultDB1 = await db.poolDB1.request()
      .input('CardCode', sql.Char, cardCode).input('U_Rut', sql.Char, rutConductor)
      .query(consultaDB1);

    res.status(200).json(resultDB1.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener los pedidos por rut" });
  }
}

export default {
    obtenerClientes,
    obtenerPedidos,
    obtenerPedidosConductor
}