const multer = require("multer");
const path = require("path");
const { nanoid } = require('nanoid');
const fs = require("fs");


function HME(err, req, res, next) {
    if (err) {
        res.json({ err })
    } else {
        next()
    }
}

const validateFileMthod = {
    image: ['image/jpg', 'image/jpeg', 'image/png'],
    textFile: ['application/pdf'],

}
function myMulter(customPath, validateType) {
    if (!customPath || customPath == null) {
        customPath = 'general';
    }
    if (!fs.existsSync(path.join(__dirname, `../uploads/${customPath}`))) {
        fs.mkdirSync(path.join(__dirname, `../uploads/${customPath}`), { recursive: true })
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            req.fileDest = `/uploads/${customPath}`;
            cb(null, path.join(__dirname, `../uploads/${customPath}`))
        },
        filename: function (req, file, cb) {
            const fileFullName = nanoid() + '_' + file.originalname;
            cb(null, fileFullName);
        }
    })
    const fileFilter = function (req, file, cb) {
        if (validateType.includes(file.mimetype)) {
            cb(null, true);
        } else {
            req.fileError = true;
            cb('invaild type', false);
        }

    }
    const upload = multer({ fileFilter, storage });
    return upload;
}
module.exports = { myMulter, HME, validateFileMthod };