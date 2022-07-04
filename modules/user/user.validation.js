const Joi = require("joi")

const updatedValidation = {
    body: Joi.object().required().keys({
        fristName: Joi.string().required().pattern(new RegExp(/[A-Z][a-zA-Z][^#&<>\"~;$^%{}?]{2,20}$/)).messages({
            'string.empty': 'plz fill in u name',
            'any.required': 'plz send  u name',
            'string.pattern.base': 'plz enter valid name char',
        }),
        lastName: Joi.string().required().pattern(new RegExp(/[A-Z][a-zA-Z][^#&<>\"~;$^%{}?]{2,20}$/)).messages({
            'string.empty': 'plz fill in u name',
            'any.required': 'plz send  u name',
            'string.pattern.base': 'plz enter valid name char',
        }),
    })
}
const updatePassValidation = {
    body: Joi.object().required().keys({
        oldPass: Joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
        newPass: Joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
    })
}
const updatedEmailValidation = {
    body: Joi.object().required().keys({
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
    })
}
const forgetPassValidation = {
    body: Joi.object().required().keys({
        email: Joi.string().email().required(),
        newPass: Joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
        code: Joi.string().max(4).min(4)
    })
}
const SetSendCodeValidation = {
    body: Joi.object().required().keys({
        email: Joi.string().email().required()
    })
}

module.exports = {
    updatePassValidation,
    updatedEmailValidation,
    forgetPassValidation,
    SetSendCodeValidation,
    updatedValidation
}