import statusCode from '../../utils/statusCodes.js'
import { dbService } from '../../services/dbQueries.js'
import { generateToken } from '../../services/jwtservice.js'
import HttpStatus from '../../utils/statusCodes.js'


export const DailyExcelUpload = async (req,res)=>{

    try {
        if(!req.file) {
            return res.status(HttpStatus.BAD_REQUEST).json({success:false,message:'NO file uploaded'})
        }
        console.log('fileuploaded')
    } catch (error) {
        
    }
}

// export default fileUpload