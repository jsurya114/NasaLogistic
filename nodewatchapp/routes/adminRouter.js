const express=require("express")
const router=express.Router()
const adminController=require("../controllers/admin/adminController")
const {adminAuth,userAuth}=require("../middlewares/auth")
const customerController=require("../controllers/admin/customerController")
const categoryController=require("../controllers/admin/categoryController")
const { upload, processImages } = require("../helpers/multer");

const brandController=require("../controllers/admin/brandController")
const productController=require("../controllers/admin/productController")

router.get("/pageerror",adminController.pageerror)
router.get("/login",adminController.loadLogin)
router.post("/login",adminController.login)
router.get("/",adminAuth,adminController.loadDashboard)
router.get("/logout",adminController.logout)


router.get("/users",adminAuth,customerController.customerInfo)
router.get("/blockCustomer",adminAuth,customerController.customerBlocked)
router.get("/unblockCustomer",adminAuth,customerController.customerunBlocked)


router.get("/category",adminAuth,categoryController.categoryInfo)
router.post("/addcategory",adminAuth,categoryController.addCategory)
router.get("/listCategory",adminAuth,categoryController.getListCategory)
router.get("/unlistCategory",adminAuth,categoryController.getUnlistCategory)
router.get("/editcategory",adminAuth,categoryController.geteditCategory)
router.post("/editCategory/:id",adminAuth,categoryController.editCategory)



router.get("/brands",adminAuth,brandController.getBrandPage)
router.post("/addbrand",adminAuth,upload.single("image"),processImages,brandController.addBrand)
router.get('/blockBrand',adminAuth,brandController.blockBrand)
router.get('/unblockBrand',adminAuth,brandController.unblockBrand)
router.get("/addProducts", adminAuth, productController.getProductAddPage);
router.post("/addProducts", adminAuth, upload.array("images", 4),processImages, productController.addProduct);
router.get("/products",adminAuth,productController.getAllproduct)
router.put("/blockProduct/:id",adminAuth,productController.blockProduct)
router.get("/editProduct/:id",adminAuth,productController.getEditProduct)


module.exports=router