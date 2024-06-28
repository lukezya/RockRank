const cloud = require('wx-server-sdk')

cloud.init({ env: 'ascendace-3g8ocnepa195e1cf' }) 
const db = cloud.database()


exports.main = async (event, context) => {
  const { event_id, set_id } = event

  const collection = db.collection(event_id)
  const setInfo = await collection.doc(set_id).get()

  const { set_name, discipline, routes } = setInfo.data

  return {
    set_name,
    discipline,
    routes
  }
}