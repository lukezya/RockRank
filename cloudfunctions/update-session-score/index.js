const cloud = require('wx-server-sdk')
cloud.init({
  env: 'ascend-ace-3gds88z0338d88f2'
})
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { event_id, session_id, climberNumber, routeName, attemptsMade, zoneOnAttempt, topOnAttempt, climberDNS } = event

  const collection = db.collection(event_id)
  const docName = session_id + '_scores'

  const getClimberScoreResult = await collection.doc(docName).get()
  const climbersResults = getClimberScoreResult.data
  const currentRouteResults = climbersResults[climberNumber].routes?.[routeName]

  if (currentRouteResults) {
    //the difference
    const initialAttemptsMade = currentRouteResults.attemptsMade
    const initialZoneOnAttempt = currentRouteResults.zoneOnAttempt
    const initialTopOnAttempt = currentRouteResults.topOnAttempt
    const initialClimberDNS = currentRouteResults.climberDNS
    console.log("currentRouteResults")
    console.log(currentRouteResults)

    const attemptsMadeDifference = attemptsMade - initialAttemptsMade
    const zoneOnAttemptDfiference = zoneOnAttempt - initialZoneOnAttempt
    const topOnAttemptDifference = topOnAttempt - initialTopOnAttempt

    //check if its valid
    if (attemptsMadeDifference <= 0 || (zoneOnAttemptDfiference !== 0 && zoneOnAttemptDfiference !== zoneOnAttempt) || (topOnAttemptDifference !== 0 && topOnAttemptDifference !== topOnAttempt) || (initialClimberDNS)) {
      return {
        result: 'unmatched_score'
      }
    }

    const routeResult = climberDNS
      ? 'DNS'
      : 'A' + attemptsMade + ' Z' + zoneOnAttempt + ' T' + topOnAttempt
    const incTotalZones = (zoneOnAttemptDfiference > 0) ? 1 : 0
    const incTotalTops = (topOnAttemptDifference > 0) ? 1 : 0

    const updateScoreResult = await collection.doc(docName).update({
      data: {
        [climberNumber]: {
          total_attempts: _.inc(attemptsMadeDifference),
          total_attempts_to_zone: _.inc(zoneOnAttemptDfiference),
          total_zones: _.inc(incTotalZones),
          total_attempts_to_top: _.inc(topOnAttemptDifference),
          total_tops: _.inc(incTotalTops),
          routes: {
            [routeName]: {
              attemptsMade,
              zoneOnAttempt,
              topOnAttempt,
              routeResult
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
      : 'A' + attemptsMade + ' Z' + zoneOnAttempt + ' T' + topOnAttempt

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
              attemptsMade,
              zoneOnAttempt,
              topOnAttempt,
              routeResult,
              climberDNS
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