const cloud = require('wx-server-sdk')
cloud.init({
  env: 'ascend-ace-3gds88z0338d88f2'
})
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { event_id, session_id, updateRouteData, routeName, climberNumber } = event

  const collection = db.collection(event_id)
  const docName = session_id + '_scores'

  const getClimberScoreResult = await collection.doc(docName).get()
  const climbersResults = getClimberScoreResult.data
  const currentRouteResults = climbersResults[climberNumber].routes[routeName]
  
  const incTotalAttempts = updateRouteData.attemptsMade - currentRouteResults.attemptsMade
  const incTotalAttemptsToZone = updateRouteData.zoneOnAttempt - currentRouteResults.zoneOnAttempt
  const incTotalAttemptsToTop = updateRouteData.topOnAttempt - currentRouteResults.topOnAttempt
  const incTotalZones = (updateRouteData.zoneOnAttempt > 0 ? 1 : 0) - (currentRouteResults.zoneOnAttempt > 0 ? 1 : 0)
  const incTotalTops = (updateRouteData.topOnAttempt > 0 ? 1 : 0) - (currentRouteResults.topOnAttempt > 0 ? 1 : 0)

  const updateRouteScoreResult = await collection.doc(docName).update({
    data: {
      [climberNumber]: {
        total_attempts: _.inc(incTotalAttempts),
        total_attempts_to_zone: _.inc(incTotalAttemptsToZone),
        total_zones: _.inc(incTotalZones),
        total_attempts_to_top: _.inc(incTotalAttemptsToTop),
        total_tops: _.inc(incTotalTops),
        routes: {
          [routeName]: updateRouteData
        }
      }
    }
  })

  return {
    incTotalAttemptsToZone,
    incTotalAttemptsToTop,
    incTotalZones,
    incTotalTops
  }
}
