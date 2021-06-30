const User = require('../models/User');
const path = require('path');
const MyError =  require('../utils/myError');
const asyncHandler = require('../middlleware/asyncHandler');
const paginate = require('../utils/paginate');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

// register
exports.register = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    const token = user.getJsonWebToken();

    res.status(200).json({
        success: true,
        token,
        user: user,
    });
})

// login
exports.login = asyncHandler(async (req, res, next) => {
    const {email, password} = req.body;
    // Оролтыгоо шалгана.
    if(!email || !password){
        throw new MyError('Имейл болон нууц үгээ дамжуулна уу', 400);
    }

    // Тухайн хэрэглэгчийг хайна
    const user = await User.findOne({ email }).select('+password');

    if(!user){
        throw new MyError('Имейл болон нууц үгээ зөв оруулна уу', 401);
    }

    const ok = await user.checkPassword(password);

    if(!ok){
        throw new MyError('Имейл болон нууц үгээ зөв оруулна уу', 401);
    }

    const token = user.getJsonWebToken();

    const cookieOption = {
        expires: new Date(Date.now() + 2592000000),
        httpOnly: true,
    }

    res.status(200).cookie('amazon-token', token, cookieOption).json({
        success: true,
        token,
        user: user,
    });
});


exports.logout = asyncHandler(async (req, res, next) => {
    const cookieOption = {
        expires: new Date(Date.now() - 2592000000),
        httpOnly: true,
    }

    res.status(200).cookie('amazon-token', null, cookieOption).json({
        success: true,
        data: 'системээс гарлаа.... 🐰',
    });
})


exports.getUsers = asyncHandler(async (req, res, next) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort;
    const select = req.query.select;
    ['select', 'sort', 'page', 'limit'].forEach(el => delete req.query[el]);

    // Pagination
    const pagination = await paginate(page, limit, User);
    
        const users = await User.find(req.query, select)
        .sort(sort)
        .skip(pagination.start - 1)
        .limit(limit);

        res.status(200).json({
            success: true,
            data: users, 
            pagination,          
        });
});


exports.getUser = asyncHandler(async (req, res, next) => {
        const user = await User.findById(req.params.id).populate('books');
        if(!user){
            throw new MyError(req.params.id + ' ID-тай хэрэглэгч өгөгдлийн санд байхгүй',400);
        }

        res.status(200).json({
            success: true,
            data: user,
        });
})

exports.createUser = asyncHandler(async (req, res, next) => {

        const user = await User.create(req.body);

        res.status(200).json({
            success: true,
            data: user,
        });
})

exports.updateUser = asyncHandler(async (req, res, next) => {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if(!user){
            throw new MyError(req.params.id + ' ID-тай хэрэглэгч өгөгдлийн санд байхгүй',400);
        }

        res.status(200).json({
            success: true,
            data: user,
        });
})

exports.deleteUser = asyncHandler(async(req, res, next) => {  
        const user = await User.findById(req.params.id);

        if(!user){
            throw new MyError(req.params.id + ' ID-тай хэрэглэгч өгөгдлийн санд байхгүй',400);
        }

        user.remove();

        res.status(200).json({
            success: true,
            data: user,
        });
})


exports.forgotPassword = asyncHandler(async (req, res, next) => {

    if(!req.body.email ){
        throw new MyError('Та нууц үг сэргээх бүртгэлтэй имейл хаягаа дамжуулна уу 🐰',400);
    }

    const user = await User.findOne({ email: req.body.email });

    if(!user){
        throw new MyError(req.body.email+' -имейлтэй хэрэглэгч өгөгдлийн санд байхгүй байна 🐰',400);
    }

    const resetToken = user.generatePasswordChangeToken();
    await user.save();
    // await user.save({validateBeforeSave: false});

    // Имейл илгээнэ
    const link = `https://amazon.mn/changepassword/${resetToken}`;

    const message = `Сайн байна уу<br />Та нууц үгээ солих хүсэлт илгээнэ үү. <br /> <br /> Нууц үгээ доорх линк дээр дарж солино уу <br /><a target="_blanks" href="${link}">${link}</a><br /><br /> Өдрийг сайхан өнгөрүүлээрэй!`;

    await sendEmail({
        email: user.email,
        subject: 'Нууц үг өөрчлөх хүсэлт',
        message,
    });

    res.status(200).json({
        success: true,
        resetToken,
    });
});




exports.resetPassword = asyncHandler(async (req, res, next) => {

    if(!req.body.resetToken || !req.body.password ){
        throw new MyError('Та токен болон нууц үгээ дамжуулна уу 🐰',400);
    }

    const encrypted = crypto.createHash('sha256').update(req.body.resetToken).digest('hex');

    const user = await User.findOne({ resetPasswordToken: encrypted, resetPasswordExpire: { $gt: Date.now() }, });

    if(!user){
        throw new MyError('Хүчингүй токен байна 🐰',400);
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getJsonWebToken();

    res.status(200).json({
        success: true,
        token,
        user: user,
    });

})