const cloud = require('wx-server-sdk')

cloud.init({ env: 'ascendace-3g8ocnepa195e1cf' })
const db = cloud.database()

exports.main = async (event, context) => {
  const { event_id } = event
  const collection = db.collection(event_id)

  const sessionsResult = await collection.doc('sessions').get()

  const { sessions } = sessionsResult.data

  return {
    sessions
  }
}