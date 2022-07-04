const { auth, roles } = require('../../middlewares/auth');
const validation = require('../../middlewares/validation');
const { registerValidation } = require('./auth.vaildation');
const { login } = require('./controller/login');
const { register, confirmEmail, refreshToken } = require('./controller/register');

const router = require('express').Router();


router.post('/register', validation(registerValidation),register);
router.get('/confirmEmail/:token', confirmEmail);
router.get('/refreshToken/:id', refreshToken);
router.post('/login', login);


module.exports = router