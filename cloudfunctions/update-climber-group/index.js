const cloud = require('wx-server-sdk')
cloud.init({
  env: 'ascendace-3g8ocnepa195e1cf'
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { event_id, group_id, category, discipline, round, climbers } = event
  const collection = db.collection(event_id)

  // Update route_sets document in event_id collection
  const climberGroupsResults = await collection.doc('climber_groups').get()
  const { climber_groups } = climberGroupsResults.data

  const group_index = climber_groups.findIndex(climberGroup => climberGroup.group_id === group_id)
  const updateClimberGroupsResult = await collection.doc('climber_groups').update({
    data: {
      [`climber_groups.${group_index}`]: {
        discipline,
        category,
        round
      }
    }
  })
  
  // Update set_id document
  const updateGroupResult = await collection.doc(group_id).update({
    data: {
      category,
      discipline,
      round,
      climbers
    }
  })

  
  return {
    result: 'success',
    updatedIndex: group_index,
    updateClimberGroupsResult,
    updateGroupResult
  }
}