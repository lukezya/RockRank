const cloud = require('wx-server-sdk');
const Renderer = require('xlsx-renderer')

cloud.init({ env: 'ascend-ace-3gds88z0338d88f2' });
const db = cloud.database()

exports.main = async (event, context) => {
  const { category, discipline, round, climbers, event_id } = event
  const fileID = "cloud://ascend-ace-3gds88z0338d88f2.6173-ascend-ace-3gds88z0338d88f2-1314089217/templates/出场表Template.xlsx";
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
