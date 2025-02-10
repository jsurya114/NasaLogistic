const Brand = require("../../models/brandSchema");
const Product = require("../../models/productSchema");

const getBrandPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        const brandData = await Brand.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalBrands = await Brand.countDocuments();
        const totalPages = Math.ceil(totalBrands / limit);

        res.render("brands", {
            data: brandData,
            currentPage: page,
            totalPages: totalPages,
            totalBrands: totalBrands
        });

    } catch (error) {
        console.error("Error fetching brand page:", error);
        res.redirect("/pageerror");
    }
};

const addBrand = async (req, res) => {
    try {
        console.log("Received form data:", req.body);
        console.log("Received file data:", req.file);

        const brand = req.body.name ? req.body.name.trim() : null;
        if (!brand) {
            return res.redirect("/admin/brands?error=Brand name is required");
        }

        const findBrand = await Brand.findOne({ name: brand });
        if (findBrand) {
            return res.redirect("/admin/brands?error=Brand already exists");
        }

        const image = req.file ? req.file.filename : "default.jpg";
        const newBrand = new Brand({
            name: brand,
            brandImage: [image],
        });

        await newBrand.save();
        res.redirect("/admin/brands");

    } catch (error) {
        console.error("Error adding brand:", error);
        res.redirect("/pageerror");
    }
};

const blockBrand = async (req, res) => {
    try {
        const id = req.query.id;
        console.log("Blocking brand with ID:", id); 
        await Brand.updateOne({ _id: id }, { $set: { isBlocked: true } });
        res.redirect("/admin/brands");
    } catch (error) {
        console.error("Error blocking brand:", error);
        res.redirect("/pageerror");
    }
};

const unblockBrand = async (req, res) => {
    try {
        const id = req.query.id;
        console.log("Unblocking brand with ID:", id);
        await Brand.updateOne({ _id: id }, { $set: { isBlocked: false } });
        res.redirect("/admin/brands");
    } catch (error) {
        console.error("Error unblocking brand:", error);
        res.redirect("/pageerror");
    }
};


const deleteBrand=async(req,res)=>{
    try {
        const {id}=req.query;
        if(!id){
            return res.status(400).redirect("/pageerror")
        }
        await Brand.deleteOne({_id:id})
        res.redirect("/admin/brands")
    } catch (error) {
        console.error("Error deleting brand:",error)
        res.status(500).redirect("/pageerror")
    }
}



module.exports = {
    getBrandPage,
    addBrand,
    blockBrand,
    unblockBrand,
    deleteBrand
};
