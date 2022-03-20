const expressJwt = require("express-jwt");
const User = require("../../models/user");
const Level = require("../../models/level");
const Template = require("../../models/template");
const Track = require("../../models/Track");
const { createUnauthorizedError } = require("../../utils/general");
const { ROLE } = require("../../models/user/constants");

const verifyAuthToken = expressJwt({
  secret: "testing",
  algorithms: ["HS256"],
});

//-----added by rahul
const saveLastRoleStatus = async (req, res, next) => {
  let lastSession = req.body.lastSession;
  let userData = req.user;
  let fetchUserData = await User.findOne({ _id: userData._id }).lean();
  if (fetchUserData === null) {
    return res.status(200).json({
      status: "failed",
      message: "please send a valid token / user data not present in db",
    });
  } else {
    if (ROLE_ENUM.includes(lastSession)) {
      fetchUserData.lastSession = lastSession;
      let updatedData = await User.findOne({ _id: userData._id }).updateOne(fetchUserData);
      if (updatedData.n == 1 && updatedData.ok == 1 && updatedData.nModified == 1) {
        return next();
      }
      return res.status(200).json({
        status: "failed",
        message: "something went wrong while updating db please contact admin",
      });
    }
    return res.status(200).json({ status: "failed", message: "please send a valid user role" });
  }
};
//------end

const assocAuthUser = (req, res, next) =>
  User.findById(req.user.userId)
    .then((user) => {
      if (!user) {
        res.send(createUnauthorizedError("User not found"));
      } else {
        req.user = user;
        next();
      }
    })
    .catch((error) => res.send(createUnauthorizedError(error)));

// authenticate learner for tracks and level also
const assocAuthLearner = (req, res, next) =>
  User.findById(req.user.userId)
    .then(async (user) => {
      if (!user) {
        res.send(createUnauthorizedError("User not found"));
      } else {
        req.user = user;
        if (req.body.templateId) {
          const template = await Template.findById(req.body.templateId);
          const track = await Track.findById(template.trackId);
          const filteredArray = track.groupId.filter(function (n) {
            return user.groups.indexOf(n) !== -1;
          });
          if (filteredArray && filteredArray.length) {
            req.template = template;
            next();
          } else return res.status(401).send({ message: "User not Authorised for template" });
        } else if (req.query.levelId) {
          const level = await Level.findById(req.query.levelId);
          if (!level)
            return res
              .status(204)
              .send({ message: " Level Not Found (Please check the Level ID)" });
          const track = await Track.findById(level.trackId);
          const filteredArray = track.groupId.filter(function (n) {
            return user.groups.indexOf(n) !== -1;
          });
          if (filteredArray && filteredArray.length) {
            req.level = level;
            next();
          } else return res.status(401).send({ message: "User not Authorised for level" });
        } else next();
      }
    })
    .catch((error) => {
      console.log(error);
      res.send(createUnauthorizedError(error));
    });

const assocAuthOtherUser = (req, res, next) =>
  User.findById(req.user.userId)
    .then((user) => {
      if (!user) {
        res.send(createUnauthorizedError("User not found"));
      } else {
        req.user = user;
        next();
      }
    })
    .catch((error) => res.send(createUnauthorizedError(error)));

const isAdmin = (req, res, next) =>
  User.findById(req.user.userId)
    .then(async (user) => {
      if (!user) {
        res.send(createUnauthorizedError("Not Authorized"));
      } else if (user.role !== ROLE.CREATOR) {
        res.send(createUnauthorizedError("Not Authorized"));
      } else {
        req.user = user;
        if (req.body.levelId) {
          const level = await Level.findById(req.body.levelId);
          if (level && level.creatorUserId.toString() !== user._id.toString()) {
            res.status(401).send({ message: "User not Authorised for level" });
          }
        }
        next();
      }
    })
    .catch((error) => res.send(createUnauthorizedError(error)));

/**
 * withAuthUser :: [Middleware]
 * Verify auth token and assoc user document to request
 */
const withAuthUser = [verifyAuthToken, assocAuthUser];

/**
 * withAdminAuthUser :: [Middleware]
 * Verify auth token and check user role
 */
const withAdminAuthUser = [verifyAuthToken, isAdmin];

/**
 * withOptionalAuthUser :: [Middleware]
 * Get user object if exists - other ways assoc empty object
 */

const withAuthLearner = [verifyAuthToken, assocAuthLearner];

const withOptionalAuthUser = [
  ...withAuthUser,
  (error, req, res, next) => {
    if (error.status === 401) {
      req.user = {};
      next();
    } else {
      next(error);
    }
  },
];

module.exports = {
  verifyAuthToken,
  assocAuthUser,
  isAdmin,
  withAuthUser,
  withAdminAuthUser,
  withOptionalAuthUser,
  saveLastRoleStatus,
  withAuthLearner,
};
