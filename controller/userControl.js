const router = require("express").Router();
const path=require('path');
const bcrypt = require('bcryptjs');
const {Resend}=require('resend')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const {UserModel} = require('../dbmodel/db');
const mongoose=require('mongoose');
const validate=require('./sendmail')
const authentication=require('../middleware/authentication')
const axios = require('axios');


const sendmail=require('./sendmail');
const { response } = require("express");



const viewsPath = path.join(__dirname);
const secret_key="joshua";
let results=[]

router.get('/',(req,res)=>{
  res.redirect('https://joshua-muanlal.github.io/Aeonaxy-frontend/')
})


//FOR USER AND ADMIN REGISTER
router.post('/userregister',upload.single('file'),async(req,res)=>{
    try{
        const email=req.body.email;
        const name=req.body.name;
        const password=req.body.password;
        const phone=req.body.phone;
        const dob=req.body.dob
        const role=req.body.role
        
        if(true){
            console.log("FOR REGISTRATION \n 10checking if email already existed")
            let result=await UserModel.findOne({userEmail:email});
            if(result){
                console.log("2)user existed")
                
                res.status(201) .json({message:'User already existed'})


            }else{
                console.log("2)new registeration")
                const saltRounds=10;
                const hashedPassword=await bcrypt.hash(password, saltRounds)

                const user=new UserModel({
                    userEmail:email,
                    userName:name,
                    dob:dob,
                    role:role,
                    phone:phone,
                    password:hashedPassword,
                    itemlist:[

                    ]
                })
                console.log("3)Inserted in db")

                user.save()
                .then(result => {
                    console.log("4)db saved")
                    let mailOptions={
                      from:{
                          name:'JCourse',
                          address:'joshua00521202021@msijanakpuri.com'
                      },
                      to:email,
                      subject:'Registration Complete',
                      text:'Registration Complete',
                      html:`<b>Welcome! ${name}<br> Thank you For Registering With Us<br><br>Hope You will Love our webpage</b>`
                            }
                    sendmail(mailOptions)
                   
                    console.log("5)done registration");
                    res.status(200).json({ message: 'Registered' });
                  })
                  .catch(err => {
                    
                    
                    console.error("4)Faild to register db",err);
                     res.status(201).json({message:'Failed to register'})
                  });

            }
        }else{
            res.status(201).json({message:"no such email exist"})
        }


    }catch(error){
        console.log(error)
    }

})

//FOR ADMIN LOGIN IN
router.post('/loginadmin',async(req,res)=>{
    try{
      const email=req.body.email;
    const password=req.body.password;
    console.log("FOR ADMIN LOGIN \n 1)admin loging")
    const result=await UserModel.findOne({userEmail:email})
    if(result ){
      let match=await bcrypt.compare(password,result.password);
      if(result.role!='admin'){
        res.status(200).json({message:`For User Please visit User Page`})
      }
      if(match){
        console.log('2)admin password match')
        const userPayload={
          name:result.name,
          email:result.userEmail,
          password:result.password,
          role:result.role
      }
      const token = jwt.sign(userPayload, secret_key);
      console.log("3)Token signed")
      res.status(200).json({token});
      }else{
        console.log("2)password incorrect")
        res.status(201).json({message:"password incorrect"})
      }
    }else{
      console.log("2)No user found")
        
        res.status(201).json({message:"Email Not Found"})

    }
    }catch(error){
      console.log(error)

    }
})

//FOR USER LOGIN
router.post('/login',async(req,res)=>{
    try{
      const email=req.body.email;
    const password=req.body.password;
    console.log("FOR USER LOGIN \n User logging in")

    const result=await UserModel.findOne({userEmail:email})
    if(result){
         let match=await bcrypt.compare(password, result.password);

         if(result.role!='user'){
          res.status(201).json({message:`For Admin Role Visit admin Page`})
         }

    if(match){
        console.log("2)password matched")
        const userPayload={
            name:result.name,
            email:result.userEmail,
            password:result.password,
            role:result.role
        }
        const token = jwt.sign(userPayload, secret_key);
        console.log("3)token signed")
        

       
        res.status(200).json({token});
    }else{
        console.log("2)password incorrect")
        res.status(201).json({message:"password incorrect"})
    }
    }else{
        console.log("2)No user found")
        message="NO USER FOUND"
        res.status(201).json({message:"Email Not Found"})
    }
    }catch(error){
      console.log(error)
    }

   

})

