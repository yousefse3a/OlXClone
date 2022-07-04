const auth = require('./auth/auth.router');
const user = require('./user/user.router');
const product = require('./product/product.router');
const comment = require('./comment/comment.router');
module.exports = {
    auth, user, product, comment
}