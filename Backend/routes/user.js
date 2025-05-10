const express = require('express');
const router = express.Router();
const userController = require('./userLogic');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles');


// Routes for users
// router.get('/', authenticateToken, authorizeRoles('hr'),userController.getAllUsers);
// router.post('/', authenticateToken, authorizeRoles('hr'), userController.createUser);
// router.get('/:id', authenticateToken, userController.getUserById);
// router.put('/:id', authenticateToken, authorizeRoles('hr'), userController.updateUser);
// router.delete('/:id', authenticateToken, authorizeRoles('hr'),userController.deleteUser);

// Routes for users
router.get('/', userController.getAllUsers);
router.post('/',  userController.createUser);
router.get('/:id',  userController.getUserById);
router.put('/:id',  userController.updateUser);
router.delete('/:id', userController.deleteUser);



module.exports = router;
