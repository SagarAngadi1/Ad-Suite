//this ads.js is a route file


const express = require('express');
const router = express.Router();   // This line creates a new router object. Routers are used to define groups of routes(like many routes of get, put ect) that can be modularized and used in the main application.


router.get('/', (req, res) => {   //This line defines a GET route on the root path('/' means roote path) of the router. When a GET request is made to /api/ads, it responds with the text 'Ads endpoint'.
  res.send('Ads endpoint');
});

module.exports = router;   //This line exports the router so that it can be used in other parts of the application



// // routes/ads.js
// const express = require('express');
// const router = express.Router();

// // Route to get all ads
// router.get('/', (req, res) => {
//   res.json({ message: 'List of ads' });
// });

// // Route to create a new ad
// router.post('/', (req, res) => {
//   const adData = req.body;
//   // Here you would save the ad data to your database
//   res.status(201).json({ message: 'Ad created', data: adData });
// });

// module.exports = router;