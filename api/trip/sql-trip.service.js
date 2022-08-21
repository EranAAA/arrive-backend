const dbService = require('../../services/sql-db.service');
const axios = require('axios');
const { getSiriKey } = require('../../keys/siri-key');

async function query() {

   try {

      const queryStops = `
         SELECT stop_name 
         FROM gtfs_db.stops 
         WHERE stops >= 37290 AND stops <= 37396
         ORDER BY stop_name`

      const queryRouts = `
         SELECT * 
         FROM gtfs_db.routes 
         WHERE route_type = 2`

      const queryStopsTime = `
         SELECT *
         FROM gtfs_db.stop_times stop_times
            LEFT JOIN gtfs_db.trips trips ON
               trips.trip_id = stop_times.trip_id
            LEFT JOIN gtfs_db.stops stops ON
               stops.stops = stop_times.stop_id
            LEFT JOIN gtfs_db.routes routes ON
               routes.route_id = trips.route_id
         WHERE routes.route_type = 2 AND stops.stops >= 37290 
         -- AND stops.stops <= 37396 AND
         -- AND trips.trip_id = '1_34452'
         -- AND stop_times.stop_id = 37372 AND direction_id = 1 AND stop_times.stop_sequence = 1`

      const stops = dbService.runSQL(queryStops)
      const routs = dbService.runSQL(queryRouts)
      // const stopsTime = dbService.runSQL(queryStopsTime)
      const data = await Promise.all([stops, routs, /*stopsTime*/])
      return data

   } catch (err) {
      logger.error('cannot find trips', err)
      throw err
   }
}

async function search({ from, to, time }) {

   try {

      const querySearch = `
      SELECT f.*, a.stop_sequence as stop_sequence_a, a.arrival_time as arrival_time_a, stops.stop_name stop_name_a, first_train.arrival_time as first_train
      FROM
         (SELECT stop_times.trip_id, stops.stop_name, stop_times.arrival_time, stop_times.stop_sequence, stop_times.stop_id,
               stop_times.pickup_type, stop_times.drop_off_type, routes.route_id, routes.route_desc as train_no, routes.route_long_name, 
               trips.direction_id, stops.stop_code, concat(sunday, monday, tuesday, wednesday, thursday, friday, saturday) days 
         FROM gtfs_db.stop_times stop_times
            LEFT JOIN gtfs_db.trips trips ON
               trips.trip_id = stop_times.trip_id
            LEFT JOIN gtfs_db.calendar calendar ON
               trips.service_id = calendar.service_id
            LEFT JOIN gtfs_db.stops stops ON
               stops.stops = stop_times.stop_id
            LEFT JOIN gtfs_db.routes routes ON
               routes.route_id = trips.route_id
         WHERE routes.route_type = 2 AND stops.stops >= 37290 
         AND stops.stop_name = "${from}" AND stop_times.arrival_time >= TIME('${time}')) f
      
            LEFT JOIN gtfs_db.stop_times a ON
               a.trip_id = f.trip_id 
            LEFT JOIN gtfs_db.stops stops ON
               stops.stops = a.stop_id
            LEFT JOIN ( select trip_id, min(arrival_time)arrival_time from gtfs_db.stop_times s group by trip_id ) first_train ON
 		         first_train.trip_id = a.trip_id
              
      WHERE stops.stop_name = "${to}" AND ( a.stop_sequence * 1 ) > ( f.stop_sequence * 1 )
      ORDER BY f.arrival_time
      LIMIT 10 `

      const results = await dbService.runSQL(querySearch)
      // console.log(querySearch);
      // console.log(results);

      return results

   } catch (err) {
      logger.error('cannot find trips', err)
      throw err
   }
}

async function siri(data) {
   // console.log(data);
   let { stop, train_no, route_id, direction } = data
   const directionRef = direction === '1' ? 2 : direction === '0' ? 1 : direction === '0' ? 3 : direction
   const KEY = getSiriKey()
   const URL = `http://moran.mot.gov.il:110/Channels/HTTPChannel/SmQuery/2.8/json?Key=${KEY}&MonitoringRef=${stop}&PreviewInternal=PT1H#`
   // console.log(URL);

   try {
      const respone = await axios.get(URL);
      const data = respone.data
      const stopVisit = data.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit
      // console.log(stopVisit);

      return stopVisit.filter(stop =>
         stop.MonitoredVehicleJourney.LineRef == route_id &&
         stop.MonitoredVehicleJourney.PublishedLineName == train_no &&
         stop.MonitoredVehicleJourney.DirectionRef == (directionRef))

   } catch (err) {
      console.log('cant get live data!')
      throw err
   }
}

