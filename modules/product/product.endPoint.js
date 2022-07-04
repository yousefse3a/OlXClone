const { roles } = require('../../middlewares/auth');
const endPoint = {
    addProduct: [roles.Admin, roles.User],
    updateProducct: [roles.Admin, roles.User],
    postLikeUnLike: [roles.Admin, roles.User],
    deleteProduct: [roles.Admin, roles.User],
    addToWhish: [roles.Admin, roles.User],
    hideProduct: [roles.Admin, roles.User]
}
module.exports = { endPoint };