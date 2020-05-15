var express = require('express');
var router = express.Router();
var userModule = require('../modules/user.js');
var passCatmodule = require('../modules/password_cat');
var passwordModule = require('../modules/password');
var jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator'); 
var getPassCat = passCatmodule.find({});

if(typeof localStorage === "undefined" || localStorage === null){
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
} 

function checkMail(req, res, next){
  var email = req.body.email;
  var checkExistMail = userModule.findOne({email: email});
  checkExistMail.exec((err, data)=>{
    if(err)
    throw err;
    if(data)
    return res.render('signup', {title:'Password Management System', msg:'User already registered'});
    next();
  })
}

function checkUsername(req, res, next){
  var uname = req.body.uname;
  var checkExistUsername = userModule.findOne({username: uname});
  checkExistUsername.exec((err, data)=>{
    if(err)
    throw err;
    if(data)
    return res.render('signup', {title:'Password Management System', msg:'Username already exist'});
    next();
  })
}

/* GET home page. */
function checkLoginUser(req, res, next){
  var userToken = localStorage.getItem('userToken');
  try{
    var decoded = jwt.verify(userToken, 'loginToken');

  }catch(err){
    res.redirect('/');
  }
  next();
}
router.get('/', function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if(loginUser)
  res.redirect('/dashboard');
  else
  res.render('index', { title: 'Password Management System', msg:''});
});

router.post('/', function(req, res, next) {
  
  var uname = req.body.uname;
  var password = req.body.password;
  
  
  var checkUser = userModule.findOne({username: uname});
  checkUser.exec((err, data) =>{
    
    if(err)
    throw err;

    var getPassword = data.password;
    var getUserID = data._id;
    
    if(password === getPassword){
    var token = jwt.sign({userID: getUserID}, 'loginToken');
    localStorage.setItem('userToken', token);
    localStorage.setItem('loginUser', uname);
    res.redirect('/dashboard');
    }
    else
    res.render('index', { title: 'Password Management System', msg: 'Invalid Username or Password'});

  })
  
});

router.get('/dashboard', checkLoginUser, (req, res, next)=>{
  var loginUser = localStorage.getItem('loginUser');
  res.render('dashboard',{title: 'Password management system', loginUser: loginUser, msg:''});
})

router.get('/signup',(req, res, next) => {
  var loginUser = localStorage.getItem('loginUser');
  if(loginUser)
  res.redirect('/dashboard');
  else
  res.render('signup', {title:'Password Management System', msg:''});
});

router.post('/signup', checkMail, checkUsername, (req, res, next) => {
  //console.log(req.body);
  var username = req.body.uname;
  var email = req.body.email;
  var password = req.body.password;
  var confpassword = req.body.confpassword;

  if(password != confpassword)
  res.render('signup', {title:'Password Management System', msg:' Password doesn\'t match'});
  else{
  
   var userDetails = new userModule({
    username: username,
    email: email,
    password: password
    
  });
  userDetails.save((err, data) =>{
    if(err)
    throw err;
  
    res.render('signup', {title:'Password Management System', msg:'User registerd successfully '});
    })
  }
  });

  router.get('/about',(req, res, next) => {
    var loginUser = localStorage.getItem('loginUser');
    if(loginUser)
    res.render('about', {title:'Password Management System', loginUser: loginUser, msg:''});
    else
    res.render('signup', {title:'Password Management System', msg:''});
  });
  

router.get('/passCategory', checkLoginUser, (req, res, next) => {
  var loginUser = localStorage.getItem('loginUser');
  getPassCat.exec((err, data) =>{
    if(err)
    throw err;
    else
    res.render('passCate', {title:'Password Management System', loginUser: loginUser, records: data});
  })
});

router.get('/passCategory/delete/:id', checkLoginUser, (req, res, next) => {
  var loginUser = localStorage.getItem('loginUser');
  var passCatId = req.params.id;
  var passDelete = passCatmodule.findByIdAndDelete(passCatId);
  passDelete.exec((err) => {
    if(err)
    throw err;
    res.redirect('/passCategory');
  })
});

router.get('/passCategory/edit/:id', checkLoginUser, (req, res, next) => {
  var loginUser = localStorage.getItem('loginUser');
  var passCatId = req.params.id;
  var getPassCat = passCatmodule.findById(passCatId);
  getPassCat.exec((err, data) => {
    if(err)
    throw err;
    else
    res.render('edit_pass_cat', {title:'Password Management System', loginUser: loginUser, errors:'', success: '', 
    records: data, id: passCatId});
  })
});

