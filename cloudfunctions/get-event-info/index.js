const cloud = require('wx-server-sdk')

cloud.init({ env: 'ascend-ace-3gds88z0338d88f2' })
const db = cloud.database()

exports.main = async (event, context) => {
  const { event_id } = event

  const collection = db.collection(event_id)
  const eventInfo = await collection.doc('event_info').get()

  const { name, location, start_date, end_date, logo_url, disciplines, categories } = eventInfo.data

  return {
    name,
    location,
    start_date,
    end_date,
    logo_url,
    disciplines,
    categories
  }
}