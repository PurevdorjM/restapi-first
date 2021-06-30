const express = require('express');
const router = express.Router();
const { register, login, logout, getUsers, getUser, createUser, updateUser, deleteUser, forgotPassword, resetPassword } = require('../controller/users');
const { getUserBooks } = require('../controller/books');
const { getUserComments } = require('../controller/comments');
const { protect, authorize } = require('../middlleware/protect');


router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);

router.use(protect);

// '/api/v1/users/'
router.route('/').get(authorize('admin'), getUsers).post(authorize('admin', 'operator'), createUser);

router.route('/:id').get(authorize('admin'), getUser).put(authorize('admin'), updateUser).delete(authorize('admin'), deleteUser);

router.route('/:id/books').get(authorize('admin', 'operator', 'user'), getUserBooks);

router.route('/:id/comments').get(getUserComments);

module.exports = router;