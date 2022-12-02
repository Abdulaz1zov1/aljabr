const multer = require('multer')
const storage = multer.diskStorage({
    destination(req,file,cb){ cb(null,'images') },
    filename(req,file,cb){
        cb(null,new Date().toISOString().replace(/:/g, '-')+'_'+file.originalname)
    }
})
const arrTypes = ['image/jpg','image/png','image/jpeg','image/svg+xml','image/webp'] 
const fileFilter = (req, file, cb) => {
    if (arrTypes.includes(file.mimetype)){ cb(null,true)
    } else { cb(null,false) }
}
module.exports = multer({ storage, fileFilter })