const express=require('express')
const app=express()
const cors=require('cors')
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';
const usercontrol=require('./controller/userControl')



app.use(bodyParser.json());





app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/',usercontrol)

console.log("woriking")

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
  })
