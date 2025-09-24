import statusCode from '../../utils/statusCodes.js'
import { dbService } from '../../services/admin/dbQueries.js'
import { generateToken } from '../../services/jwtservice.js'
import HttpStatus from '../../utils/statusCodes.js'
import  XLSX from 'xlsx'

const RouteObj = Object.freeze({
  'DFW 036-1': '36A',
  'DFW 041 A-1': '41A',
  'DFW 039-1': '39A',
  'DFW 037-1': '37A',
  'DFW 034-A-1': '34A',
  'DFW 041 B-1': '41B',
  'DFW 040-1': '40A',
  'DFW 035-1': '35A',
  'DFW 034 B-1': '34B',
  'DFW 038-1': '38A'
})

export const DailyExcelUpload = async (req,res)=>{

    try {
        if(!req.file) {
            return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:'NO file uploaded'})
        }
        const fileName = req.file
        console.log(fileName,'uploaded file data')

        console.log('fileuploaded')
        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets["dup"];
         if (!sheet) {
            return res.status(400).json({ error: 'Sheet named dup not found' });
        }
        const rows = XLSX.utils.sheet_to_json(sheet);
        console.log(rows[0],rows[1],rows.length)
        const routes = rows.reduce((a,e)=>{
            e['Route'] = e['Route'].slice(5)
            e['Route'] = RouteObj[e['Route']]
            if(a[e['Route']])a[e['Route']] +=1
            else a[e['Route']] =1
            return a
        },{})
        console.log(routes,'routes      ')
        function extractRouteCode(fullRoute){
            const len = fullRoute.length
            let str = fullRoute.slice()
        }
    } catch (error) {
        
    }
}

// export default fileUpload