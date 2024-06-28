const cloud = require('wx-server-sdk')
cloud.init({
  env: 'ascendace-3g8ocnepa195e1cf'
})
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { event_id, discipline, routeSet, selectedClimberGroups } = event
  const collection = db.collection(event_id)

  // Create session_id document

  // Get routes.
  const { set_id } = routeSet
  const routeSetDoc = await collection.doc(set_id).get()
  const { routes } = routeSetDoc.data
  
  // Get climbers from groups.
  const groupIds = selectedClimberGroups.map(climberGroup => climberGroup.group_id)

  const fetchAndFormatClimbers = async (groupId) => {
    const climberGroup = await collection.doc(groupId).get()
    const { category, round, climbers } = climberGroup.data
    
    return climbers.map(climber => ({
      climberNumber: climber.climberNumber,
      climberName: climber.climberName,
      group_id: groupId,
      discipline,
      category,
      round,
    }));
  };
  
  const promisedClimbers = await Promise.all(groupIds.map(groupId => fetchAndFormatClimbers(groupId)));
  
  const allSessionClimbers = [].concat(...promisedClimbers);

  const addSessionResult = await collection.add({
    data: {
      route_set: routeSet,
      routes,
      climbers: allSessionClimbers
    }
  })

  // Update sessions document
  const updateSessionsResult = await collection.doc('sessions').update({
    data: {
      sessions: _.unshift([{
        session_id: addSessionResult._id,
        discipline: discipline,
        groups: selectedClimberGroups,
        status: 'Open'
      }])
    }
  })

  // Create session_id_scores document.
  const scores_document_name = addSessionResult._id + '_scores'
  const scores_data = allSessionClimbers.reduce((acc, climber) => {
    acc[climber.climberNumber] = {
      ...climber, // Use the spread operator to include all properties of climber
      total_tops: 0,
      total_zones: 0,
      total_attempts_to_top: 0,
      total_attempts_to_zone: 0
    };
    return acc;
  }, {});

  scores_data._id = scores_document_name

  const addSessionScoresResult = await collection.add({
    data: scores_data
  })
  
  return {
    result: 'success',
    session_id: addSessionResult._id,
    addSessionResult,
    updateSessionsResult,
    addSessionScoresResult
  }
}