//FETCH LOGGED IN USER DATA
router.get("/getuserdata",authentication,async(req,res)=>{
  try{
    console.log("FOR FETCHING DATA \n  1)fetching user data")
    
    const useremail=req.userdetail.email

    const result= await UserModel.findOne({userEmail:useremail})
    if(result){
     
      
      console.log("2)result found and sending data")

    res.status(200).json(result)
    
    
    }else{
      console.log("2)no result for user ")

    }
   


  }catch(error){
    console.log("error",error)
    res.status(404).json({message:"no data Found"})
  }
}
 )


//FOR REQUEST TO JOIN COURSE
router.post('/joincourse',authentication,async(req,res)=>{
   try{
    const new_obj=req.body.data;
    console.log("FOR JOINING COURSE\n Requested")
    let email=req.userdetail.email
    const result=await UserModel.findOne({userEmail:email})

    if(result){
      const existingItem = result.itemlist.find(item => item.course_id ===new_obj.course_id);
      if (existingItem) {
        console.log("2)already joined")
        res.status(201).json({message:"already Joined"}) // Data already exists, return false
      }else{
        
      result.itemlist.push(new_obj)

      result.save()
      .then(result=>{
        console.log("2)joined course")
        res.status(200).json(result)
      })
      .catch(err => {
                    
                    
        console.error("Faild to register db",err);
         res.status(401).json({message:'failed to register'})
      });
      }





    }else{
      console.log("No user Found")
    }

   }catch(error){
    console.log(error)
   }


})

//REQUEST TO REMOVE COURSE
router.post('/removecourse',authentication,async(req,res)=>{
  try{
    const index=req.body.index;
  try {
    const userDetail = req.userdetail; 
    console.log("FOR REMOVINF COURSE \n 1)Resquest")

    
    const result = await UserModel.findOneAndUpdate(
      { userEmail: userDetail.email },
      { $pull: { 
          itemlist: { course_id: index }  // Remove the item where course_id matches the provided index
      } },  
      { new: true }
  );

    if (!result) {
      console.log("2)unable to remove")
        res.status(404).json(result);
    }else{
      console.log("2)removed success")

      res.status(200).json({ message: 'Item deleted successfully' });
    }
   
} catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
}
  }catch(error){
    console.log(error)
  }
})

//REQUEST TO RESET PASSWORD INCASE YOUR FORGOT YOUR PASSWORD
router.post('/resetpassword',async(req,res)=>{
   try{
    const email=req.body.email;
    const newpassword=req.body.password
    console.log("FOR RESETING PASSWORD \n 1)Requested")
     
    let result=await UserModel.findOne({userEmail:email})
    if(result){
      const saltRounds=10;
      const hashedPassword=await bcrypt.hash(newpassword, saltRounds)
      result.password=hashedPassword;
      result.save()
      .then(response=>{
        let mailOptions={
          from:{
              name:'JCourse',
              address:'joshua00521202021@msijanakpuri.com'
          },
          to:email,
          subject:'Password Change',
          text:'Password Changed',
          html:`<b>Dear ${result.userName}<br> You have successfully Reset your password</b>`
                }

        sendmail(mailOptions)
        console.log("2)Password changed")
        res.status(200).json({message:"Password reset successful"})

      })
    }else{
      res.status(201).json({message:"Email Not found"})
    }

   }catch(error){
    console.log(error)
   }
    
})

