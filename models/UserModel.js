const bycrpt = require('bcrypt');
const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    fristName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
    ,
    password: {
        type: String,
        required: true
    },
    profilePic: {
        type: Array
    },
    coverPic: {
        type: Array,
    },
    QRCode: {
        type: String
    },
    confirmEmail: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    whishList: [{
        type: String,
        ref: "Product"
    }],
    code:{
        type:Number,
        default:null
    },
    role:{
        type:String,
        default:'user'
    },
    socketID:{
        type:String
    }
}, {
    timestamps: true

});

userSchema.pre('save', async function (next) {
    this.password = await bycrpt.hash(this.password, +process.env.Roundbycrpt);
    next();
})

userSchema.pre(`findOneAndUpdate`, async function () {
    const hookData = await this.model.findOne(this.getQuery()).select('__v');
    if (hookData) {
        this.set({ __v: hookData.__v + 1 })
    }
})


const userModel = mongoose.models['User'] || mongoose.model('User', userSchema);
module.exports = { userModel };
