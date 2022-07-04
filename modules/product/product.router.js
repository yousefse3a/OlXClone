const router = require('express').Router();

const validation = require('../../middlewares/validation');
const { auth, roles } = require('../../middlewares/auth');
const { myMulter, HME, validateFileMthod } = require('../../services/multer');
const { addProduct, updateProduct, deleteProduct, deleteSoftProduct, postLikeUnLike, addToWhish, hideProduct, getProduct } = require('./controller/Profile');
const { endPoint } = require('./product.endPoint');
const { addProductVaildation, updateProductVaildation } = require('./product.validation');

router.post('/product', auth(endPoint.addProduct), myMulter('productPic', validateFileMthod.image).array('images', 2), validation(addProductVaildation), HME, addProduct);
router.patch('/product/:id', auth(endPoint.updateProducct), myMulter('productPic', validateFileMthod.image).array('images', 2), validation(updateProductVaildation), HME, updateProduct);
router.delete('/product/:id', auth(endPoint.deleteProduct), deleteProduct);
router.get('/product/:id', getProduct);
router.put('/product/:id', auth(endPoint.deleteProduct), deleteSoftProduct);
router.put('/product/like/:id', auth(endPoint.postLikeUnLike), postLikeUnLike);
router.put('/product/Whish/:id', auth(endPoint.addToWhish), addToWhish);
router.put('/product/hide/:id', auth(endPoint.hideProduct), hideProduct);



module.exports = router