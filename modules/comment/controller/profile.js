const { ProductModel } = require("../../../models/ProductModel");
const { CommentModel } = require("../../../models/CommentModel");
const { StatusCodes } = require("http-status-codes");
const { userModel } = require("../../../models/UserModel");
const { roles } = require("../../../middlewares/auth");
const { getIo } = require("../../../services/socket");

const addComment = async (req, res) => {
    const productId = req.params.id;
    const { text } = req.body;
    try {
        const product = await ProductModel.findById(productId);
        if (product) {
            const newComment = new CommentModel({ text, createdBy: req.user._id, productId: product._id });
            const savedComment = await newComment.save();
            await ProductModel.findByIdAndUpdate({ _id: product._id }, { $push: { comments: savedComment._id } })
            const userSocket = await userModel.findById(req.user._id).select('socketID');
            getIo().except(userSocket.socketID).emit('addComment', [savedComment]);
            res.status(200).json({ message: "Done" })
        } else {
            res.status(404).json({ message: "In-valid product id" })
        }
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "error", error });
    }
}
const addReply = async (req, res) => {
    const commentId = req.params.id;
    const { text } = req.body;
    try {
        const comment = await CommentModel.findById(commentId);
        if (comment) {
            const newComment = new CommentModel({ text, createdBy: req.user._id, productId: comment.productId });
            const savedComment = await newComment.save();
            await CommentModel.findByIdAndUpdate({ _id: comment._id }, { $push: { reply: savedComment._id } })
            const userSocket = await userModel.findById(req.user._id).select('socketID');
            getIo().except(userSocket.socketID).emit('addComment', [savedComment]);
            res.status(200).json({ message: "Done" })
        } else {
            res.status(404).json({ message: "In-valid comment id" })
        }
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "error", error });
    }
}
const updateComment = async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    try {
        const comment = await CommentModel.findById(id);
        if (comment) {
            if (req.user.id == comment.createdBy) {
                const updatedComment = await CommentModel.findByIdAndUpdate({ _id: id }, { text }, { new: true })
                res.status(StatusCodes.CREATED).json({ message: "comment updated", updatedComment });
            } else {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: "not auth user" })
            }
        } else { res.status(StatusCodes.UNAUTHORIZED).json({ message: "comment not found" }) }

    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "error", error });
    }

}
const commentLikeUnLike = async (req, res) => {
    const { id } = req.params;
    const comment = await CommentModel.findById(id);
    if (comment) {
        const find = await CommentModel.findOne({ _id: id, likes: { $elemMatch: { $eq: req.user._id } } });
        if (find) {
            await CommentModel.findByIdAndUpdate(id, { $pull: { likes: req.user._id } });
            res.status(StatusCodes.CREATED).json({ message: "comment unliked" });
        } else {
            await CommentModel.findByIdAndUpdate(id, { $push: { likes: req.user._id } });
            res.status(StatusCodes.CREATED).json({ message: "comment liked" });
        }
    } else {
        res.status(StatusCodes.ACCEPTED).json({ message: "correct id requird" });
    }
}
const deleteComment = async (req, res) => {
    const { id } = req.params;
    try {
        const comment = await CommentModel.findById(id);
        if (comment) {
            const product = await ProductModel.findById(comment.productId);
            if (product) {
                if ([`${comment.createdBy}`, `${product._id}`].includes(`${req.user._id}`)) {
                    await ProductModel.findOneAndUpdate({ comments: { $elemMatch: { $eq: `${id}` } } }, { $pull: { comments: `${id}` } });
                    await CommentModel.findOneAndUpdate({ reply: { $elemMatch: { $eq: `${id}` } } }, { $pull: { reply: `${id}` } });
                    await CommentModel.findByIdAndDelete(id);
                    res.status(StatusCodes.OK).json({ message: "comment deleted" });
                } else {
                    res.status(StatusCodes.UNAUTHORIZED).json({ message: "not auth userllklk" })
                }
            } else {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: "product not found" })
            }
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "comment not found" })
        }

    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "error", error });
    }
}
module.exports = { addComment, addReply, commentLikeUnLike, updateComment, deleteComment }