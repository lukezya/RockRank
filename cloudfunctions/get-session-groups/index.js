const cloud = require('wx-server-sdk')

cloud.init({ env: 'ascendace-3g8ocnepa195e1cf' })
const db = cloud.database()

exports.main = async (event, context) => {
  const { event_id, session_id } = event
  const collection = db.collection(event_id)

  const getSessionsResult = await collection.doc('sessions').get()
  const { sessions } = getSessionsResult.data

  const session = sessions.find(session => session.session_id === session_id)
  const { groups } = session

  return {
    groups
  }
}