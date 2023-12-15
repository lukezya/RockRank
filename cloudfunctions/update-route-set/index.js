const cloud = require('wx-server-sdk')
cloud.init({
  env: 'ascend-ace-3gds88z0338d88f2'
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { event_id, set_id, set_name, discipline, routes } = event

  const collection = db.collection(event_id)

  // Update route_sets document in event_id collection
  const routeSetsResults = await collection.doc('route_sets').get()
  const { route_sets } = routeSetsResults.data

  const set_index = route_sets.findIndex(set => set.set_id === set_id)
  const updateRouteSetsResult = await collection.doc('route_sets').update({
    data: {
      [`route_sets.${set_index}`]: {
        set_name: set_name,
        discipline: discipline
      }
    }
  })
  
  // Update set_id document
  const updateSetResult = await collection.doc(set_id).update({
    data: {
      set_name,
      discipline,
      routes
    }
  })

  
  return {
    result: 'success',
    updatedIndex: set_index,
    updateRouteSetsResult,
    updateSetResult
  }
}