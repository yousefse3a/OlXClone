const { ProductModel } = require("../../../models/ProductModel");
const { StatusCodes } = require("http-status-codes");
const { userModel } = require("../../../models/UserModel");
const { roles } = require("../../../middlewares/auth");
const fs = require("fs");
const path = require("path");
const QRCode = require('qrcode');
const { createInvoice } = require('../../../services/pdf');
const dayjs = require('dayjs');
const { getIo } = require("../../../services/socket");


const getProduct = async (req, res) => {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    if (product) {
        const pro = await ProductModel.findById(id).populate([
            {
                path: "createdBy",
                select: "fristName email"
            },
            {
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
            }, {
                path: "likes",
                select: "fristName email"
            }
        ]);
        res.status(StatusCodes.OK).json({ message: "product", pro })
    } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: "product not found" })
    }
}
const addProduct = async (req, res) => {
    const { desc, title, price } = req.body;
    try {
        if (req.files.length > 0) {
            if (!req.fileError) {
                const imgURLs = [];
                req.files.forEach(file => {
                    imgURLs.push(`${req.fileDest}/${file.filename}`);
                });
                const newProduct = new ProductModel({ desc, title, price, productPic: imgURLs, createdBy: req.user._id });
                const savedProduct = await newProduct.save();
                QRCode.toDataURL(`${savedProduct}`, function (err, url) {
                    if (err) {
                        res.status(400).json({ message: "QR err" })
                    } else {
                        res.json({ message: "product QR", url })
                    }
                })
                const userSocket = await userModel.findById(req.user._id).select('socketID');
                console.log(userSocket)
                getIo().except(userSocket.socketID).emit('productCreate', [savedProduct]);
            } else { res.status(StatusCodes.ACCEPTED).json({ message: "invaild type" }); }
        } else {
            res.status(StatusCodes.ACCEPTED).json({ message: "image requird" });
        }
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "error", error });
    }

}
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { desc, title, price } = req.body;
    try {
        const product = await ProductModel.findById(id);
        if (product) {
            if (req.user.id == product.createdBy) {
                if (req.files.length > 0) {
                    if (!req.fileError) {
                        const imgURLs = [];
                        req.files.forEach(file => {
                            imgURLs.push(`${req.fileDest}/${file.filename}`);
                        });
                        const updatedProduct = await ProductModel.findByIdAndUpdate({ _id: id }, { desc, title, price, productPic: imgURLs }, { new: false })
                        updatedProduct.productPic.forEach(img => {
                            console.log(img)
                            fs.unlinkSync(path.join(__dirname, `../../../${img}`));
                        });
                        res.status(StatusCodes.CREATED).json({ message: "Product updated", updatedProduct });

                    } else { res.status(StatusCodes.ACCEPTED).json({ message: "invaild type" }); }
                } else {
                    const updatedProduct = await ProductModel.findByIdAndUpdate({ _id: id }, { desc, title, price }, { new: false });
                    res.status(StatusCodes.CREATED).json({ message: "Product updated", updatedProduct });
                }
            } else {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: "not auth user" })
            }
        } else { res.status(StatusCodes.UNAUTHORIZED).json({ message: "product not found" }) }

    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "error", error });
    }

}
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await ProductModel.findById(id);
        if (product) {
            if (req.user.role === roles.Admin || `${req.user._id}` === `${product.createdBy}`) {
                const delProduct = await ProductModel.findByIdAndDelete(id);
                if (delProduct) {
                    product.productPic.forEach(img => {
                        fs.unlinkSync(path.join(__dirname, `../../../${img}`));
                    });
                    res.status(StatusCodes.OK).json({ message: "product deleted" });
                }
            } else {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: "not auth user" })
            }
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "product not found" })
        }

    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "error", error });
    }
}
const deleteSoftProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await ProductModel.findById(id);
        if (req.user.role === roles.Admin || `${req.user._id}` === `${product.createdBy}`) {
            await ProductModel.findByIdAndUpdate(id, { isDeleted: true });
            res.status(StatusCodes.OK).json({ message: "product soft deleted" });
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "not auth user" })
        }

    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "error", error });
    }
}
const hideProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await ProductModel.findById(id);
        if (req.user.role === roles.Admin || `${req.user._id}` === `${product.createdBy}`) {
            await ProductModel.findByIdAndUpdate(id, { isHidden: true });
            res.status(StatusCodes.OK).json({ message: "product hidden" });
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "not auth user" })
        }

    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "error", error });
    }
}
const postLikeUnLike = async (req, res) => {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    if (product) {
        const find = await ProductModel.findOne({ _id: id, likes: { $elemMatch: { $eq: req.user._id } } });
        if (find) {
            await ProductModel.findByIdAndUpdate(id, { $pull: { likes: req.user._id } });
            res.status(StatusCodes.CREATED).json({ message: "product unliked" });
        } else {
            await ProductModel.findByIdAndUpdate(id, { $push: { likes: req.user._id } });
            res.status(StatusCodes.CREATED).json({ message: "product liked" });
        }
    } else {
        res.status(StatusCodes.ACCEPTED).json({ message: "correct id requird" });

    }
}
const addToWhish = async (req, res) => {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    if (product) {
        const find = await userModel.findOne({ _id: req.user._id, whishList: { $elemMatch: { $eq: id } } });
        if (!find) {
            await userModel.findByIdAndUpdate({ _id: req.user._id }, { $push: { whishList: id } });
            await ProductModel.findByIdAndUpdate({ _id: product._id }, { $push: { whishLists: req.user._id } })
            res.status(StatusCodes.CREATED).json({ message: "product add to whishList" });
        } else {
            res.status(StatusCodes.CREATED).json({ message: "already in whishList " });
        }
    } else {
        res.status(StatusCodes.ACCEPTED).json({ message: "correct id requird" });

    }
}
const getProductsToday = async () => {
    const start = dayjs().startOf('day');
    const end = dayjs().endOf('day');
    const products = await ProductModel.find({ createdAt: { $gt: start, $lt: end } })
    const invoice = {
        products
    };
    let customPath = `../../../uploads/PDF/Products(${start.$D}-${start.$M}-${start.$y}).pdf`
    createInvoice(invoice, path.join(__dirname, customPath));
    return `Products(${start.$D}-${start.$M}-${start.$y}).pdf`;
}
module.exports = { getProductsToday, getProduct, addProduct, updateProduct, deleteProduct, deleteSoftProduct, postLikeUnLike, addToWhish, hideProduct }