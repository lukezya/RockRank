const cloud = require('wx-server-sdk');
const Renderer = require('xlsx-renderer')

cloud.init({ env: 'ascend-ace-3gds88z0338d88f2' });
const db = cloud.database()

exports.main = async (event, context) => {
  const { category, discipline, round, filteredScores, event_id, session_id } = event
  const fileID = "cloud://ascend-ace-3gds88z0338d88f2.6173-ascend-ace-3gds88z0338d88f2-1314089217/templates/成绩单TemplateV2.xlsx";
  const downloadFileResult = await cloud.downloadFile({
    fileID: fileID
  });
  const templateFileBuffer = downloadFileResult.fileContent;

  const collection = db.collection(event_id)
  const eventInfo = await collection.doc('event_info').get()
  const { name, location } = eventInfo.data

  const session = await collection.doc(session_id).get()
  const { routes } = session.data
  const routesHeadings = routes.map((route) => ["线路", route.routeName]).flat()
  const routesSubheadings = Array.from(
    { length: routes.length * 2 },
    (_, index) => (index % 2 === 0 ? "AZ" : "AT")
  );

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;

  const viewModel = { 
    event_name: name,
    location,
    date: formattedDate,
    category,
    round,
    discipline,
    routes_headings: routesHeadings,
    routes_subheadings: routesSubheadings,
    climbers: filteredScores.map((score, index) => ({
      index: index + 1,
      climberNumber: score.climberNumber,
      climberName: score.climberName,
      total_tops: score.total_tops,
      total_zones: score.total_zones,
      top_attempts: score.total_attempts_to_top,
      zone_attempts: score.total_attempts_to_zone,
      score_record: routes.map((route) => {
        const routeName = route.routeName;
        const routeEntry = score.routes?.[routeName];
      
        if (routeEntry) {
          // Route exists in score.routes, add zoneOnAttempt and topOnAttempt
          return [routeEntry.zoneOnAttempt, routeEntry.topOnAttempt];
        } else {
          // Route doesn't exist, add two blank strings
          return ["", ""];
        }
      }).flat()
    }))
  };

  const renderer = new Renderer.Renderer();
  const result = await renderer.renderFromArrayBuffer(templateFileBuffer, viewModel);
  const fileContent = await result.xlsx.writeBuffer()
  return {
    fileContent: fileContent.toString('base64')
  };
};
