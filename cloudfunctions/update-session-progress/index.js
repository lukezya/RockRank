const cloud = require('wx-server-sdk')

cloud.init({
  env: 'ascend-ace-3gds88z0338d88f2'
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { event_id, session_id } = event

  const collection = db.collection(event_id)

  // Update session status in sessions document.
  const sessionsResults = await collection.doc('sessions').get()
  const { sessions } = sessionsResults.data
  
  const session_index = sessions.findIndex(session => session.session_id === session_id)
  const updateEventInfoResult = await collection.doc('sessions').update({
    data: {
      [`sessions.${session_index}.status`]: 'Completed',
    },
  })

  return {
    result: 'success',
    session_index,
    updateEventInfoResult
  }
}