const jwt = require("jsonwebtoken");
const { userModel } = require("../../../models/UserModel");
const sendEmail = require("../../../services/sendEmail");
const { StatusCodes } = require('http-status-codes');
const e = require("express");


const confirmEmail = async (req, res) => {
    const { token } = req.params;
    try {
        const decoded = jwt.verify(token, process.env.tokenSignature);
        const findUser = await userModel.findOne({ _id: decoded._id });
        if (findUser && findUser.confirmEmail) {
            res.json({ message: "your email confirmed" })
        } else {
            await userModel.findOneAndUpdate({ _id: decoded._id }, { confirmEmail: true });
            res.status(StatusCodes.ACCEPTED).json({ message: "email confirm" });
        }
    } catch (error) {
        res.status(501).json({ message: "catch err ", error })
    }
}
const refreshToken = async (req, res) => {
    const { id } = req.params
    try {
        const user = await userModel.findById(id);
        if (user) {
            const token = jwt.sign({ _id: id }, process.env.tokenSignature, { expiresIn: 5 * 60 });
            const confirmURL = `${req.protocol}://${req.headers.host}/confirmEmail/${token}`
            const refreshURL = `https://olxclonev0.herokuapp.com/refreshToken/${id}`
            const mesaage = `
        <div>
        <a href='${confirmURL}'>confirm</a> <hr/>
        <a href='${refreshURL}'>refresh token</a> <hr/>
        </div>
        `
            await sendEmail(user.email, mesaage);
            res.status(201).json({ message: "email send" });
        } else {
            res.json({ message: "not register user", error })
        }

    } catch (error) {
        res.status(501).json({ message: "catch err ", error })
    }
}

const register = async (req, res) => {
    const { fristName, lastName, email, password } = req.body;
    try {
        const newUser = new userModel({ fristName, lastName, email, password });
        const createUser = await newUser.save();
        sendConfirmation(createUser,req)
        res.status(201).json({ message: "email send" });
    } catch (error) {
        if (error.keyValue?.email) {
            res.status(501).json({ message: "email exist" })
        } else {
            res.status(501).json({ message: "catch err ", error })
        }
    }
}
 async function sendConfirmation(user,req){
    const token = jwt.sign({ _id: user._id }, process.env.tokenSignature, { expiresIn: 5 * 60 });
    const confirmURL = `https://olxclonev0.herokuapp.com/confirmEmail/${token}`
    const refreshURL = `https://olxclonev0.herokuapp.com//refreshToken/${user._id}`
    const mesaage = `
    <div>
    <a href='${confirmURL}'>confirm</a><hr/>
    <a href='${refreshURL}'>refresh token</a> <hr/>
    </div>
    `
    await sendEmail(user.email, mesaage);
}

module.exports = {
    register,
    confirmEmail,
    refreshToken,
    sendConfirmation
}