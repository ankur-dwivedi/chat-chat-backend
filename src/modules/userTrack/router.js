const { Router } = require("express");
const userTrackController = require("./controller");
const { withAuthUser } = require("../../middlewares/auth");
const { createUserTrackInfoContract, updateUserTrackInfoContract} = require("./contract");
const {dueDateReminderSendMailToUsers} = require('../../models/userTrack/services')
const { validate } = require("../../middlewares/schema");

const userTrackRouter = Router();

userTrackRouter.get("/fetchUserTrackInfo", withAuthUser, userTrackController.get.fetchUserTrackInfo);
userTrackRouter.post("/createUserTrackInfo", withAuthUser,validate("body",createUserTrackInfoContract), userTrackController.post.createUserTrackInfo);
// userTrackRouter.put("/updateUserTrackInfo/:userTrackId", withAuthUser,validate("body",updateUserTrackInfoContract), userTrackController.put.updateUserTrackInfo);

userTrackRouter.get("/runCronJob",dueDateReminderSendMailToUsers)

module.exports = userTrackRouter;
