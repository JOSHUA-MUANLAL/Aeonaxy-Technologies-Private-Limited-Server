const cloudinary = require('cloudinary').v2;
          
cloudinary.config({ 
  cloud_name: 'djyotijde', 
  api_key: '338389364958638', 
  api_secret: 'foha8qIGuk_bCci4fmCiP-m9Ldk' 
});



cloudinary.uploader.upload(image,
  { public_id: email }, 
  function(error, result) {console.log(result); });

  const result =cloudinary.uploader.destroy(email,(result)=>{
    console.log(result);
  });
 