const cloud = require('wx-server-sdk')

cloud.init({ env: 'ascendace-3g8ocnepa195e1cf' })
const db = cloud.database()

exports.main = async (event, context) => {
  const { event_id, session_id } = event
  const collection = db.collection(event_id)

  const getScoresResult = await collection.doc(session_id + '_scores').get()

  const { _id, ...scores } = getScoresResult.data

  return {
    scores
  }
}