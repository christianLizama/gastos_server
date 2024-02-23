import express from "express";
import clientesTRN from "../controllers/clientesTRN.js";
import clientesTIR from "../controllers/clientesTIR.js";
import authMiddleware from "../middlewares/auth.js";
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Respondiendo desde clientes");
});

//Rutas para clientes
router.get("/obtenerClientesTRN", clientesTRN.obtenerClientes);
router.get("/obtenerClientesTIR", clientesTIR.obtenerClientes);
router.get("/obtenerPedidosClienteTRN", clientesTRN.obtenerPedidos);
router.get("/obtenerPedidosConductorTRN", clientesTRN.obtenerPedidosConductor);

export default router;

