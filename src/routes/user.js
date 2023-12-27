import express from "express";
import usuario from "../controllers/usuarioController.js";
const router = express.Router();
import authMiddleware from "../middlewares/auth.js"; 


/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Respondiendo desde usuario");
});

//Rutas para usuarios
router.get("/obtenerUsuarios", authMiddleware.verifyGeneralAdmin, usuario.obtenerUsuarios);
router.get("/obtenerUsuarioPorId/:id", usuario.obtenerUsuarioPorId);
router.post("/registrar", usuario.registrarUsuario);
router.put("/actualizarUsuarioPorId/:id", usuario.actualizarUsuarioPorId);
router.delete("/eliminarUsuarioPorId/:id", usuario.eliminarUsuarioPorId);
router.post("/login", usuario.login);

export default router;
