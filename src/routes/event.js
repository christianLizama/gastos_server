import express from "express";
import evento from "../controllers/eventoController.js";
import authMiddleware from "../middlewares/auth.js";
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Respondiendo desde evento");
});

//Rutas para eventos
router.post(
  "/eliminarEvento",
  authMiddleware.verfyAdminsOrEditers,
  evento.eliminarEvento
);

export default router;
