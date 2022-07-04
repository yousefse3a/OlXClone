const dataMethod = ['body', 'params', 'query', 'file', 'headers']
const validation = (schema) => {
    return (req, res, next) => {
        try {
            const validationArr = []
            dataMethod.forEach(key => {
                if (schema[key]) {
                    const validationRsult = schema[key].validate(req[key],
                        { abortEarly: false })
                    if (validationRsult.error) {
                        validationArr.push(validationRsult.error.details)
                    }
                }
            })
            if (validationArr.length) {
                res.status(400).json({ message: "validation error", validationArr })
            } else {
                next()
            }
        } catch (error) {
            res.status(500).json({ message: "catch error", error })
        }
    }
}


module.exports = validation