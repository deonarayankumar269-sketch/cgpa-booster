const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("../config/passport");
const { register, login, getMe } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { registerValidator, loginValidator } = require("../validators/authValidators");
const router = express.Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", auth, getMe);

const clientUrl = (process.env.CLIENT_URL || "http://localhost:8080").split(",")[0].trim();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${clientUrl}/login?error=oauth_failed` }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
    res.redirect(`${clientUrl}/oauth-success?token=${token}`);
  }
);

module.exports = router;