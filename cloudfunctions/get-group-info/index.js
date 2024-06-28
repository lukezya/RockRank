const cloud = require('wx-server-sdk')

cloud.init({ env: 'ascendace-3g8ocnepa195e1cf' }) 
const db = cloud.database()


exports.main = async (event, context) => {
  const { event_id, group_id } = event

  const collection = db.collection(event_id)
  const groupInfo = await collection.doc(group_id).get()

  const { category, discipline, round, climbers } = groupInfo.data

  return {
    category,
    discipline,
    round,
    climbers
  }
}
