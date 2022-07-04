const validation = require('../../middlewares/validation');
const { auth, roles } = require('../../middlewares/auth');
const { myMulter, HME, validateFileMthod } = require('../../services/multer');
const { updateProfile, updatedPass, forgetPassword, SetSendCode, updatedEmail, deleteUser, addProfilePic, addCoverPic, softDeleteUser, getAllUsers } = require('./controller/profile');
const { updatePassValidation, updatedEmailValidation, SetSendCodeValidation, forgetPassValidation, updatedValidation } = require('./user.validation');

const router = require('express').Router();

router.get('/users',getAllUsers);
router.put('/updateProfilePic/:id',auth(roles.User),validation(updatedValidation), updateProfile);
router.post('/user/ProfilePic', auth(roles.User), myMulter('profilePic', validateFileMthod.image).single('img'), HME, addProfilePic);
router.post('/user/coverPic', auth(roles.User), myMulter('coverPic', validateFileMthod.image).array('img', 2), HME, addCoverPic);
router.delete('/user/:id', auth([roles.User, roles.Admin]), deleteUser);
router.delete('/userSoft/:id', auth([roles.Admin]), softDeleteUser);
router.post('/user/updatedPass', auth(roles.User), validation(updatePassValidation), updatedPass);
router.post('/user/updatedEmail', validation(updatedEmailValidation), auth(roles.User), updatedEmail);
router.post('/user/forgetPassword', validation(SetSendCodeValidation), SetSendCode);
router.post('/user/updateForgetPassword', validation(forgetPassValidation), forgetPassword);


module.exports = router