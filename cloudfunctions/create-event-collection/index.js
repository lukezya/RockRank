const cloud = require('wx-server-sdk')

cloud.init({
  env: 'ascend-ace-3gds88z0338d88f2'
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { name, location, start_date, end_date, logo_url, disciplines, categories, chief_judge, deputy_chief_judge, results_processing_judge } = event

  const addToEventsResults = await db.collection('Events').add({
    data: {
      name,
      location,
      start_date,
      end_date,
      logo_url
    }
  })

  const event_id = addToEventsResults._id
  const eventCreationResult = await db.createCollection(event_id)

  const collection = db.collection(event_id)
  const addEventInfoResult = await collection.add({
    data: {
      _id: 'event_info',
      name,
      location,
      start_date,
      end_date,
      logo_url,
      disciplines,
      categories,
      chief_judge,
      deputy_chief_judge,
      results_processing_judge,
    }
  })

  const addRouteSetsResult = await collection.add({
    data: {
      _id: 'route_sets',
      route_sets: []
    }
  })

  const addClimberGroupsResult = await collection.add({
    data: {
      _id: 'climber_groups',
      climber_groups: []
    }
  })

  const addSessionsResult = await collection.add({
    data: {
      _id: 'sessions',
      sessions: []
    }
  })

  return {
    outcome: 'success',
    event_id: addToEventsResults._id,
    addToEventsResults,
    eventCreationResult,
    addEventInfoResult,
    addRouteSetsResult,
    addClimberGroupsResult,
    addSessionsResult
  }
}