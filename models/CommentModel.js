const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    text: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reply: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
}, {
    timestamps: true
})
commentSchema.pre(`findOneAndUpdate`, async function () {
    const hookData = await this.model.findOne(this.getQuery()).select('__v');
    if (hookData) {
        this.set({ __v: hookData.__v + 1 })
    }
})
const CommentModel = mongoose.model('Comment', commentSchema);
module.exports = { CommentModel };