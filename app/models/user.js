//load the things we need
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

//Define the schema for our user model
const userSchema = mongoose.Schema({
    email: { type: String, lowercase: true, trim: true},
    password: String,
    name: { type: String, trim: true},
    dob: Date,
    emailConfirmed: { type: Boolean, default: false},
    emailConfirmationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Number
});

//Generating an hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
};

// Checking valid password
userSchema.methods.isValidPassword = function (password) {
return bcrypt.compareSync(password, this.password);
};

// Checking email confirmation
userSchema.methods.isEmailConfirmed = function () {
return this.emailConfirmed;
};

// Create the model and expose it to our app
module.exports = mongoose.model('User', userSchema);