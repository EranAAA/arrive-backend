const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getTrips, getBySearch, getSiriData, addTrip, updateTrip, deleteTrip } = require('./trip.controller')
const router = express.Router()

router.get('/', log, getTrips)
router.get('/search', getBySearch)
router.get('/siri', getSiriData)
router.post('/', /*requireAuth, requireAdmin,*/ addTrip)
router.put('/:tripId', /*requireAuth, requireAdmin,*/ updateTrip)
router.delete('/:tripId', /*requireAuth, requireAdmin,*/ deleteTrip)

module.exports = router
