const express = require('express');
const router = express.Router();
const { getCategories, getCategy, createCategy, deleteCategy, updateCategy, uploadCategoryPhoto } = require('../controller/categories');
const { protect, authorize } = require('../middlleware/protect');


// "/api/v1/categories/:id/books
const { getCategoryBooks } = require('../controller/books');
router.route('/:categoryId/books').get(getCategoryBooks);

// "/api/v1/categories
router.route('/').get(getCategories).post(protect, authorize('admin'), createCategy);

router.route('/:id').get(getCategy).put(protect, authorize('admin', 'operator'), updateCategy).delete(protect, authorize('admin'), deleteCategy);

router.route('/:id/upload-photo').put(protect, authorize('admin', 'operator'), uploadCategoryPhoto);

module.exports = router;