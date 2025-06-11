const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'your-stripe-secret-key-here');
const path = require('path');
const express = require('express');
const app = express();
const port = 3000;

const cors = require('cors');

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use(cors());

// Content Security Policy middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:; " +
    "style-src 'self' 'unsafe-inline' https: http:; " +
    "img-src 'self' data: https: http:; " +
    "font-src 'self' https: http: data:; " +
    "connect-src 'self' https: http: ws:;"
  );
  next();
});

// Serve static files from different directories
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/customer', express.static(path.join(__dirname, '../customer')));
app.use('/ml-services', express.static(path.join(__dirname, '../ml-services')));
app.use(express.static(path.join(__dirname, '../')));

// Root route - redirect to customer interface
app.get('/', (req, res) => {
  res.redirect('/customer');
});

// Admin routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/index.html'));
});

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/login.html'));
});

app.get('/admin/analytics', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/ml-analytics.html'));
});

// Customer routes
app.get('/customer', (req, res) => {
  res.sendFile(path.join(__dirname, '../customer/index.html'));
});

app.get('/customer/events', (req, res) => {
  res.sendFile(path.join(__dirname, '../customer/upcoming_events.html'));
});

app.get('/customer/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../customer/login.html'));
});

app.get('/customer/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../customer/signup.html'));
});

// Handle the payment token
app.post('/pay', async (req, res) => {
  const token = req.body.token;
  const amount = req.body.amount;
  const currency = req.body.currency;

  try {
    // Create a charge or perform other payment-related actions using the token
    // Replace the following code with your own logic
    const charge = await stripe.charges.create({
      amount: amount, // Amount in cents
      currency: currency,
      source: token,
      description: 'Test Payment'
    });

    console.log(charge);

    // Send a response to the client
    res.sendStatus(200);
  } catch (error) {
    console.error(error);

    // Send an error response to the client
    res.sendStatus(500);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
