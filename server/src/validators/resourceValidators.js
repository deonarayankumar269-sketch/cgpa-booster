const { body } = require("express-validator");

const resourceValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 200 }).withMessage("Title must be under 200 characters"),
  body("type")
    .notEmpty().withMessage("Type is required")
    .isIn(["Notes", "PYQ", "Assignment", "Question Bank", "Other"])
    .withMessage("Type must be one of: Notes, PYQ, Assignment, Question Bank, Other"),
  body("subject")
    .trim()
    .notEmpty().withMessage("Subject is required"),
  body("semester")
    .notEmpty().withMessage("Semester is required")
    .isInt({ min: 1, max: 20 }).withMessage("Semester must be between 1 and 20"),
  body("fileUrl")
    .trim()
    .notEmpty().withMessage("File URL is required")
    .isURL().withMessage("File URL must be a valid URL")
];

module.exports = { resourceValidator };