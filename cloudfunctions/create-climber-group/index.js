const cloud = require('wx-server-sdk')
cloud.init({
  env: 'ascendace-3g8ocnepa195e1cf'
})
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { event_id, category, discipline, round, climbers } = event

  // Create group_id document
  const collection = db.collection(event_id)
  const addGroupResult = await collection.add({
    data: {
      category,
      discipline,
      round,
      climbers
    }
  })

  // Update route_sets document
  const updateClimberGroupsResult = await collection.doc('climber_groups').update({
    data: {
      climber_groups: _.unshift([{
        group_id: addGroupResult._id,
        category,
        discipline,
        round,
      }])
    }
  })
  
  return {
    result: 'success',
    group_id: addGroupResult._id,
    addGroupResult,
    updateClimberGroupsResult
  }
}