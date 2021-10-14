const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");

//Register a user
exports.registerUser = catchAsyncErrors( async(req, res, next) => {

    
    const {name,email,password} = req.body;

    console.log(`user registration req object ${name} ,${email},${password}`)

    const user = await User.create({
        name,email,password,
        avatar: {
            public_id: "this is a sample id",
            url: "profilepicUrl"
        }
    });
    
    sendToken(user, 201, res);
});

//Login User
exports.loginUser = catchAsyncErrors( async(req, res, next)=> {
    const{email,password} = req.body;

    //console.log(req.body)
    console.log(`extracting email ${email}`);
    console.log(`extracting password ${password}`);
    

    //Checking if user has given password and email both
    if(!email || !password) {
        return next(new ErrorHandler("Please Enter Email and Password", 400));
    }
    // const user =  await User.find({ $and: [ {email: {$eq: email} }, {password: {$eq: [password]} }] });

    const user =  await User.findOne({email : email}).select("+password").exec();

    
    if(!user){
        return next(new ErrorHandler("Invalid Email or password", 401));
    }

    const isPasswordMatched =  user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or password", 401));
    }

    sendToken(user, 200, res);
});


//Logout User
exports.logout = catchAsyncErrors(async(req,res,next) => {

res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly : true
})

    res.status(200).json({
        success: true,
        message: "logged out"
    })
})

//forgot password
exports.forgotPassword = catchAsyncErrors(async(req,res,next) => {

    const user = await User.findOne({email : req.body.email})
})