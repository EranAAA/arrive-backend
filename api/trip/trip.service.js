const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
   try {
      const criteria = _buildCriteria(filterBy)
      const criteriaSort = _buildCriteriaSort(filterBy)
      const collection = await dbService.getCollection('trip')

      console.log('query', collection);

      var trips = await collection.find(criteria).sort(criteriaSort).toArray()
      return trips
   } catch (err) {
      logger.error('cannot find trips', err)
      throw err
   }
}

async function getById(tripId) {

   try {
      const collection = await dbService.getCollection('trip')
      const trip = collection.findOne({ _id: ObjectId(tripId) })
      // const trip = collection.findOne({ _id: (tripId) })
      // console.log('trip', trip);
      return trip
   } catch (err) {
      logger.error(`while finding trip ${tripId}`, err)
      throw err
   }
}

async function remove(tripId) {
   try {
      const collection = await dbService.getCollection('trip')
      await collection.deleteOne({ _id: ObjectId(tripId) })
      return tripId
   } catch (err) {
      logger.error(`cannot remove trip ${tripId}`, err)
      throw err
   }
}

async function add(trip) {
   try {
      const collection = await dbService.getCollection('trip')
      const addedTrip = await collection.insertOne(trip)
      return addedTrip.ops[0]
   } catch (err) {
      logger.error('cannot insert trip', err)
      throw err
   }
}

async function update(trip) {
   try {
      var id = ObjectId(trip._id)
      delete trip._id
      const collection = await dbService.getCollection('trip')
      await collection.updateOne({ _id: id }, { $set: { ...trip } })
      return trip
   } catch (err) {
      logger.error(`cannot update trip ${tripId}`, err)
      throw err
   }
}

function _buildCriteria(filterBy) {

   const criteria = {}
   const selectedOption = filterBy.selectedOption ? filterBy.selectedOption.map(({ value, ...rest }) => value) : []

   if (filterBy.name) {
      criteria.name = { $regex: filterBy.name, $options: 'i' }
   }

   if (filterBy.stock || filterBy.stock === false) {
      criteria.inStock = filterBy.stock
   }

   // if (filterBy.selectedOption) {
   //    criteria.labels = { selectedOption }
   // }

   // console.log('criteria', criteria);
   console.log('filterBy', filterBy);

   return criteria
}

function _buildCriteriaSort(filterBy) {

   const criteria = {}

   if (filterBy.sort === 'Higher') {
      criteria.price = -1
   }

   if (filterBy.sort === 'Lower') {
      criteria.price = 1
   }

   if (filterBy.sort === 'Newest') {
      criteria.createdAt = -1
   }

   if (filterBy.sort === 'Oldest') {
      criteria.createdAt = 1
   }

   if (!Object.keys(criteria).length) {
      criteria.createdAt = -1
   }

   //console.log('criteriaSort', criteria);

   return criteria
}

module.exports = {
   remove,
   query,
   getById,
   add,
   update,
}