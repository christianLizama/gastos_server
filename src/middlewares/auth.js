import tokenService from "../services/token.js";

// Funciones de verificación de roles
const verifyUser = async (req, res, next) => {
  if (!req.headers.token) {
    return res.status(404).send({
      message: "Debe proporcionar el token",
    });
  }
  const response = await tokenService.decode(req.headers.token);
  if (response.user.rol == "USER") {
    next();
  } else if (response.message === "Token inválido") {
    return res.status(403).send({
      message: "Token inválido",
    });
  } else if (response.message === "Token expirado") {
    return res.status(403).send({
      message: "Token expirado",
    });
  } else {
    return res.status(403).send({
      message: "No autorizado",
    });
  }
};

const verifyGeneralAdmin = async (req, res, next) => {
  if (!req.headers.token) {
    return res.status(404).send({
      message: "Debe proporcionar el token",
    });
  }
  
  const response = await tokenService.decode(req.headers.token);
  
  if (response.rol === "ADMINAPP") {
    next(); // Si es un ADMINAPP, pasa al siguiente middleware
  } else if (response.message === "Token inválido") {
    return res.status(403).send({
      message: "Token inválido",
    });
  } else if (response.message === "Token expirado") {
    return res.status(403).send({
      message: "Token expirado",
    });
  } else {
    return res.status(403).send({
      message: "No autorizado",
    });
  }
};

const verifyAdmin = async (req, res, next) => {
  if (!req.headers.token) {
    return res.status(404).send({
      message: "Debe proporcionar el token",
    });
  }
  const response = await tokenService.decode(req.headers.token);
  if (response.user.rol == "ADMIN") {
    next();
  } else if (response.message === "Token inválido") {
    return res.status(403).send({
      message: "Token inválido",
    });
  } else if (response.message === "Token expirado") {
    return res.status(403).send({
      message: "Token expirado",
    });
  } else {
    return res.status(403).send({
      message: "No autorizado",
    });
  }
};

const verifyAdminOrAdminApp = async (req, res, next) => {
  if (!req.headers.token) {
    return res.status(404).send({
      message: "Debe proporcionar el token",
    });
  }
  const response = await tokenService.decode(req.headers.token);
  if (response.user.rol == "ADMIN" || response.user.rol == "ADMINAPP") {
    next();
  } else if (response.message === "Token inválido") {
    return res.status(403).send({
      message: "Token inválido",
    });
  } else if (response.message === "Token expirado") {
    return res.status(403).send({
      message: "Token expirado",
    });
  } else {
    return res.status(403).send({
      message: "No autorizado",
    });
  }
};

export default {
  verifyUser,
  verifyGeneralAdmin,
  verifyAdmin,
  verifyAdminOrAdminApp,
};
