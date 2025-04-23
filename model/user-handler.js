const { Usuario } = require("./model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const JWT_SECRET = "JWT_SECRET_CODE";
// Usamos un Set para almacenar los jti de tokens invalidados
const blacklist = new Set();

function authenticateToken(req, res, next) {
  // Token en header: Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token requerido" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    // Chequeamos si el jti está en la blacklist
    if (blacklist.has(decoded.jti)) {
      return res.status(403).json({ message: "Token expirado (logout)" });
    }

    req.user = decoded;
    next();
  });
}

async function register(req, res) {
  const { username, password } = req.body;
  try {
    const exists = await Usuario.findOne({ where: { username } });
    if (exists)
      return res.status(400).json({ message: "Usuario ya existe" });

    // El hook de Sequelize ya se encarga de hashear la contraseña
    const newUser = await Usuario.create({ username, password });
    res
      .status(201)
      .json({ message: "Usuario registrado", user: { id: newUser.id, username } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

async function login(req, res) {
  const { username, password } = req.body;
  try {
    const user = await Usuario.findOne({ where: { username } });
    if (!user)
      return res.status(400).json({ message: "Credenciales inválidas" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Credenciales inválidas" });

    // Generar un jti único y firmar el token con él
    const jti = uuidv4();
    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "10m",
      jwtid: jti,
    });

    res.json({ message: "Login exitoso", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

async function logout(req, res) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      // Decodificamos sin verificar para extraer el jti
      const decoded = jwt.decode(token, { complete: true });
      if (decoded && decoded.payload && decoded.payload.jti) {
        blacklist.add(decoded.payload.jti);
      }
    }
    res.status(200).json({ message: "Logout exitoso y token expirado" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

module.exports = {
  authenticateToken,
  register,
  login,
  logout,
};