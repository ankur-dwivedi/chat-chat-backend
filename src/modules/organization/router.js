const { Router } = require('express');
const {
  create,
  getOrganizations,
  deleteOrganization,
  update,
  uploadLogo,
  uploadEmployeeData,
  getRestrictedData,
  countAddUsersBulk,
  addUsersBulk,
  replaceEmployeeData,
  countReplaceEmployeeData,
} = require('./controller');
const { validate } = require('../../middlewares/schema');
const {
  createOrganizationContract,
  editOrganizationContract,
  deleteContract,
  replaceOrganizationContract,
} = require('./contract');
const { withAdminAccess } = require('../../middlewares/auth');
const multer = require('multer');

var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/tmp');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

const organizationRouter = Router();

organizationRouter.get('/', getOrganizations);
organizationRouter.post('/', validate('body', createOrganizationContract), create);
organizationRouter.delete('/', validate('body', deleteContract), deleteOrganization);
organizationRouter.patch('/', validate('body', editOrganizationContract), update);
organizationRouter.post('/upload-logo', upload.array('files'), uploadLogo);
organizationRouter.post('/upload-employee-data', upload.array('files'), uploadEmployeeData);
organizationRouter.post('/count-add-users-bulk', withAdminAccess, upload.array('files'), countAddUsersBulk);
organizationRouter.post('/add-users-bulk', withAdminAccess, upload.array('files'), addUsersBulk);
organizationRouter.post(
  '/count-replace-employee-data',
  withAdminAccess,
  upload.array('files'),
  countReplaceEmployeeData
);
organizationRouter.post(
  '/replace-employee-data',
  withAdminAccess,
  validate('query', replaceOrganizationContract),
  upload.array('files'),
  replaceEmployeeData
);

organizationRouter.get('/restricted-data', withAdminAccess, getRestrictedData);


module.exports = organizationRouter;
