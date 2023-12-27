import tokenService from "../services/token.js";

// Funciones de verificación de roles
const verifyUser = async (req, res, next) => {
  if (!req.headers.token) {
    return res.status(404).send({
      message: "No token",
    });
  }
  const response = await tokenService.decode(req.headers.token);
  if (response.rol == "USER") {
    next();
  } else {
    return res.status(403).send({
      message: "No autorizado",
    });
  }
};

const verifyGeneralAdmin = async (req, res, next) => {
  if (!req.headers.token) {
    return res.status(404).send({
      message: "No token",
    });
  }
  const response = await tokenService.decode(req.headers.token);
  if (response.rol == "ADMINAPP") {
    next();
  } else {
    return res.status(403).send({
      message: "No autorizado",
    });
  }
};

const verifyAdmin = async (req, res, next) => {
  if (!req.headers.token) {
    return res.status(404).send({
      message: "No token",
    });
  }
  const response = await tokenService.decode(req.headers.token);
  if (response.rol == "ADMIN") {
    next();
  } else {
    return res.status(403).send({
      message: "No autorizado",
    });
  }
};

const verifyAdminOrAdminApp = async (req, res, next) => {
  if (!req.headers.token) {
    return res.status(404).send({
      message: "No token",
    });
  }
  const response = await tokenService.decode(req.headers.token);
  if (response.rol == "ADMIN" || response.rol == "ADMINAPP") {
    next();
  } else {
    return res.status(403).send({
      message: "No autorizado",
    });
  }
}


export default {
  verifyUser,
  verifyGeneralAdmin,
  verifyAdmin,
};
