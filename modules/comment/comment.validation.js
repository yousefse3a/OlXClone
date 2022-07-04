const Joi = require("joi")

const addCommentVaildation = {
    body: Joi.object().required().keys({
        text: Joi.string().required().pattern(new RegExp(/[a-zA-Z][^#&<>\"~;$^%{}?]{2,100}$/))
    })
}
const updateCommentVaildation = {
    body: Joi.object().required().keys({
        text: Joi.string().required().pattern(new RegExp(/[a-zA-Z][^#&<>\"~;$^%{}?]{2,100}$/))
    })
}

module.exports = {
    addCommentVaildation,
    updateCommentVaildation
}