//REQUEST TO CHANGE PASSWORD WITH OLDONE
router.post("/changepassword",authentication,async(req,res)=>{
  try{
    const newpass=req.body.newpassword;
  const oldpass=req.body.password;
  const email=req.userdetail.email;
  console.log("1)for changeing password")
  
  let user=await UserModel.findOne({userEmail:email})

  if(user){
    const result=await bcrypt.compare(oldpass,user.password)

    if(result){
      const saltRounds=10;
      const hashedPassword=await bcrypt.hash(newpass, saltRounds)
      const name=user.userName
      user.password=hashedPassword;
      user.save()
      .then(response=>{

        let mailOptions={
          from:{
              name:'JCourse',
              address:'joshua00521202021@msijanakpuri.com'
          },
          to:email,
          subject:'Password Change',
          text:'Password Changed',
          html:`<b>Dear ${name}<br> You have successfully changed your password</b>`
                }

        sendmail(mailOptions)
        console.log("2)changed password")
        
        res.status(200).json({message:"Change password"})
      })
      .catch(err=>{
        console.log(err)
      })
    }else{
      console.log("old password was inccorect")
    res.status(201).json({message:"password incorrect"})
    }

  }

  }catch(error){
    console.log(error)
  }


})

//EDIT USER OR ADMIN NAME
router.post('/editname',authentication,async(req,res)=>{
  try{
    const newname=req.body.newname;
  const password=req.body.password;
  const email=req.userdetail.email;
  let result=await UserModel.findOne({userEmail:email})
  console.log("EDITING NAME")
  if(!result){
    res.status(404).json("error with email")
  }else{
    
    const comp=await bcrypt.compare(password,result.password)
    if(comp){
      result.userName=newname

      result.save()
      .then(response=>{
        let mailOptions={
          from:{
              name:'JCourse',
              address:'joshua00521202021@msijanakpuri.com'
          },
          to:email,
          subject:'User Name Changed Complete',
          text:'User Name Changed',
          html:`<b>Dear ${newname}<br> You Have Successfully changed you user name </b>`
                }
        sendmail(mailOptions)
        console.log("2)sucessfully changed name")
        res.status(200).json({message:"name changed"})

      })
      .catch(err=>{
        console.log("2)failed to change",err)

      })
    }else{
      console.log("pass incorrect")
      res.status(404).json({message:"Password incorrect"})
    }
  }

  }catch(error){
    console.log(error)
  }
})

//FOR GENERATING OTP FOR PASSWORD CHANGE
router.post('/generateotp',async(req,res)=>{
  try{
    const email=req.body.email;
    let result=await UserModel.findOne({userEmail:email})

    if(result){
      const otp=Math.floor(Math.random() * 900000) + 100000;

      let mailOptions={
        from:{
            name:'JCourse',
            address:'joshua00521202021@msijanakpuri.com'
        },
        to:email,
        subject:'One Time Password',
        text:'Passsword OTP',
        html:`<b>Dear ${result.userName}<br> Your OTP for Password reset is ${otp} </b>`
              }
        sendmail(mailOptions)
        res.status(200).json({otp:otp})

    }else{
      res.status(201).json({message:"Email Not Found"})
    }

  }catch(error){
    res.status(404).json({message:"error"})
    console.log(error)
  }
})

//REQUEST FOR OTP FOR REGISTRATION
router.post('/generateotpforregister',async(req,res)=>{
  try{
    const email=req.body.email;
    let result=await UserModel.findOne({userEmail:email})

    if(!result){
      const otp=Math.floor(Math.random() * 900000) + 100000;

      let mailOptions={
        from:{
            name:'JCourse',
            address:'joshua00521202021@msijanakpuri.com'
        },
        to:email,
        subject:'One Time Password',
        text:'Passsword OTP',
        html:`<b>Dear User ${email}<br> Your OTP for Password reset is ${otp} </b>`
              }
        sendmail(mailOptions)
        res.status(200).json({otp:otp})

    }else{
      res.status(201).json({message:"Email Already Existed"})
    }

  }catch(error){
    res.status(404).json({message:"error"})
    console.log(error)
  }
})


//FETCHING ALL USER DETAIL
router.get('/getalluserdata',authentication,async(req,res)=>{
try{
  let adminrole=req.userdetail.role;
  console.log("1)getting all user data")
    if(adminrole!='admin'){
      res.status(201).json({message:`only admin can access user datas`})
    }else{
      const userdata=await UserModel.find({role:"user"});
      if(userdata){
        console.log("2)fetch data of all users")
        res.status(200).json(userdata)
      }else{
        res.status(201).json({message:`Failed to get data`})
      }
    }
}catch(error){
  console.log(error)
}
})

