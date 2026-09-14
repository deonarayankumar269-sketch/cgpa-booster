const { body } = require("express-validator");

const registerValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ max: 100 }).withMessage("Name must be under 100 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email address")
    .normalizeEmail(),
  body("password")
    .isString().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("semester")
    .optional()
    .isInt({ min: 1, max: 20 }).withMessage("Semester must be between 1 and 20")
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email address")
    .normalizeEmail(),
  body("password")
    .isString().withMessage("Password is required")
    .notEmpty().withMessage("Password is required")
];

module.exports = { registerValidator, loginValidator };