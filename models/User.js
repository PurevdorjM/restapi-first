const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { nextTick } = require('process');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Хэрэглэгчийн нэрийг оруулна уу 🐰'],
    },
    email: {
        type: String,
        required: [true, 'Хэрэглэгчийн имейл хаягийг оруулж өгнө үү 🐰'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Имейл хаяг буруу байна 🐰']
    },
    role: {
        type: String,
        required: [true, 'Хэрэглэгчийн эрхийг оруулна уу 🐰'],
        enum: ['user', 'operator', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        minlength: 4,
        required: [true, 'Нууц үгээ оруулна уу 🐰'],
        select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

UserSchema.pre('save', async function(next){
    // Нууц үг өөрчлөгдөөгүй бол дараагийн middleware луу шилж
    if(!this.isModified('password')) next();

    // Нууц үг өөрчлөгдсөн
    console.time('salt');
    const salt = await bcrypt.genSalt(10);
    console.timeEnd('salt');

    console.time('hash');
    this.password = await bcrypt.hash(this.password, salt);
    console.timeEnd('hash');
});

UserSchema.methods.getJsonWebToken = function(){
    const token = jwt.sign({id: this._id, role: this.role}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRESIN,
    });

    return token;
};

UserSchema.methods.checkPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
};

UserSchema.methods.generatePasswordChangeToken = function(){
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};



module.exports = mongoose.model('User', UserSchema);