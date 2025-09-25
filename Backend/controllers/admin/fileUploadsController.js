import statusCode from "../../utils/statusCodes.js";
import { dbService } from "../../services/admin/dbQueries.js";
import { generateToken } from "../../services/jwtservice.js";
import HttpStatus from "../../utils/statusCodes.js";
import XLSX from "xlsx";

const RouteObj = Object.freeze({
  "DFW 036-1": "36A",
  "DFW 041 A-1": "41A",
  "DFW 039-1": "39A",
  "DFW 037-1": "37A",
  "DFW 034-A-1": "34A",
  "DFW 041 B-1": "41B",
  "DFW 040-1": "40A",
  "DFW 035-1": "35A",
  "DFW 034 B-1": "34B",
  "DFW 038-1": "38A",
});
const sheetName = "dup";

export const DailyExcelUpload = async (req, res) => {
  try {
    // if(!req.file) {
    //     return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:'NO file uploaded'})
    // }
    // const fileName = req.file
    const fileData = {
      fieldname: "file",
      originalname: "dms_tmp_route_parcel_info_175306440034lsx",
      encoding: "7bit",
      mimetype:
        "application/vnd.openxmlformats-officedocum.spreadsheetml.sheet",
      destination: "uploads/",
      filename: "1758729143472.xlsx",
      path: "uploads\\1758729143472.xlsx",
      size: 250675,
    };
    console.log(fileData, "uploaded file data");

    console.log("fileuploaded");
    // const workbook = XLSX.readFile(req.file.path);
    const workbook = XLSX.readFile(fileData.path);
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return res.status(400).json({ error: "Sheet named ... not found" });
    }
    const rows = XLSX.utils.sheet_to_json(sheet);
    console.log(rows[0], rows[1], rows.length);
    const routes = rows.reduce((a, e) => {
      e["Route"] = e["Route"].slice(5);
      e["Route"] = RouteObj[e["Route"]];
      if (a[e["Route"]]) a[e["Route"]] += 1;
      else a[e["Route"]] = 1;
      return a;
    }, {});
    console.log(routes, "routes      ");

    function getSeqRange(seq) {
      const range = seq.split("-").map((val) => Number(val));
      return range;
    }

    const dashData = await dbService.getDashboardData();
    console.log(dashData, "dashData");
    let start,end
    dashData.forEach((val) => {
         [start,end] = [getSeqRange(val["sequence"]), val["sequence"]]
        return [start,end]
    });
    return res.status(statusCode.OK).json({ message: "code endeddd" });
  } catch (error) {}
};

// export default fileUpload
