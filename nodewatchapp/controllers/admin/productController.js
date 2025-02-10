const Product=require('../../models/productSchema')
const Category=require('../../models/categorySchema')
const User=require('../../models/userSchema')
const Brand=require("../../models/brandSchema")


const fs=require('fs')
const path=require('path')


const getProductAddPage=async(req,res)=>{
    try{
      const category=await Category.find({isListed:true})
      const brand=await Brand.find({isBlocked:false})
      const product=await Product.find({isBlocked:false})

      res.render("product-add",{
        cat:category,
        brand:brand,
        
    })

  




    }catch(error){
        res.redirect("/pageerror")
    }
}
const  addProduct =async(req,res)=>{
    try{
        const{productName,brand,description,regularPrice,salePrice,quantity,color,category}=req.body
        if (!req.files || req.files.length === 0) {
            return res.status(400).send("No images uploaded.");
        }



        const images=req.files.map(file=>`uploads/products/${file.filename}`)
        const newProduct=new Product({
            productName:productName,
            brand,
            description,
            regularPrice,
            salePrice,
            quantity,
            color,
            category,
            productImages:images
        })

        await newProduct.save()
        res.redirect("/admin/addproducts?success=product added successfully")


    }catch(error){
        console.log(error)
        res.status(500).send("Error adding product")

    }
}


const getAllproduct = async (req, res) => {
    try {
        const allProducts = await Product.find({quantity:{$lt:5}})
            .populate("category")
            .populate("brand")
            .exec();
     console.log("this is product:",allProducts)
        res.render("product-list", { products: allProducts });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error retrieving products");
    }
};

const blockProduct=async(req,res)=>{
    try {
        

        const {id} = req.params;
        const{isBlocked}=req.body
       
        if(!id){
            return res.status(400).json({success:false,message:"Product id is required"})
        }
        const product=await Product.findById(id)
        if(!product){
            return res.status(400).json({success:false,message:"Product not found"})
        }
        product.isBlocked=isBlocked
        await product.save()
        res.json({success:true,message:"product blocked successfully"})
    } catch (error) {
        console.error("error blocking product",error)
        res.status(500).json({success:false,message:"Internal Server error"})
    }
}


const getEditProduct=async(req,res)=>{
    try{
        const productId=req.params.id
        const product=await Product.findById(productId).populate("brand")
        const brands= await Brand.find()
        if(!product){
            return res.status(400).send("product not found")
        }
        console.log("Brands",brands)
         res.render('product-edit',{product,brands})
    }catch(error){
        console.error(error)
        res.status(500).send("Server error")
    }


}


module.exports={
    getProductAddPage,addProduct,getAllproduct,blockProduct,getEditProduct

}