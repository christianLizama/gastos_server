import express from "express";
import solicitud from "../controllers/solicitudController.js";
import contenedorSolicitud from "../controllers/contenedorSolicitudesController.js";
const router = express.Router();
import authMiddleware from "../middlewares/auth.js";

/* GET home page. */
router.get("/", function (req, res, next) {
    res.send("Respondiendo desde solicitud");
});

router.post("/guardarSolicitud", authMiddleware.verifyGeneralAdmin,solicitud.registrarSolicitud);
router.get("/obtenerSolicitudes", authMiddleware.verifyGeneralAdmin,solicitud.obtenerSolicitudes);
router.get("/obtenerSolicitudPorId/:id",authMiddleware.verifyGeneralAdmin,solicitud.obtenerSolicitudPorId);
router.put("/actualizarSolicitud/:id",authMiddleware.verifyGeneralAdmin,solicitud.actualizarSolicitudPorId);
router.delete("/eliminarSolicitud/:id",authMiddleware.verifyGeneralAdmin,solicitud.eliminarSolicitudPorId);
router.put("/actualizarSolicitudes",authMiddleware.verifyGeneralAdmin,solicitud.updateMany);


router.get("/obtenerContenedoresSolicitudes",authMiddleware.verifyGeneralAdmin,contenedorSolicitud.obtenerContenedoresSolicitudes);
router.post("/guardarContenedorSolicitudes",authMiddleware.verifyGeneralAdmin,contenedorSolicitud.registrarContenedorSolicitudes);

export default router;