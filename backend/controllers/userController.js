const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require('../utils/sendEmail');
const crypto = require("crypto");



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

    const user = await User.findOne({email : req.body.email}).exec();

    //console.log(user)
    
    if(!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    //Get Reset password token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    console.log(user);

    const resetPasswordURL = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is: \n\n ${resetPasswordURL} \n\nIf you have not requested this email
    then, please ignore this message`;

    try{
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,            
            message: message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully!`
        })
    }catch(error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });        

        return next(new ErrorHandler(error.message, 500));

    }
});

// Reset password
exports.resetPassword = catchAsyncErrors(async(req,res,next) => {

    //creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if(!user) {
        return next(new ErrorHandler("Reset Password Token is invalid or had been expired", 400));
    }

    if(req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
});

//Get User Details
exports.getUserDetails = catchAsyncErrors( async(req, res, next) => {

    const user = await User.findById(req.user.id).exec();

    res.status(200).json({
        success: true,
        user,
    })
});

//Update User Password
exports.updatePassword = catchAsyncErrors( async(req, res, next) => {

    const user = await User.findById(req.user.id).select("+password");

    if(user.password === req.body.oldPassword)
    {
        if(req.body.newPassword === req.body.confirmPassword)
        user.password = req.body.newPassword
        else return next(new ErrorHandler("Your confirm password did not match with new password", 400));
    } 
    else return next(new ErrorHandler("Your old password is wrong", 400));

    await user.save();

    sendToken(user, 200, res);
});

//Update User details
exports.updateProfile = catchAsyncErrors( async( req,res,next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email 
    }

   //Will add Cloudinary later

    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
            new:true,
            runValidators:true,
            useFindAndModify: false
        });

    res.status(200).json({
        success: true,
    });
        
});