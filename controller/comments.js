const Category = require('../models/Category');
const path = require('path');
const MyError =  require('../utils/myError');
const asyncHandler = require('../middlleware/asyncHandler');
const paginate = require('../utils/paginate-sequelize');


exports.createComment = asyncHandler(async (req, res, next) => {

    const comment =  await req.db.comment.create(req.body);

    res.status(200).json({
        success: true,
        data: comment,
    });
});

// /api/comments/:id
exports.updateComment = asyncHandler(async (req, res, next) => {

    let comment =  await req.db.comment.findByPk(req.params.id);

    if(!comment){
        throw new MyError(`${req.params.id} id-тэй коммент олдсонгүй 🐰`, 400)
    };

    comment = await comment.update(req.body);

    res.status(200).json({
        success: true,
        data: comment,
    });
});

// /api/comments/:id
exports.deleteComment = asyncHandler(async (req, res, next) => {

    let comment =  await req.db.comment.findByPk(req.params.id);

    if(!comment){
        throw new MyError(`${req.params.id} id-тэй коммент олдсонгүй 🐰`, 400)
    };

    comment = await comment.destroy();

    res.status(200).json({
        success: true,
        data: comment,
    });
});


// /api/comments/:id
exports.getComment = asyncHandler(async (req, res, next) => {

    const comment =  await req.db.comment.findByPk(req.params.id);

    if(!comment){
        throw new MyError(`${req.params.id} id-тэй коммент олдсонгүй 🐰`, 400)
    };

    const [result] = await req.db.sequelize.query("SELECT u.name, c.comment, c.createdAt FROM amazon.user u left join amazon.comment c on u.id = c.userid where c.comment like '%цонх%'");

    const [uResult, uMeta] = await req.db.sequelize.query("update comment set comment = 'Лайтай >>>>' where id=5");

    res.status(200).json({
        success: true,
        result,
        uResult,
        uMeta,
        user: await comment.getUser(),
        book: await comment.getBook(),
        data: comment,
    });
});

exports.getComments = asyncHandler(async (req, res, next) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const sort = req.query.sort;
    let select = req.query.select;
    ['select', 'sort', 'page', 'limit'].forEach(el => delete req.query[el]);

    if(select) {
        select = select.split(' ');
    }

    // Pagination
    const pagination = await paginate(page, limit, req.db.comment);

    let query = {limit, offset: pagination.start - 1};
    if(req.query) {
        query.where = req.query;
    }

    if(select){
        query.attributes = select;
    }

    if(sort) {
        query.order = sort.split(' ').map(el => [el.charAt(0) === '-' ? el.substring(1) : el, el.charAt(0) === '-' ? 'DESC' : 'ASC']);
    }
    
        const comments = await req.db.comment.findAll(query);

        res.status(200).json({
            success: true,
            data: comments,
            pagination,          
        });
});


// Lazy loading
exports.getUserComments = asyncHandler(async (req, res, next) => {

    const user =  await req.db.user.findByPk(req.params.id);

    if(!user){
        throw new MyError(`${req.params.id} id-тэй хэрэглэгч олдсонгүй 🐰`, 400)
    };

    const comments = await user.getComments();

    res.status(200).json({
        success: true,
        user,
        comments,
    });
});

// Eager loading
exports.getBookComments = asyncHandler(async (req, res, next) => {

    const book =  await req.db.book.findByPk(req.params.id, {include: req.db.comment});

    if(!book){
        throw new MyError(`${req.params.id} id-тэй ном олдсонгүй 🐰`, 400)
    };

    res.status(200).json({
        success: true,
        book,
    });
});