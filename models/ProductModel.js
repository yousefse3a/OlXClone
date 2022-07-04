const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    desc: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productPic: {
        type: Array
    },
    price: {
        type: Number,
        required: true
    },
    isHidden: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    whishLists:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]
}, {
    timestamps: true

});
productSchema.pre(`findOneAndUpdate`, async function () {
    const hookData = await this.model.findOne(this.getQuery()).select('__v');
    if (hookData) {
        this.set({ __v: hookData.__v + 1 })
    }
})

const ProductModel = mongoose.model('Product', productSchema);
module.exports = { ProductModel };