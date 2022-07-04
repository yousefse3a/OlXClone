const {  userModel } = require("../../../models/UserModel");
const bycrpt = require('bcrypt');
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    const { email, password } = req.body;
    const findUser = await userModel.findOne({ email });
    if (findUser) {
        const match = await bycrpt.compare(password, findUser.password);
        if (match) {
            if (!findUser.confirmEmail) { res.json({ message: "email not confirm" }); }
            else if (findUser.isBlocked) { res.json({ message: "email blocked" }); }
            else if (findUser.isDeleted) { res.json({ message: "email deleted by admin" }); }
            else {
                const token = jwt.sign({ id: findUser._id }, process.env.tokenSignature);
                res.json({ message: "logged", "userToken": token });
            }
        } else {
            res.json({ message: "password not match" })
        }
    } else {
        res.json({ message: "user not found" })
    }
}
module.exports = { login }