//REQUEST TO REMOVE A SPECIFIC USER WITH REASON
router.post('/removeuser',authentication,async(req,res)=>{
  try{
    if(req.userdetail.role=='admin'){
      let password=req.body.confirmpassword;
      let reason=req.body.reason
      let email=req.body.email;

      let result=await UserModel.findOne({userEmail:email})

      if(result){
        await UserModel.deleteOne({userEmail:email})
        let mailOptions={
          from:{
              name:'JCourse',
              address:'joshua00521202021@msijanakpuri.com'
          },
          to:email,
          subject:'Removed From the Web',
          text:'',
          html:`<b>Dear ${result.userName}<br> You are being removed/banned </b><br>
          <b><u>Reason<u>:${reason}</b>`
                }

          sendmail(mailOptions)
          res.status(200).json({message:"User Removed"})

      }else{
        res.status(201).json({message:"Unable to remove"})
      }

    }else{
      res.status(201).json({message:"Access Denied"})
    }
  }catch(error){
console.log(error)}
})

//TO SEND MESSAGE TO USER

router.post('/sentmessage',authentication,async(req,res)=>{
  try{
    const email=req.body.email
    const message=req.body.message;
    const subject=req.body.subject;

    let mailOptions={
      from:{
          name:'JCourse',
          address:'joshua00521202021@msijanakpuri.com'
      },
      to:email,
      subject:subject,
      text:'',
      html:`<b>Dear User ${email}<br>  </b><br>
      <b><u>Message<u>:</b><i>${message}</i>`
            }

      sendmail(mailOptions)
      res.status(200).json({message:"User Removed"})

  }catch(error){
    console.log(error)
    res.status(404).json("error Sending message")
  }
})



//FETCHIND COURSE DATAS

router.get('/getcoursedata',authentication,(req,res)=>{
    try{axios.get('https://myowncourseapi-3kxp-git-main-joshuas-projects-dac00888.vercel.app/getcourse')
    .then(response => {
    
    
    results=response.data;
    console.log('Response data:');
    res.status(200).json(results)
  })
  .catch(error => {
    
    console.error('Error:', error);
  });}catch(error){
    console.log(error)
  }
})

//FETCHING FILTERED COURSE
router.post('/getcourse/filter',authentication,(req,res)=>{

    let subject=req.body.subject;
    let level=req.body.level
    res.redirect(`/getcourse/subject=${subject}&level=${level}`)
  })
  
  //COURSE SUBJECT AND LEVEL FILTER
  router.get('/getcourse/subject=:subject&level=:level',(req,res)=>{
    try{
      let subject=req.params.subject;
    let level=req.params.level;
   
    let result_sub=[]
  
    results.forEach(newresult=>{
      if(newresult.subject==subject && newresult.level==level){
        result_sub.push(newresult)
        
      }
  
    })
  
    if(result_sub){
      res.status(200).json(result_sub)
    }else{
      res.json({message:"no result found"})
    }
    }catch(error){
      console.log(error)
    }
  
  })

  //FETCHING COURSE BASE ON LEVEL
  
  router.post('/getcourse/level',authentication,(req,res)=>{
    let level=req.body.level;
     res.redirect(`/getcourse/level=${level}`)
    
  })
  
  router.get('/getcourse/level=:level',(req,res)=>{
     try{
     let level=req.params.level
     let result_level=[]
   
     results.forEach(newresult=>{
       if(newresult.level==level){
         result_level.push(newresult)
         
       }
   
     })
   
     if(result_level){
       res.status(200).json(result_level)
     }else{
       res.json({message:"no result found"})
     }}catch(error){console.log(error)}
  
  })
  
  //FETCHING COURSE BASED ON SUBJECT
  router.post('/getcourse/sub',authentication,(req,res)=>{
    let sub=req.body.subject;
     res.redirect(`/getcourse/sub=${sub}`)
    
  })
  
  router.get('/getcourse/sub=:sub',(req,res)=>{
     res.setHeader('Cache-Control', 'no-store');
    let sub=req.params.sub
    let result_sub=[]
  
    results.forEach(newresult=>{
      if(newresult.subject==sub){
        result_sub.push(newresult)
        
      }
  
    })
  
    if(result_sub){
      res.status(200).json(result_sub)
    }else{
      res.json({message:"no result found"})
    }
  
  })

  module.exports = router;