const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { registerValidator, loginValidator } = require("../validators/authValidators");
const router = express.Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", auth, getMe);

module.exports = router;