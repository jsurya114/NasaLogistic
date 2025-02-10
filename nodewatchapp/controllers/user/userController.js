const User = require('../../models/userSchema');
const express = require('express');
const app = express();
const session = require('express-session');
const nodemailer = require('nodemailer');
const bcrypt=require('bcrypt')
require('dotenv').config();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


function generateOtp() {
    
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, otp) {
    try {
        


        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD
            }
        });

       

        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: 'Verify Your Account',
            text: `Your OTP is: ${otp}`,
            html: `<b>Your OTP: ${otp}</b>`
        });

        
        return info.accepted.length > 0;
    } catch (error) {
        console.error('Detailed email error:', error);
        return false;
    }
}


const loadSignup = async (req, res) => {
    try {
        return res.render('signup');
    } catch (error) {
        console.error('Error loading signup page:', error);
        res.status(500).send('Server Error');
    }
};

const loadShopping = async (req, res) => {
    try {
        return res.render('shop');
    } catch (error) {
        console.error('Error loading shopping page:', error);
        res.status(500).send('Server Error');
    }
};

const loadHomepage = async (req, res) => {
    try {
        const user=req.session.user
        if(user){
            const userData=await User.findOne({_id:user._id})
            res.render("home",{user:userData})
        }else{
            return res.render("home")
        }
        
    } catch (error) {
        console.error('Error rendering homepage:', error.message);
        res.status(500).send('Server Error');
    }
};

const pageNotFound = async (req, res) => {
    try {
        return res.render('page-404');
    } catch (error) {
        console.error('Error loading 404 page:', error);
        res.status(500).send('Server Error');
    }
};

const signup = async (req, res) => {
    try {
        
        const { name, phone, email, password, cPassword } = req.body;

        if (password !== cPassword) {
            return res.render('signup', { message: "Passwords do not match" });
        }

        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.render("signup", { message: "User with this email already exists" });
        }

        const otp = generateOtp();
        const emailSent = await sendVerificationEmail(email, otp);
        if (!emailSent) {
            return res.render('signup', { message: "Failed to send verification email" });
        }

        req.session.userOtp = otp;
        req.session.userData = { 
            name, phone, email, password 
        };
        console.log("OTP",otp)

        return res.render("verify-otp");
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).render('signup', { message: "An error occurred during signup" });
    }
};


const securePassword=async (password)=>{
    try {
        const passwordHash =await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        
    }
          
}

const verifyOtp = async(req, res) => {
    try {
             const {otp} = req.body;
        console.log(otp);
        if(otp === req.session.userOtp) {
            const user = req.session.userData;
            const passwordHash = await securePassword(user.password);
            const saveUserData = new User({
                name: user.name,
                email: user.email,
                phone: user.phone || undefined, 
                password: passwordHash,
                wallet: 0
              
            });
            await saveUserData.save();
            req.session.user = saveUserData._id;
            req.session.userOtp = null
            res.json({success: true});
           
        } else {
            res.status(400).json({failed: "Invalid OTP, Please Try again"});
        }
    } catch(error) {
        console.error("Error Verifying OTP", error);
        res.status(500).json({success: false, message: 'An error Occurred'});
    }
}
const resendOtp=async(req,res)=>{
    try {
        const {email}=req.session.userData;
        if(!email){
            return res.status(400).json({success:false,message:"Email not found in session"})
        }
        req.session.userOtp = null;
        const otp=generateOtp()
        req.session.userOtp=otp
        const emailSend=await sendVerificationEmail(email,otp)
        if(emailSend){
            console.log("Resend OTP:",otp)
            res.status(200).json({success:true,message:"OTP Resend Successfully"})
        }else{
            res.status(500).json({success:false,message:"Failed to Resend OTP,Please Try Again"})
        }
        
    } catch (error) {
        console.error("Error Resending OTP",error)
        res.status(500).json({success:false,message:"Internal server Error.Please try again"})
    }
}
const loadLogin = async (req, res) => {
    try {
        console.log("Loading login page...");
        console.log("Session data:", req.session.user);

        if (req.session.user) {
            const userData = await User.findById(req.session.user._id);
            if (userData) {
                return res.redirect("/");
            }
        }

        return res.render("login");
    } catch (error) {
        console.log("Error loading login:", error);
        res.redirect("/pageNotFound");
    }
};


const login=async(req,res)=>{
    try {
       const{email,password}=req.body
       const findUser=await User.findOne({email:email.toLowerCase()})
       if(!findUser){
        return res.render("login",{message:"User Not Found"})
       }
       if(findUser.isBlocked){
        return res.render("login",{message:"User is Blocked by Admin"})
       }
       const passwordMatch= await bcrypt.compare(password,findUser.password)
        if(!passwordMatch){
            return res.render("login",{message:"Incorrect Password"})
        }
        req.session.user=findUser;
        res.redirect("/")
       
    } catch (error) {
      console.error("Login error")
      res.render('login',{message:"login failed.  please try again later"})  
    }
}

const logout=async(req,res)=>{
    try {
        req.session.destroy((err)=>{
            if(err){
                console.log("Session destruction error",error.message)
                return res.redirect("/pageNotFound")
            }
            return res.redirect("/login")
        })
    } catch (error) {
        console.log("Logout error",error)
        res.redirect("/pageNotFound")
    }
}

module.exports = {
    loadHomepage,
    pageNotFound,
    loadShopping,
    loadSignup,
    signup,
    verifyOtp,
    resendOtp,
    loadLogin,
    login,
    logout
};