const express = require('express');
const router = express.Router();
const airportController = require('./airportLogic');

// Routes for airports
router.get('/', airportController.getAllAirports);
router.post('/', airportController.createAirport);
router.get('/:id', airportController.getAirportById);
router.put('/:id', airportController.updateAirport);
router.delete('/:id', airportController.deleteAirport);

module.exports = router;
