const express = require('express');   //imports the express module , const is used to create a constant variable so that its value cant be reassigned after it is set here
const cors = require('cors');
const jwt = require('jsonwebtoken');
const adsRouter = require('./routes/ads');   //imports the router defined in the 'ads.js' file, router contains the endpoints related to ads
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


const path = require('path')
const app = express();               
const port = 3001;

//I have written
app.use((bodyParser.json))
app.use(cors())
app.use(cookieParser());
app.use('/api/ads', adsRouter);      //This line tells the Express application to use the 'adsRouter' for any routes that start with '/api/ads' means localhost:3000/api/ads. This means that any requests to '/api/ads' will be handled by the router defined in ads.js

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//added now for uploads issue
// const uploadsPath = path.join(__dirname, 'public', 'uploads');
// app.use('/uploads', express.static(uploadsPath));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


app.get('/', (req, res) => {       //This line defines a simple route handler for the root URL (/). When a GET request is made to the root URL, it sends back the text 'Hello World!'.
  res.send('Hello World!');
});

app.listen(port, () => {           //This line starts the server and listens on the specified port (3000)
  console.log(`Server running at http://localhost:${port}`);
});


//since we started using formidable in savedAd.js for handling file uploads, we now dont have to use multer, next-connect
// const multer  = require('multer')
// const nextConnect = require('next-connect')

// //Create storage engine
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//      cb(null, 'uploads/'); // Specify the directory to save uploaded files
//   },

//   filename: function (req, file, cb) {
//       cb(null, `${Date.now()}-${file.originalname}`); // Set the file name
//   }
// });

// // Initialize multer with the storage engine
// const upload = multer({ storage });
// export default upload;







