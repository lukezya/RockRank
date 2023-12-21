const cloud = require('wx-server-sdk')
cloud.init({
  env: 'ascend-ace-3gds88z0338d88f2'
})
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { event_id, session_id, climberNumber, routeName, routeIndex, attemptsMade, zoneOnAttempt, topOnAttempt, climberDNS, undoStack } = event

  const collection = db.collection(event_id)
  const docName = session_id + '_scores'

  const getClimberScoreResult = await collection.doc(docName).get()
  const climbersResults = getClimberScoreResult.data
  const currentRouteResults = climbersResults[climberNumber].routes?.[routeName]

  if (currentRouteResults) {
    const incTotalAttempts = attemptsMade - currentRouteResults.attemptsMade
    const incTotalAttemptsToZone = zoneOnAttempt - currentRouteResults.zoneOnAttempt
    const incTotalAttemptsToTop = topOnAttempt - currentRouteResults.topOnAttempt
    const incTotalZones = (zoneOnAttempt > 0 ? 1 : 0) - (currentRouteResults.zoneOnAttempt > 0 ? 1 : 0)
    const incTotalTops = (topOnAttempt > 0 ? 1 : 0) - (currentRouteResults.topOnAttempt > 0 ? 1 : 0)
    const routeResult = climberDNS
      ? 'DNS'
      : 'A' + attemptsMade + ' AZ' + zoneOnAttempt + ' AT' + topOnAttempt

    const updateScoreResult = await collection.doc(docName).update({
      data: {
        [climberNumber]: {
          total_attempts: _.inc(incTotalAttempts),
          total_attempts_to_zone: _.inc(incTotalAttemptsToZone),
          total_zones: _.inc(incTotalZones),
          total_attempts_to_top: _.inc(incTotalAttemptsToTop),
          total_tops: _.inc(incTotalTops),
          routes: {
            [routeName]: {
              routeIndex,
              attemptsMade,
              zoneOnAttempt,
              topOnAttempt,
              routeResult,
              climberDNS,
              undoStack
            }
          }
        }
      }
    })

    return {
      result: 'success',
      updateScoreResult
    }
  } else {
    //new score
    const incTotalZones = (zoneOnAttempt > 0) ? 1 : 0
    const incTotalTops = (topOnAttempt > 0) ? 1 : 0
    const routeResult = climberDNS
      ? 'DNS'
      : 'A' + attemptsMade + ' AZ' + zoneOnAttempt + ' AT' + topOnAttempt

    const updateScoreResult = await collection.doc(docName).update({
      data: {
        [climberNumber]: {
          total_attempts: _.inc(attemptsMade),
          total_attempts_to_zone: _.inc(zoneOnAttempt),
          total_zones: _.inc(incTotalZones),
          total_attempts_to_top: _.inc(topOnAttempt),
          total_tops: _.inc(incTotalTops),
          routes: {
            [routeName]: {
              routeIndex,
              attemptsMade,
              zoneOnAttempt,
              topOnAttempt,
              routeResult,
              climberDNS,
              undoStack
            }
          }
        }
      }
    })

    return {
      result: 'success',
      updateScoreResult
    }
  }
}