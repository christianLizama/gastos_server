import express from "express";
import usuario from "../controllers/usuarioController.js";
const router = express.Router();
import authMiddleware from "../middlewares/auth.js"; 


/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Respondiendo desde usuario");
});

//Rutas para usuarios
router.get("/obtenerUsuarios", authMiddleware.verifyAdmins, usuario.obtenerUsuarios);
router.get("/obtenerUsuarioPorId/:id", usuario.obtenerUsuarioPorId);
router.post("/registrar", usuario.registrarUsuario);
router.put("/actualizarUsuarioPorId/:id", authMiddleware.verifyAdmins,usuario.actualizarUsuarioPorId);
router.delete("/eliminarUsuarioPorId/:id", authMiddleware.verifyAdmins ,usuario.eliminarUsuarioPorId);
router.post("/login", usuario.login);
router.post("/validarToken", usuario.validarToken);
router.post("/cargarUsuarios", usuario.cargarUsuarios);

router.get("/obtenerConductores", authMiddleware.verifyAdminsOrLector, usuario.obtenerConductores);
router.get("/obtenerConductoresPorEmpresa/:empresa", authMiddleware.verifyAdminsOrLector, usuario.obtenerConductoresPorEmpresa);
router.post("/agregarEventos",authMiddleware.verfyAdminsOrEditers, usuario.agregarEventos);

export default router;
