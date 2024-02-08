const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')

// Function to securely hash passwords using bcrypt
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
}

// Function to send a verification email 
// const sendVerifyMail = async(name,email,user_id)=>{
//     try{
//       const transporter = nodemailer.createTransport({
//         host:'smtp.gmail.com',
//         port:587,
//         secure:false,
//         requireTLS:true,
//         auth:{
//           user:'ytbusiness.772@gmail.com',
//           pass:'gokulgb772@#$'
//         }
//       });
//       const mailOptions = {
//         from:'ytbusiness.772@gmail.com',
//         to:email,
//         subject:'Verification Mail',
//         html:'<p>Hii '+ name + ', Click here to <a href="http://localhost:3000/verify?id='+user_id+'"> Verify </a> your email. </p> '
//       }
//       transporter.sendMail(mailOptions,function(error,info){
//         if(error){
//             console.log(error);
//         }
//         else{
//             console.log("Email has been sent:-",info.response);
//         }
//       })

//     } catch (error){
//       console.log(error.message);
//     }
// }


// Function to render the registration page
const loadRegister = async (req, res) => {
  try {
    res.render('registration')
  } catch (error) {
    console.log(error.message)
  }
}

// Inserting  new user into the database
const insertUser = async (req, res) => {
  try {
    // Hashing the user's password
    const spassword = await securePassword(req.body.password);

    // Creating a new User instance in the database with the provided data
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      image: req.file.filename,
      password: spassword,
      is_admin: 0
    });

    // Saving the user data to the database
    const userData = await user.save();

    // Checking if the user data is saved successfully
    if (userData) {
      //To send verification email
      // sendVerifyMail(req.body.name, req.body.email, userData._id)
      res.render('registration', { message: "Registration Completed Successfully. Please verify your Email" })
    }
    else {
      res.render('registration', { message: "Registration Failed" })
    }

  } catch (error) {
    console.log(error.message);
  }
}
//-------------------------------------------------------------------
// Function to handle email verification
// const verifyMail = async(req, res)=>{
//   try{
// Updating the user's is_verified status in the database
//     const updateInfo = await User.updateOne({_id:req.query.id},{ $set:{is_verified=1} });
//     console.log(updateInfo);
//     res.render("email-verified")

//   } catch (error) {
//       console.log(error.message)
//   }
// }
//----------------------------------------------------------------


//Login user methods started
const loginLoad = async (req, res) => {
  try {
    res.render('login');
  } catch (error) {
    console.log(error.message);
  }
}

//Passwprd verification process
const verifyLogin = async (req, res) => {

  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email })

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_verified === 0) {
          res.render('login', { message: "Please Verify Your Account" })
        } else {
          req.session.user_id = userData._id
          res.redirect('/home')
        }
      } else {
        res.render('login', { message: "Email and Password is Incorrrect" })
      }

    } else {
      res.render('login', { message: "Email and Password is Incorrrect" })
    }

  } catch (error) {
    console.log(error.message);
  }

}


const loadHome = async (req, res) => {
  try {

    const userData = await User.findById({_id:req.session.user_id});
    res.render('home',{user:userData});

  } catch (error) {
    console.log(error.message);
  }

}

const userLogout = async(req, res) => {
  try {
    req.session.destroy();
    res.redirect('/')
  } catch (error) {
    console.log('error.message');
  }
}

//User Profile Edit & Update
const editLoad = async(req, res) => {
  try {
    
    const id = req.query.id;
    const userData = await User.findById({_id:id});

    if(userData){
        res.render('edit',{user:userData})
    } else {
        res.redirect('/home');
    }

  } catch (error) {
    console.log(error.message);
  }
}

const updateProfile = async (req, res) => {
  try {
    if (req.file){
      const userData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,name:req.body.name,mobile:req.body.mno, image:req.file.filename}})
    } 
    else {
       const userData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,name:req.body.name,mobile:req.body.mno}})
    }
    res.redirect('/home')
  } catch (error) {
     console.log(error.message);
  }
}

module.exports = {
  loadRegister,
  insertUser,
  //verifyMail,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
  editLoad,
  updateProfile
}