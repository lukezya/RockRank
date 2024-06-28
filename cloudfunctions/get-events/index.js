const cloud = require('wx-server-sdk')

cloud.init({ env: 'ascendace-3g8ocnepa195e1cf' })


exports.main = async (event, context) => {
  const db = cloud.database()
  const collection = db.collection('Events')

  const getEventsResult = await collection.limit(100).get()
  const events = getEventsResult.data

  return {
    events
  }
}