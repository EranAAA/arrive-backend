const logger = require('../../services/logger.service');
const tripService = require('./sql-trip.service');
// const tripService = require('./trip.service');

async function getTrips(req, res) {
    try {
        const trips = await tripService.query(req.query);
        res.send(trips)
    } catch (err) {
        logger.error('Cannot get trips', err)
        res.status(500).send({ err: 'Failed to get trips' })
    }
}

async function updateTrip(req, res) {
    try {
        let trip = req.body
        trip = await tripService.update(trip)
        res.send(trip)
    } catch (err) {
        logger.error('Failed to Updatee trip', err)
        res.status(500).send({ err: 'Failed to delete trip' })
    }
}

async function deleteTrip(req, res) {
    try {
        await tripService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete trip', err)
        res.status(500).send({ err: 'Failed to delete trip' })
    }
}

async function getById(req, res) {
    try {
        const trip = await tripService.getTripById(req.params.id)
        res.send(trip)
    } catch (err) {
        logger.error('Failed to delete trip', err)
        res.status(500).send({ err: 'Failed to delete trip' })
    }
}

async function runTrip(req, res) {
    try {
        const trip = await tripService.getTripById(req.params.id);
        await tripService.performTrip(trip);
        res.send(trip)
    } catch (err) {
        logger.error('Failed to perform trip', err)
        res.status(500).send({ err: 'Failed to perform trip' })
    }
}

async function startRunningWorker(req, res) {
    try {
        const trip = await tripService.getTripById(req.params.id);
        await tripService.performTrip(trip);
        res.send(trip)
    } catch (err) {
        logger.error('Failed to perform trip', err)
        res.status(500).send({ err: 'Failed to perform trip' })
    }
}

async function addTrip(req, res) {
    try {
        var trip = req.body
        // trip.byUserId = req.session.trip._id
        trip = await tripService.add(trip)

        res.send(trip)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add trip', err)
        res.status(500).send({ err: 'Failed to add trip' })
    }
}

module.exports = {
    getTrips,
    deleteTrip,
    addTrip,
    getById,
    updateTrip,
    runTrip,
    startRunningWorker
}