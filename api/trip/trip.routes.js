const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getTrips, getById, addTrip, updateTrip, deleteTrip } = require('./trip.controller')
const router = express.Router()

router.get('/', log, getTrips)
router.get('/:tripId', getById)
router.post('/', /*requireAuth, requireAdmin,*/ addTrip)
router.put('/:tripId', /*requireAuth, requireAdmin,*/ updateTrip)
router.delete('/:tripId', /*requireAuth, requireAdmin,*/ deleteTrip)

module.exports = router
