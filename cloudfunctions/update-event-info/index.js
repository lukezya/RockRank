const cloud = require('wx-server-sdk')

cloud.init({
  env: 'ascend-ace-3gds88z0338d88f2'
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { event_id, name, location, start_date, end_date, logo_url, disciplines, categories, chief_judge, deputy_chief_judge, route_judge, results_processing_judge } = event

  // Update Event Info in event_id collection.
  const eventIdCollection = db.collection(event_id)

  const updateEventInfoResult = await eventIdCollection.doc('event_info').update({
    data: {
      name,
      location,
      start_date,
      end_date,
      logo_url,
      disciplines,
      categories,
      chief_judge,
      deputy_chief_judge,
      route_judge,
      results_processing_judge
    }
  })

  const eventsCollection = db.collection('Events')
  const updateEventsResult = await eventsCollection.doc(event_id).update({
    data: {
      name,
      location,
      start_date,
      end_date,
      logo_url,
    }
  })

  return {
    result: 'success',
    updateEventInfoResult,
    updateEventsResult
  }
}