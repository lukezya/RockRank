const cloud = require('wx-server-sdk')
cloud.init({
  env: 'ascendace-3g8ocnepa195e1cf'
})
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { event_id, setName, discipline, routes } = event

  // Create set_id document
  const collection = db.collection(event_id)
  const addSetResult = await collection.add({
    data: {
      set_name: setName,
      discipline: discipline,
      routes: routes
    }
  })

  // Update route_sets document
  const updateRouteSetsResult = await collection.doc('route_sets').update({
    data: {
      route_sets: _.unshift([{
        set_id: addSetResult._id,
        set_name: setName,
        discipline: discipline
      }])
    }
  })
  
  return {
    result: 'success',
    set_id: addSetResult._id,
    addSetResult,
    updateRouteSetsResult
  }
}