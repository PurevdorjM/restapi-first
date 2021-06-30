const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlleware/protect');



const { createComment, updateComment, deleteComment, getComment, getComments } = require('../controller/comments');
const { get } = require('./catergories');

// "/api/v1/comments
router.route('/').get(getComments).post(protect, authorize('admin', 'operator', 'user' ), createComment);


// "/api/v1/comments/:id
router.route('/:id').get(getComment).put(protect, authorize('admin', 'operator', 'user' ), updateComment).delete(protect, authorize('admin', 'operator', 'user' ), deleteComment);

module.exports = router;