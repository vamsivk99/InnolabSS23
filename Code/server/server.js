const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'your-stripe-secret-key-here');

const express = require('express');
const app = express();
const port = 3000;

const cors = require('cors');

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use(cors());

// Serve the HTML file
app.use(express.static(__dirname));

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
