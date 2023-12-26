const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

// Function to generate random objects
function generateRandomObjects(num) {
  const objects = [];

  for (let i = 0; i < num; i++) {
      objects.push({
          id: i + 1,
          lat: 50.4501 + (Math.random() - 0.5) * 0.4, // Increasing range for latitude
          lng: 30.5234 + (Math.random() - 0.5) * 0.4, // Increasing range for longitude
          price: [5, 15, 35][Math.floor(Math.random() * 3)], // Randomly selects 5, 15, or 35
          spots_left: Math.floor(Math.random() * 100) // Random number between 0 and 99
      });
  }

  return objects;
}

var locations = []
var payments = []
var selectedParking = null
var selectedCarNumber = null

// GET route
app.get('/locations', (req, res) => {
  locations = generateRandomObjects(20);
  res.json(locations);
});

app.post('/saveParkingSpot', express.json(), (req, res) => {
  const { id } = req.body;
  if (id) {
      selectedParking = locations[id];
      io.emit('SELECTED_PARKING', selectedParking)
      res.send({ success: true, message: `Parking spot ${id} saved.` });
  } else {
      res.status(400).send({ success: false, message: 'Invalid request' });
  }
});

app.post('/saveCarNumber', express.json(), (req, res) => {
  const { carNumber } = req.body;
  if (carNumber) {
    selectedCarNumber = carNumber;
    io.emit('SELECTED_NUMBER', selectedCarNumber)
    res.send({ success: true, message: `Car number ${carNumber} saved.` });
  } else {
      res.status(400).send({ success: false, message: 'Invalid request' });
  }
});

app.get('/getParkingSpot', (req, res) => {
  res.send(selectedParking);
});

app.get('/getCarNumber', (req, res) => {
  res.send(selectedCarNumber);
});

app.post('/pay', express.json(), (req, res) => {
  const { parkingId, pricePaid } = req.body;
  
  // Generate the current time in "dd.mm.yyyy | mm:ss" format
  const currentTime = new Date();
  const formattedTime = `${currentTime.getDate().toString().padStart(2, '0')}.${(currentTime.getMonth() + 1).toString().padStart(2, '0')}.${currentTime.getFullYear()} | ${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

  // Create the JSON object
  const transaction = {
      time: formattedTime,
      parking_id: parkingId,
      price_paid: pricePaid
  };

  // Add the object to the array
  payments.push(transaction);

  // Send a response
  res.send({ success: true, message: 'Transaction recorded' });
});

app.get('/getPayments', (req, res) => {
  res.send(payments);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
