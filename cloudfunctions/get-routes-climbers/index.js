const cloud = require('wx-server-sdk')

cloud.init({ env: 'ascend-ace-3gds88z0338d88f2' })
const db = cloud.database()

exports.main = async (event, context) => {
  const { event_id, session_id } = event
  const collection = db.collection(event_id)

  const session = await collection.doc(session_id).get()

  const { routes, climbers } = session.data

  return {
    routes,
    climbers
  }
}