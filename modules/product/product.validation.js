const Joi = require("joi")

const addProductVaildation = {
    body: Joi.object().required().keys({
        title: Joi.string().required().pattern(new RegExp(/[A-Z][a-zA-Z][^#&<>\"~;$^%{}?]{2,20}$/)).messages({
            'string.empty': 'plz fill in u name',
            'any.required': 'plz send  u name',
            'string.pattern.base': 'plz enter valid name char',
        }),
        desc: Joi.string().required().pattern(new RegExp(/[A-Z][a-zA-Z][^#&<>\"~;$^%{}?]{2,100}$/)),
        price: Joi.number().required()
    })
}
const updateProductVaildation = {
    body: Joi.object().required().keys({
        title: Joi.string().optional().pattern(new RegExp(/[A-Z][a-zA-Z][^#&<>\"~;$^%{}?]{2,20}$/)),
        desc: Joi.string().optional().pattern(new RegExp(/[A-Z][a-zA-Z][^#&<>\"~;$^%{}?]{2,100}$/)),
        price: Joi.number().optional()
    })
}

module.exports = {
    addProductVaildation,
    updateProductVaildation
}