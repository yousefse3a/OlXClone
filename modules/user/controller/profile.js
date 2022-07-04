const { StatusCodes } = require('http-status-codes');
const { userModel } = require("../../../models/userModel");
const sendEmail = require('../../../services/sendEmail');
const bycrpt = require('bcrypt');
const { sendConfirmation } = require('../../auth/controller/register');
const { roles } = require('../../../middlewares/auth');
const paginate = require('../../../services/paginate');
const path = require("path");

const getAllUsers = async (req, res) => {
    const { page, size } = req.query
    console.log(page, size)
    const { skip, limit } = paginate(page, size)
    const users = await userModel.find({}).limit(limit).skip(skip).populate([
        {
            path: 'whishList',
            populate: [{
                path: "likes",
                select: "fristName email"
            }, {
                path: "comments",
                populate: [
                    {
                        path: "createdBy",
                        select: "fristName email"
                    }, {
                        path: "reply",
                        populate: [
                            {
                                path: "createdBy",
                                select: "fristName email"
                            }, {
                                path: "likes",
                                select: "fristName email"
                            }, {
                                path: "reply",
                                populate: [
                                    {
                                        path: "createdBy",
                                        select: "fristName email"
                                    }, {
                                        path: "likes",
                                        select: "fristName email"
                                    }
                                ]
                            }
                        ]
                    }, {
                        path: "likes",
                        select: "fristName email"
                    }
                ]
            }]
        }
    ])

    res.status(200).json({ message: "Done", users })
}
const updateProfile = async (req, res) => {
    try {
        if (req.user_id === req.params.id) {
            const UserUpdate = await userModel.findOneAndUpdate({ _id: req.user._id }, { ...req.body }, { new: true })
            res.status(StatusCodes.OK).json({ message: "User updated", UserUpdate });
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "not auth user" })
        }
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "error", error });
    }
}
const updatedEmail = async (req, res) => {
    let { email, password } = req.body;
    let { _id } = req.user;
    try {
        const user = await userModel.findById(_id);
        if (user) {
            const match = await bycrpt.compare(password, user.password);
            if (match) {
                const user = await userModel.findByIdAndUpdate({ _id }, { email, confirmEmail: false }, { new: true });
                sendConfirmation(user, req)
                res.json({ message: "send email to confirm" });
            } else {
                res.json({ message: "password not right" });
            }
        } else {
            res.json({ message: "user not found" });
        }
    } catch (error) {
        res.status(501).json({ message: "catch err ", error })
    }
}
const updatedPass = async (req, res) => {
    let { oldPass, newPass } = req.body;
    let { _id } = req.user;
    try {
        const user = await userModel.findById(_id);
        if (user) {
            const match = await bycrpt.compare(oldPass, user.password);
            if (match) {
                newPass = await bycrpt.hash(newPass, +process.env.Roundbycrpt);
                const user = await userModel.findByIdAndUpdate({ _id }, { password: newPass }, { new: true });
                res.json({ message: "pass updated", user });
            } else {
                res.json({ message: "old password not right" });
            }
        } else {
            res.json({ message: "user not found" });
        }
    } catch (error) {
        res.status(501).json({ message: "catch err ", error })
    }
}
const SetSendCode = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (user) {
            const code = pad(Math.floor(Math.random() * 10001), 4);
            await sendEmail(email, code);
            await userModel.findOneAndUpdate({ email }, { code });
            res.status(201).json({ message: "code send" });
        } else {
            res.json({ message: "user not found" });
        }
    } catch (error) {
        res.status(501).json({ message: "catch err ", error })

    }
}
const forgetPassword = async (req, res) => {
    let { email, code, newPass } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (user) {
            if (code == user.code) {
                const match = await bycrpt.compare(newPass, user.password);
                if (match) {
                    res.status(201).json({ message: "change the new password cuz equal old pass" });
                } else {
                    newPass = await bycrpt.hash(newPass, +process.env.Roundbycrpt);
                    const newII = await userModel.findByIdAndUpdate({ _id: user._id }, { password: newPass, code: null }, { new: true });
                    res.json({ message: "pass updated", newII });
                }
            } else
                res.json({ message: "code not right" });
        } else {
            res.json({ message: "user not found" });
        }
    } catch (error) {
        res.status(501).json({ message: "catch err ", error })
    }
}
pad = function (num, size) {
    var s = String(num);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}
const softDeleteUser = async (req, res) => {
    const { id } = req.params
    try {
        if (req.user.role === roles.Admin) {
            await userModel.findByIdAndUpdate({ id }, { isDeleted: true });
            res.status(StatusCodes.OK).json({ message: "user soft deleted" })
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "not auth user" })
        }

    } catch (error) {
        res.status(501).json({ message: "catch err ", error })

    }
}
const deleteUser = async (req, res) => {
    const { id } = req.params
    try {
        if (req.user.role === roles.Admin || req.user._id == id) {
            await userModel.findByIdAndDelete(id);
            res.status(StatusCodes.OK).json({ message: "user deleted" })
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "not auth user" })
        }

    } catch (error) {
        res.status(501).json({ message: "catch err ", error })

    }
}
const addProfilePic = async (req, res) => {
    const { _id } = req.user
    try {
        if (req.file) {
            if (!req.fileError) {
                const profilePic = `${req.fileDest}/${req.file.filename}`;
                const UserUpdate = await userModel.findOneAndUpdate({ _id }, { ...req.body, $push: { profilePic } }, { new: true });
                if (UserUpdate) {
                    res.status(StatusCodes.OK).json({ message: "profile image added" });
                } else {
                    res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
                }
            } else {
                res.status(StatusCodes.NOT_ACCEPTABLE).json({ message: "invaild type" });
            }
        } else {
            res.status(StatusCodes.NOT_ACCEPTABLE).json({ message: "image requird" });
        }
    } catch (error) {
        res.status(501).json({ message: "catch err ", error })
    }
}
const addCoverPic = async (req, res) => {
    const { _id } = req.user
    try {
        if (req.files) {
            if (!req.fileError) {
                const imgURLs = [];
                req.files.forEach(file => {
                    imgURLs.push(`${req.fileDest}/${file.filename}`);
                });
                await userModel.findOneAndUpdate({ _id }, { ...req.body, $push: { coverPic: { $each: [...imgURLs] } } }, { new: true });
                res.status(StatusCodes.CREATED).json({ message: "cover images added" });
            } else { res.status(StatusCodes.ACCEPTED).json({ message: "invaild type" }); }
        } else {
            res.status(StatusCodes.ACCEPTED).json({ message: "image requird" });
        }
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "error", error });
    }

}

const sendEmailToAdmin = async (pdfName) => {
    const adminEmails = await userModel.find({ role: 'admin' }).select('email');
    let allEmails = adminEmails[0].email;
    adminEmails.slice(1).map((email) => allEmails = allEmails + ',' + email.email);
    console.log(pdfName)
    let att = [
        {
            filename: `${pdfName}`,
            path: path.join(__dirname + `../../../../uploads/PDF/${pdfName}`)
        }
    ]
    await sendEmail(allEmails, `<b>New Products Has been added</b>`, att);
}
module.exports = { sendEmailToAdmin,getAllUsers, updateProfile, updatedPass, forgetPassword, SetSendCode, updatedEmail, deleteUser, addProfilePic, addCoverPic, softDeleteUser }