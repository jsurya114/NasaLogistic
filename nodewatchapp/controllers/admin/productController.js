const Product=require('../../models/productSchema')
const Category=require('../../models/categorySchema')
const User=require('../../models/userSchema')
const Brand=require("../../models/brandSchema")
const mongoose=require('mongoose')

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
        const product=await Product.findById(productId).populate("brand").populate("category")
        const brands= await Brand.find()
        const categories=await Category.find()
        if(!product){
            return res.status(400).send("product not found")
        }
        console.log("Brands",brands)
         res.render('product-edit',{product,brands,categories})
    }catch(error){
        console.error(error)
        res.status(500).send("Server error")
    }


}
const validateProductData = (data) => {
    const errors = [];
    
    if (!data.productName?.trim()) {
        errors.push('Product name is required');
    }
    
    if (!mongoose.Types.ObjectId.isValid(data.category)) {
        errors.push('Invalid category selected');
    }
    
    if (!data.descriptionData?.trim()) {
        errors.push('Description is required');
    }
    
    if (isNaN(data.regularPrice) || data.regularPrice <= 0) {
        errors.push('Regular price must be a positive number');
    }
    
    if (data.salePrice && (isNaN(data.salePrice) || data.salePrice <= 0)) {
        errors.push('Sale price must be a positive number');
    }
    
    if (isNaN(data.quantity) || data.quantity < 0) {
        errors.push('Quantity must be a non-negative number');
    }
    
    return errors;
};

// Image handling helper
const handleImageUpdates = async (existingImages, newFiles, uploadsDir) => {
    let updatedImages = [...existingImages];
    
    if (!newFiles || newFiles.length === 0) return updatedImages;
    
    for (const file of newFiles) {
        const imageIndex = parseInt(file.fieldname.replace('images', '')) - 1;
        
        // Remove old image if it exists
        if (updatedImages[imageIndex]) {
            const oldImagePath = path.join(uploadsDir, updatedImages[imageIndex]);
            try {
                await fs.access(oldImagePath);
                await fs.unlink(oldImagePath);
            } catch (error) {
                console.warn(`Warning: Could not delete old image at ${oldImagePath}:`, error.message);
            }
        }
        
        // Update with new image path
        updatedImages[imageIndex] = `uploads/products/${file.filename}`;
    }
    
    return updatedImages;
};


const submittProduct = async (req, res) => {
    try {
        const {
            productName,
            brand,
            category,
            descriptionData,
            regularPrice,
            salePrice,
            quantity,
            color
        } = req.body;

        // Validate input data
        const validationErrors = validateProductData({
            productName,
            category,
            descriptionData,
            regularPrice,
            salePrice,
            quantity
        });

        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                errors: validationErrors
            });
        }

        // Get existing product
        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        // Handle image replacement
        let updatedImages = [...existingProduct.productImages]; // Keep existing images

        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                const fieldName = file.fieldname.replace(/\D/g, ''); // Extract index from fieldname (e.g., images1 -> 1)

                if (updatedImages[fieldName - 1]) {
                    // Delete old image file
                    const oldImagePath = path.join(__dirname, '../../public/', updatedImages[fieldName - 1]);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }

                // Replace with new image
                updatedImages[fieldName - 1] = `uploads/${file.filename}`;
            });
        }

        // Update product details
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                productName,
                brand,
                category,
                description: descriptionData,
                regularPrice,
                salePrice,
                quantity,
                color,
                productImages: updatedImages,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};




module.exports={
    getProductAddPage,addProduct,getAllproduct,blockProduct,getEditProduct,submittProduct

}