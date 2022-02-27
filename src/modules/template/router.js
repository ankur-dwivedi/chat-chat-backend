const { Router } = require("express");
const {
  create,
  getTemplates,
  deleteTemplate,
  uploadTemplateMedia,
  checkLevelType,
} = require("./controller");
const { validate } = require("../../middlewares/schema");
const { createContract, deleteContract } = require("./contract");
const multer = require("multer");
const { withAuthUser, withAuthLearner } = require("../../middlewares/auth");

var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "/tmp");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

const templateRouter = Router();

templateRouter.get("/", withAuthLearner, checkLevelType);
templateRouter.post("/", withAuthUser, validate(createContract), create);
templateRouter.delete("/", withAuthUser, validate(deleteContract), deleteTemplate);
templateRouter.post("/upload", withAuthUser, upload.array("files"), uploadTemplateMedia);

module.exports = templateRouter;
