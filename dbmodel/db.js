const mongoose = require('mongoose');




try{
  
 const connection = mongoose.createConnection('mongodb+srv://joshuamuanlalbusiness:lQuYRCmi9RsAt447@joshuabusiness.f90oxlc.mongodb.net/?retryWrites=true&w=majority&appName=joshuabusiness');

 

// Create the user schema
const userSchema = new mongoose.Schema({
  //user_id: { type: Number, unique: true },
  userEmail:String,
  userName: String,
  phone:Number,
  role:String,
  password:String,
  itemlist:[
    { course_id:String,
      subject:String,
      course_title:String,
      url:String,
      level:String,
      fav:Boolean,
      price:Number,
    }
  ]
});





// Create the User model
const UserModel = connection.model('userrecorddata', userSchema);
console.log("connected",UserModel);

// Export the User model
module.exports = {UserModel};

}catch(error){
  console.log("error in db.js",error.message);
}