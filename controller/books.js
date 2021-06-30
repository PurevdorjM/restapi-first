const Book = require('../models/Book');
const path = require('path');
const Category = require('../models/Category');
const User = require('../models/User');
const MyError =  require('../utils/myError');
const asyncHandler = require('../middlleware/asyncHandler');
const paginate = require('../utils/paginate');

// api/v1/books
exports.getBooks = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort;
    const select = req.query.select;

    ['select', 'sort', 'page', 'limit'].forEach(el => delete req.query[el]);

    // Pagination
    const pagination = await paginate(page, limit, Book);

        // Populate нь бүх категорийн мэдээллийг дүүргэж өгөхөд ашигладаг.
    const books = await Book.find(req.query, select).populate({
        path: 'category',
        select: 'name averagePrice'
    })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

        res.status(200).json({
            success: true,
            count: books.length,
            data: books,
            pagination        
        });
});


// api/v1/categories/:catId/books
exports.getCategoryBooks = asyncHandler(async (req, res, next) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const sort = req.query.sort;
    const select = req.query.select;
    ['select', 'sort', 'page', 'limit'].forEach(el => delete req.query[el]);

    // Pagination
    const pagination = await paginate(page, limit, Book);

    // req.query select
    const books = await Book.find({...req.query, category: req.params.categoryId}, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

        res.status(200).json({
            success: true,
            count: books.length,
            data: books,
            pagination,         
        });
});


exports.getBook = asyncHandler(async (req, res, next) => {
    const book = await Book.findById(req.params.id);


    if(!book) {
        throw new MyError(req.params.id + ' ийм ID-тай ном өгөгдлийн санд байхгүй байна🐱', 404);
    }
        res.status(200).json({
            success: true,
            data: book,       
        });
});

exports.createBook = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.body.category)
        if(!category){
            throw new MyError(req.params.id + ' ID-тай категори өгөгдлийн санд байхгүй',400);
        }

        req.body.createUser = req.userId;

        const book = await Book.create(req.body);

        res.status(200).json({
            success: true,
            data: book          
        });
});


exports.deleteBook = asyncHandler(async (req, res, next) => {
    const book = await Book.findById(req.params.id);

    if(!book) {
        throw new MyError(req.params.id + ' ийм ID-тай ном өгөгдлийн санд байхгүй байна🐱', 404);
    };

    if(book.createUser.toString() !== req.userId && req.userRole !== 'admin' ){
        throw new MyError('Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй...', 403);
    };

    const user = await User.findById(req.userId);

    book.remove();

        res.status(200).json({
            success: true,
            data: book,
            whoDeleted: user.name,         
        });
});

exports.updateBook = asyncHandler(async (req, res, next) => {
    

    const book = await Book.findById(req.params.id);

    if(!book){
        throw new MyError(req.params.id + ' ID-тай ном өгөгдлийн санд байхгүй',400);
    }

    if(book.createUser.toString() !== req.userId && req.userRole !== 'admin' ){
        throw new MyError('Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй...', 403);
    };

    req.body.updateUser = req.userId;

    for(let attr in req.body){
        book[attr] = req.body[attr]
    }

    book.save();

    res.status(200).json({
        success: true,
        data: book,
    });
});

// PUT: api/v1/books/:id/photo
exports.uploadBookPhoto = asyncHandler(async (req, res, next) => {
    const book = await Book.findById(req.params.id);

    if(!book){
        throw new MyError(req.params.id + ' ID-тай ном өгөгдлийн санд байхгүй',400);
    }

    // image upload

    const file = req.files.file;

    if(!file.mimetype.startsWith('image')){
        throw new MyError('Та зөвхөн зураг оруулах боломжтой 🐰',400);
    }

    if(file.size > process.env.MAX_UPLOAD_FILE_SIZE){
        throw new MyError('Таны зургийн хэмжээ их байна. 🐰',400);
    }

    file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, (err) => {

        if(err) {
            throw new MyError('Файлыг хуулах явцад алдаа гарлаа 🐰 Алдаа: ' + err.message,400);
        };

        book.photo = file.name;
        book.save();

        res.status(200).json({
            success: true,
            data: file.name,
        })
    });
});


// users root
exports.getUserBooks = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort;
    const select = req.query.select;
    ['select', 'sort', 'page', 'limit'].forEach(el => delete req.query[el]);

    // Pagination
    const pagination = await paginate(page, limit, Book);

    req.query.createUser = req.userId;

        // Populate нь бүх категорийн мэдээллийг дүүргэж өгөхөд ашигладаг.
    const books = await Book.find(req.query, select).populate({
        path: 'category',
        select: 'name averagePrice'
    })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

        res.status(200).json({
            success: true,
            count: books.length,
            data: books,
            pagination        
        });
});