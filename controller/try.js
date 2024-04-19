const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: 'djyotijde',
  api_key: '338389364958638',
  api_secret: 'foha8qIGuk_bCci4fmCiP-m9Ldk'
});

// Function to upload an image
function uploadImage(image, email) {
    let a=cloudinary.uploader.upload(image, { public_id: email }, (error, result) => {
        if (error) {
          reject(error);
          console.log("here")
        } else {
          resolve(result);
        }
      });
      console.log(a)
}

// Function to delete an image


let i="download.jpeg"
uploadImage(i,"myimage")