async function getTripById(tripId) {
   try {
      const query = `select * from trip where _id = ${tripId}`
      const trips = await dbService.runSQL(query);
      return trips[0]
   } catch (err) {
      logger.error(`while finding user ${tripId}`, err)
      throw err
   }
}

async function remove(tripId) {
   try {
      const query = `delete from trip where trip._id = ${tripId}`
      return await dbService.runSQL(query)
   } catch (err) {
      logger.error(`cannot remove trip ${tripId}`, err)
      throw err
   }
}

async function performTrip(trip) {
   try {
      console.log(trip)
      trip.status = "Running";
      await update(trip);
      await execute(trip);
      trip.doneAt = Date.now();
      trip.status = 'Done';
   }
   catch (error) {
      trip.status = "Fail";
      trip.errors = trip.errors ? [trip.errors, error] : [error];
      throw error;
   } finally {
      trip.triesCount += 1;
      trip.lastTriedAt = Date.now();
      await update(trip);
      return trip;
   }
}

async function add(trip) {
   try {
      trip._id = gCurrId++
      trip.triesCount = 0
      trip.status = ''
      trip.errors = ''
      trip.lastTriedAt = null
      trip.doneAt = null
      const query = `
            insert into trip (title,importance,
            triesCount,status,errors,lastTriedAt,doneAt) 
            values("${trip.title}","${trip.importance}",
                "${trip.triesCount}","${trip.status}","${trip.errors}",
                "${trip.lastTriedAt}","${trip.doneAt}")`
      const savedTrip = await dbService.runSQL(query)
      return savedTrip
   } catch (err) {
      logger?.error('cannot insert trip', err)
      throw err
   }
}

async function update(trip) {
   try {
      trip = trip[0] ? trip[0] : trip
      console.log(trip.status, 'status')
      const query = `
        update trip set triesCount="${trip.triesCount}"
        ,status="${trip.status}",errors="${trip.errors}"
        ,lastTriedAt="${trip.lastTriedAt}",doneAt="${trip.doneAt}"
         where _id=${trip._id}`
      const currTrip = await dbService.runSQL(query)
      gCb({ type: 'update_trip', data: trip })
      return currTrip
   } catch (err) {
      console.error(err)
      throw err
   }
}

function setCb(cb) {
   gCb = cb
}

async function getNextTrip() {
   const query = `select * from trip where status in ("","Fail","New","Running")`
   const trips = await dbService.runSQL(query)
   const trip = trips[0]
   if (trip?.status === 'Running' && trip?.lastTriedAt + 2000 < Date.now()) await update({ ...trip, status: 'Failed' })
   return trip;
}

function setIsWorkeron(bool) {
   isWorkerOn = bool;
   runWorker();
}

function execute() {
   return new Promise((resolve, reject) => {
      setTimeout(() => {
         const randomNum = Math.random();
         if (randomNum > 0.5) resolve(parseInt(Math.random() * 100))
         // TODO: throw some more random errors like in the image above
         else if (randomNum > 0.4) reject('High Temparture');
         else if (randomNum > 0.3) reject('To much for me ');
         else if (randomNum > 0.2) reject('Shit shit shit');
         else if (randomNum > 0.1) reject('another error');
      }, 2000)
   })
}

async function runWorker() {
   if (!isWorkerOn) return;
   console.log('worker is Running')
   var delay = 2000;
   try {
      const trip = await getNextTrip();
      if (trip) {
         try {
            await performTrip(trip)
         } catch (err) {
            console.log(`Failed Trip`, err)
         } finally {
            delay = 1
         }
      } else {
         console.log('Snoozing... Next trip is Done !')
      }
   } catch (err) {
      console.log(`Failed getting next trip to execute`, err)
   } finally {
      setTimeout(() => {
         runWorker()
      }, delay)
   }
}

module.exports = {
   query,
   search,
   siri,
   remove,
   update,
   add,
   getTripById,
   performTrip,
   getNextTrip,
   setIsWorkeron,
   setCb
}


