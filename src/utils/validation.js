const validator = require("validator");
const Joi = require("joi");

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;
    if (!firstName || !lastName) {
        throw new Error("Name is not valid!");
    } else if (!validator.isEmail(emailId)) {
        throw new Error("Email is not valid!");
    } else if (!validator.isStrongPassword(password)) {
        throw new Error("Please enter a strong password!");
    }
};

const validateLoginPassword = (req) => {
    const { password } = req.body;
    if (!password) {
        throw new Error("Password is required!");
    }
};

const validateEditProfileData = (req) => {
    const allowedEditFields = [
        "firstName",
        "lastName",
        "emailId",
        "photoUrl",
        "gender",
        "age",
        "about",
        "skills"
    ];

    const isEditAllowed = Object.keys(req.body).every((field) =>
        allowedEditFields.includes(field)
    );

    return isEditAllowed;
};

const validateNewPassword = (req) => {
    const { newPassword } = req.body;
    if (!newPassword || !validator.isStrongPassword(newPassword)) {
        throw new Error("Please provide a strong new password!");
    }
};

const passwordSchema = Joi.string().min(8).max(30).required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])"))
    .messages({
        "string.pattern.base": "Password must contain an uppercase letter, a lowercase letter, a number, and a special character."
    });

const validatePasswordResetRequest = (req) => {
    const schema = Joi.object({
        emailId: Joi.string().email().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) throw new Error(error.details[0].message);
};

const validateResetPassword = (req) => {
    const schema = Joi.object({
        resetToken: Joi.string().required(),
        newPassword: passwordSchema,
    });

    const { error } = schema.validate(req.body);
    if (error) throw new Error(error.details[0].message);
};

module.exports = {
    validateSignUpData,
    validateEditProfileData,
    validateNewPassword,
    validateLoginPassword,
    validatePasswordResetRequest,
    validateResetPassword
};
