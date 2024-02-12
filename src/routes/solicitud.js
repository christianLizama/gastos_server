import express from "express";
import solicitud from "../controllers/solicitudController.js";
import contenedorSolicitud from "../controllers/contenedorSolicitudesController.js";
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
    res.send("Respondiendo desde solicitud");
});

router.post("/guardarSolicitud", solicitud.registrarSolicitud);
router.get("/obtenerSolicitudes", solicitud.obtenerSolicitudes);
router.get("/obtenerSolicitudPorId/:id", solicitud.obtenerSolicitudPorId);
router.get("/obtenerContenedoresSolicitudes", contenedorSolicitud.obtenerContenedoresSolicitudes);
router.post("/guardarContenedorSolicitudes", contenedorSolicitud.registrarContenedorSolicitudes);

export default router;