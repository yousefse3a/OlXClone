const { auth } = require('../../middlewares/auth');
const validation = require('../../middlewares/validation');
const { endPoint } = require('./comment.endPoint');
const { updateCommentVaildation, addCommentVaildation } = require('./comment.validation');
const { addComment, addReply, commentLikeUnLike, updateComment, deleteComment } = require('./controller/profile');

const router = require('express').Router();


router.post('/comment/:id',auth(endPoint.addComment),validation(addCommentVaildation) ,addComment);
router.post('/comment/reply/:id',auth(endPoint.addComment),validation(addCommentVaildation) ,addReply);
router.patch('/comment/:id', auth(endPoint.updateComment),validation(updateCommentVaildation), updateComment);
router.delete('/comment/:id', auth(endPoint.deleteComment), deleteComment);

router.put('/comment/like/:id', auth(endPoint.commentLikeUnLike), commentLikeUnLike);



module.exports = router