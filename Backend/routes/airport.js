const express = require('express');
const router = express.Router();
const airportController = require('./airportLogic');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles');

// Routes for airports with Authen and Autor
// router.get('/', authenticateToken, airportController.getAllAirports);
// router.post('/', authenticateToken, authorizeRoles('hr'), airportController.createAirport);
// router.get('/:id', authenticateToken, airportController.getAirportById);
// router.put('/:id', authenticateToken, authorizeRoles('hr'), airportController.updateAirport);
// router.delete('/:id', authenticateToken, authorizeRoles('hr'), airportController.deleteAirport);

// Routes for airports 
router.get('/',  airportController.getAllAirports);
router.post('/',  airportController.createAirport);
router.get('/:id',  airportController.getAirportById);
router.put('/:id',  airportController.updateAirport);
router.delete('/:id',  airportController.deleteAirport);

module.exports = router;
