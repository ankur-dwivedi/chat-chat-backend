const {update,get,create,deleteUser} = require("../../models/user/services");
const { generateError } = require("../../utils/error");
const { generateAuthToken } = require("../../utils/general");
const md5 = require("md5");

exports.getUsers = async(req,res) => 
    get(req.query)
        .then((user) => (res.send({
          status: 200,
          success: true,
          data: user,
        })))

exports.register = async (req, res) =>
  create({ ...req.body})
    .then((user) => 
      res.send({
        status: 200,
        success: true,
        data: user,
      })
    )
    .catch((err) => {
      res.status(400).send({ message: `user already exists` });
    });

exports.login = (req, res, next) => {
  let query = {};
  query.username = req.body.username;
  query.password = md5(req.body.password);
  return get({ ...query })
  .then((user) =>user?
    res.send({
    status: 200,
    success: true,
    data: user,
    token: generateAuthToken(user._id),
  })
  :generateError())
  .catch((err) => {
    res.status(400).send({ message: `invalid username or password` });
  });
};

exports.learnerLogin = (req, res, next) => {
  let query = {};
  query.employeeId = req.body.employeeId;
  query.password = md5(req.body.password);
  return get({ ...query })
  .then((user) =>user?
    res.send({
    status: 200,
    success: true,
    data: user,
    token: generateAuthToken(user._id),
  })
  :generateError())
  .catch((err) => {
    res.status(400).send({ message: `invalid employeeId or password` });
  });
};

exports.deleteUser = async (req, res) => 
  deleteUser(req.body.id).then((user) =>
    user.deletedCount
      ? res.send("User deleted")
      : res.send("User aleready deleted or doesnt exist")
  );

exports.update = async(req,res) => {
  const queryObject = { $and: [{ _id: req.body.id }] };
  const updateObject = { ...req.body, updatedAt: new Date() };
  delete updateObject.id;
  if (updateObject.password) updateObject.password = md5(updateObject.password)
  const updateUser= await update(queryObject, updateObject)
    .then((user) => ({
      status: 200,
      success: true,
      data: user,
    }))
    return res.send(updateUser);
    
};