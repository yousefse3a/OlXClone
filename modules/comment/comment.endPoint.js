const { roles } = require('../../middlewares/auth');
const endPoint = {
    addComment: [roles.Admin, roles.User],
    commentLikeUnLike: [roles.Admin, roles.User],
    updateComment: [roles.Admin, roles.User],
    deleteComment: [roles.Admin, roles.User],
    
}
module.exports = { endPoint };