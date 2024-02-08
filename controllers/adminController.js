const user = require("../models/userModel");
const bcrypt = require('bcrypt');
const randomString = require('randomString');

const securePassword = async(passsword) => {
  try {
    const passwrodHash = await bcrypt.hash(passsword,10);
  } catch (error) {
    console.log(error.message)
  }
}

const loadLogin = async (req, res) => {
  try {
    res.render('login');
  } catch (error) {
    console.log(error.message);
  }
}

const verifyLogin = async (req,res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await user.findOne({email:email});
    if(userData){

      const passwordMatch = await bcrypt.compare(password,userData.password);
      if(passwordMatch){
          if(userData.is_admin ===0){
            res.render('login',{message:"Email and Password is Incorrect"});
          } else {
            req.session.user_id = userData._id;
            res.redirect("/admin/home");
          }

      } else {
        res.render('login',{message:"Email and Password is Incorrect"});

      }
    } else {
      res.render('login',{message:"Email and Password is Incorrect"});
    }


  } catch (error) {
      console.log(error.message);
  }
}


const loadDashboard = async(req,res) =>{
  try {
    const userData =  await user.findById({_id:req.session.user_id});
      res.render('home',{admin:userData});
  } catch (error) {
      console.log(error.message);
  }
}

const logout = async(req,res) => {
  try {
      req.session.destroy();
      res.redirect('/admin');
  } catch (error) {
      console.log('error.message');
  }
}

const adminDashboard = async(req,res) => {
  try {
    const usersData = await user.find({is_admin:0})
    res.render('dashboard',{users:usersData});
  } catch (error) {
    console.log(error.message);
  }
}

//Add New Work Start
const newUserLoad = async (req, res) => {
  try {
    res.render('new-user')
  } catch (error) {
    console.log(error.message)
  }
}

const addUser = async (req,res) => {
  try {
    
      const name = req.body.name;
      const email = req.body.email;
      const mno = req.body.mno;
      const image = req.file.filename;
      const password = randomString.generate(8);

      const spassword = await securePassword(password)

      const user = new User({
        name:name,
        email:email,
        mobile:mno,
        image:image,
        password:spassword,
        is_admin:0
      });

      const userData = await user.save();

      if(userData){
        //addUserMail(name, email,psasword,userData._id); //to send email verification 20th 2ndpart
        res.render('/admin/dashboard');
      } else {
        res.render('new-user',{message:'Something  Wrong'});
      }

  } catch (error) {
    console.log(error.message);
  }
}

//Edit usere functionality
const editUserLoad = async (req,res) => {
  try {
    const id = req.query.id;
    const userData = await user.findById({_id:id});
    if(userData){
      res.render('edit-user',{user:userData});
    }
    else {
      res.redirect('/admin/dashboard');
    }
  } catch (error) {
    console.log(error.message);
  }
}

//Update User
const updateUser = async (req,res) => {
  try {
    const userData = await user.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mno,is_verified:req.body.verify}});
    res.redirect('/admin/dashboard');

  } catch (error) {
    console.log(error.message);
  }
}

//Delete User
const deleteUser = async(req,res) => {
  try {
    const id = req.query.id;
    await user.deleteOne({_id:id});
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.log(error.message)
  }
}


module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  adminDashboard,
  newUserLoad,
  addUser,
  editUserLoad,
  updateUser,
  deleteUser
}