router.post('/passCategory/edit', checkLoginUser, (req, res, next) => {
  var loginUser = localStorage.getItem('loginUser');
  var passCatId = req.body.id;
  var passCat = req.body.passwordCategory;
  // console.log(passCatId);
   
  var updatePassCat = passCatmodule.findByIdAndUpdate(passCatId, {password_category: passCat});
  //console.log(updatePassCat);
  updatePassCat.exec((err, data) => {
    if(err)
    throw err;
    
    res.redirect('/passCategory');
  })
});

router.get('/add-new-category', checkLoginUser, (req, res, next) => {
  var loginUser = localStorage.getItem('loginUser');
 
    res.render('addNewCat', {title:'Password Management System', loginUser: loginUser, errors: '', success: ''});
  
  
});

router.post('/add-new-category', checkLoginUser, [check('passwordCategory', 'Enter password category name')
.isLength({min: 1})], (req, res, next) => {
  var loginUser = localStorage.getItem('loginUser');
  const errors = validationResult(req);
  if(!errors.isEmpty()){
  res.render('addNewCat', {title:'Password Management System', loginUser: loginUser, errors: errors.mapped(), success:''});
  //console.log(errors.mapped());
  }
  else{
    var passCategory = req.body.passwordCategory;
    var passwordDetails = new passCatmodule({
      password_category : passCategory
    }).save((err, data)=>{
      if(err)
      throw err;
      else
      res.render('addNewCat', {title:'Password Management System', loginUser: loginUser, errors: '', success: "Passord"+ 
      " category inserted successfully"});
    })
  
  }
});

router.get('/add-new-pass', checkLoginUser, (req, res, next) => {
  var loginUser = localStorage.getItem('loginUser');
  getPassCat.exec((err, data)=>{
    if(err)
    throw err;
    res.render('add-new-pass', {title:'Password Management System', loginUser: loginUser, records: data, success: ''});
  })
});

router.post('/add-new-pass', checkLoginUser, (req, res, next) => {
  var loginUser = localStorage.getItem('loginUser');
  var passCat = req.body.passCat;
  var passDetails= req.body.passDetails;
  var password = new passwordModule({
    password_category: passCat,
    password_details: passDetails
  })
  
  password.save((err, data) => {
    // getPassCat.exec((err, data) =>{ // to reflect the category in dropdown in password details page
    //   if(err)
    //   throw err;
      res.render('add-new-pass', {title:'Password Management System', loginUser: loginUser, records: data,
      success: 'Password details inserted successfully'});
    //})
  })
  
});

router.get('/view-all-passwords', checkLoginUser, (req, res, next) => {
  var loginUser = localStorage.getItem('loginUser');
  var passDetails = passwordModule.find({});
  passDetails.exec((err, data) => {
    if(err)
    throw err;
    res.render('view-all-passwords', {title:'Password Management System', loginUser: loginUser, records: data});
  })
});

router.get('/pass-details/edit/:id', checkLoginUser, (req, res, next) => {
  var loginUser = localStorage.getItem('loginUser');
  var passID = req.params.id;
 // console.log(passID);
  passwordModule.findById({_id: passID}).exec((err, data) => {
    console.log(data);
    if(err)
    throw err;
  
    res.render('editPassDetail', {title:'Password Management System', loginUser: loginUser, record: data, success: ''});
  })
});

router.post('/pass-details/edit/:id', checkLoginUser, (req, res, next) => {
  var loginUser = localStorage.getItem('loginUser');
  var passID = req.params.id;
  var passDetails = req.body.passDetails;
  console.log(passDetails);
  passwordModule.findByIdAndUpdate(passID, {password_details: passDetails}).exec((err, data) => {
    console.log(data);
    if(err)
    throw err;
    res.render('editPassDetail', {title:'Password Management System', loginUser: loginUser, record: data, success: 'Updated successfully'});
  })
});

router.get('/pass-details/delete/:id', checkLoginUser, (req, res, next) => {
  var loginUser = localStorage.getItem('loginUser');
  var passID = req.params.id;
 // console.log(passID);
  passwordModule.findByIdAndDelete({_id: passID}).exec((err, data) => {
    //console.log(data);
    if(err)
    throw err;
    res.redirect('/view-all-passwords');
  })
});

router.get('/logout',(req, res, next) => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});



module.exports = router;
