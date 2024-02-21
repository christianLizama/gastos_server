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
    
    return res.status(401).send({
      message: "Token inválido",
    });
  } else if (response.message === "Token expirado") {
    return res.status(403).send({
      message: "Token expirado",
    });
  } else {
    return res.status(401).send({
      message: "No autorizado",
    });
  }
};

// Funciones de verificación de roles de todos los administradores
const verifyAdmins = async (req, res, next) => {
  if (!req.headers.token) {
    return res.status(404).send({
      message: "Debe proporcionar el token",
    });
  }
  const response = await tokenService.decode(req.headers.token);
  if (response.message === "Token válido") {
    if (response.user.rol == "ADMINAPP" || response.user.rol == "ADMIN" || response.user.rol == "ADMINTRN" || response.user.rol == "ADMINTIR") {
      next();
    }
    else {
      return res.status(401).send({
        message: "No autorizado",
      });
    }
  } else if (response.message === "Token inválido") {
    return res.status(403).send({
      message: "Token inválido",
    });
  } else if (response.message === "Token expirado") {
    return res.status(403).send({
      message: "Token expirado",
    });
  } else {
    return res.status(401).send({
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
  if (response.message === "Token válido") {
    if (response.user.rol == "ADMINAPP") {
      next();
    }
    else {
      return res.status(401).send({
        message: "No autorizado",
      });
    }
  } else if (response.message === "Token inválido") {
    return res.status(403).send({
      message: "Token inválido",
    });
  } else if (response.message === "Token expirado") {
    return res.status(403).send({
      message: "Token expirado",
    });
  } else {
    return res.status(401).send({
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
  if (response.message === "Token válido") {
    if (response.user.rol == "ADMIN") {
      next();
    }
    else {
      return res.status(401).send({
        message: "No autorizado",
      });
    }
  } else if (response.message === "Token inválido") {
    return res.status(403).send({
      message: "Token inválido",
    });
  } else if (response.message === "Token expirado") {
    return res.status(403).send({
      message: "Token expirado",
    });
  } else {
    return res.status(401).send({
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

  if (response.message === "Token válido") {
    if (response.user.rol == "ADMINAPP" || response.user.rol == "ADMIN") {
      next();
    } else {
      return res.status(401).send({
        message: "No autorizado",
      });
    }
  } else if (response.message === "Token inválido") {
    return res.status(403).send({
      message: "Token inválido",
    });
  } else if (response.message === "Token expirado") {
    return res.status(403).send({
      message: "Token expirado",
    });
  } else {
    return res.status(401).send({
      message: "No autorizado",
    });
  }
};

const verifyAdminsOrLector = async (req, res, next) => {
  if (!req.headers.token) {
    return res.status(404).send({
      message: "Debe proporcionar el token",
    });
  }
  const response = await tokenService.decode(req.headers.token);

  if (response.message === "Token válido") {
    if (response.user.rol == "ADMINAPP" || response.user.rol == "ADMIN" || response.user.rol == "LECTOR" || response.user.rol == "LECTORTRN" || response.user.rol == "LECTORTIR" || response.user.rol == "ADMINTRN" || response.user.rol == "ADMINTIR") {
      next();
    } else {
      return res.status(401).send({
        message: "No autorizado",
      });
    }
  } else if (response.message === "Token inválido") {
    return res.status(403).send({
      message: "Token inválido",
    });
  } else if (response.message === "Token expirado") {
    return res.status(403).send({
      message: "Token expirado",
    });
  } else {
    return res.status(401).send({
      message: "No autorizado",
    });
  }
}

const verfyAdminsOrEditers = async (req, res, next) => {
  if (!req.headers.token) {
    return res.status(404).send({
      message: "Debe proporcionar el token",
    });
  }
  const response = await tokenService.decode(req.headers.token);

  if (response.message === "Token válido") {
    if (response.user.rol == "ADMINAPP" || response.user.rol == "ADMIN" || response.user.rol == "ADMINTRN" || response.user.rol == "ADMINTIR" || response.user.rol == "TRNEDITOR" || response.user.rol == "TIREDITOR" || response.user.rol == "EDITOR") {
      next();
    } else {
      return res.status(401).send({
        message: "No autorizado",
      });
    }
  } else if (response.message === "Token inválido") {
    return res.status(403).send({
      message: "Token inválido",
    });
  } else if (response.message === "Token expirado") {
    return res.status(403).send({
      message: "Token expirado",
    });
  } else {
    return res.status(401).send({
      message: "No autorizado",
    });
  }
}


export default {
  verifyUser,
  verifyGeneralAdmin,
  verifyAdmin,
  verifyAdminOrAdminApp,
  verifyAdminsOrLector,
  verifyAdmins,
  verfyAdminsOrEditers
};
