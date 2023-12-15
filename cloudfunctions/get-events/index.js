const cloud = require('wx-server-sdk')

cloud.init({ env: 'ascend-ace-3gds88z0338d88f2' })


exports.main = async (event, context) => {
  const db = cloud.database()
  const collection = db.collection('Events')

  const getEventsResult = await collection.limit(100).get()
  const events = getEventsResult.data

  return {
    events
  }
}