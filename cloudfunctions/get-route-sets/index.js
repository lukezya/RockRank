// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'ascend-ace-3gds88z0338d88f2' }) // 使用当前云环境

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { event_id } = event
  const collection = db.collection(event_id)

  const routeSets = await collection.doc('route_sets').get()

  const { route_sets } = routeSets.data

  return {
    route_sets
  }
}