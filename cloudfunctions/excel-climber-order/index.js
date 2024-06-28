const cloud = require('wx-server-sdk');
const Renderer = require('xlsx-renderer')

cloud.init({ env: 'ascendace-3g8ocnepa195e1cf' });
const db = cloud.database()

exports.main = async (event, context) => {
  const { category, discipline, round, climbers, event_id } = event
  const fileID = "cloud://ascendace-3g8ocnepa195e1cf.6173-ascendace-3g8ocnepa195e1cf-1314089217/templates/出场表Template.xlsx";
  const downloadFileResult = await cloud.downloadFile({
    fileID: fileID
  });
  const templateFileBuffer = downloadFileResult.fileContent;

  const collection = db.collection(event_id)
  const eventInfo = await collection.doc('event_info').get()
  const { name, location } = eventInfo.data

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;

  const viewModel = { 
    event_name: name,
    location,
    date: formattedDate,
    category,
    round,
    discipline,
    climbers: climbers.map((climber, index) => ({
      ...climber,
      index: index + 1,
    }))
  };

  const renderer = new Renderer.Renderer();
  const result = await renderer.renderFromArrayBuffer(templateFileBuffer, viewModel);
  const fileContent = await result.xlsx.writeBuffer()
  return {
    fileContent: fileContent.toString('base64')
  };
};
