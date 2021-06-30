const Category = require('../models/Category');
const path = require('path');
const MyError =  require('../utils/myError');
const asyncHandler = require('../middlleware/asyncHandler');
const paginate = require('../utils/paginate');

exports.getCategories = asyncHandler(async (req, res, next) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort;
    const select = req.query.select;
    ['select', 'sort', 'page', 'limit'].forEach(el => delete req.query[el]);

    // Pagination
    const pagination = await paginate(page, limit, Category);
    
        const category = await Category.find(req.query, select)
        .sort(sort)
        .skip(pagination.start - 1)
        .limit(limit);

        res.status(200).json({
            success: true,
            data: category, 
            pagination,          
        });
});


exports.getCategy = asyncHandler(async (req, res, next) => {

    req.db.teacher.create({
        id: 3,
        name: 'Сараа',
        phone: '99667788',
        password: '123123',
    });
    req.db.course.create({
        id: 2,
        name: 'NodeJS хичээл',
        price: '32000',
        tailbar: 'Программчлалын хичээл',
    });


        const category = await Category.findById(req.params.id).populate('books');
        if(!category){
            throw new MyError(req.params.id + ' ID-тай категори өгөгдлийн санд байхгүй',400);
        }

        res.status(200).json({
            success: true,
            data: category,
        });
})

exports.createCategy = asyncHandler(async (req, res, next) => {

        const category = await Category.create(req.body);

        res.status(200).json({
            success: true,
            data: category,
        });
})

exports.updateCategy = asyncHandler(async (req, res, next) => {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if(!category){
            throw new MyError(req.params.id + ' ID-тай категори өгөгдлийн санд байхгүй',400);
        }

        res.status(200).json({
            success: true,
            data: category,
        });
})

exports.deleteCategy = asyncHandler(async(req, res, next) => {  
        const category = await Category.findById(req.params.id);

        if(!category){
            throw new MyError(req.params.id + ' ID-тай категори өгөгдлийн санд байхгүй',400);
        }

        category.remove();

        res.status(200).json({
            success: true,
            data: category,
        });
})


// PUT: api/v1/categories/:id/photo
exports.uploadCategoryPhoto = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if(!category){
        throw new MyError(req.params.id + ' ID-тай катенори өгөгдлийн санд байхгүй',400);
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

        category.photo = file.name;
        category.save();

        res.status(200).json({
            success: true,
            data: file.name,
        })
    });
})