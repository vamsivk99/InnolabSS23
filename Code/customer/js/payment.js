var stripe = Stripe('pk_test_51NPTZcAS6wihIvCjgxhc4VXt12ZH5ZUEsosd9iRPqY3b1CAO7H1qhcEMbsxkMzACuNzW0eBTF6SpZz065DCPjcpV00lgeAbfnd');
var elements = stripe.elements();
var cardElement = elements.create('card');
cardElement.mount('#card-element');
var form = document.getElementById('payment-form');

let totalTickets;
let availableTickets;
let noOfTicket;
let totalAmount;
let ticketPrice;
let global_Event;
var submitButton;


function pay() {
   let localevent = global_Event;

   noOfTicket = parseInt(noOfTicket);
   totalTickets = parseInt(localevent.ticketQuantity);
   availableTickets = parseInt(localevent.availableTicketQuantity);


   if (availableTickets - noOfTicket >= 0) {
      localevent.availableTicketQuantity = availableTickets - noOfTicket

      stripe.createToken(cardElement).then(function (result) {
         if (result.error) {
            showToast('Valid Card information is required.');
            console.log(result.error.message);
         } else {

            document.getElementById('loaderView').style.visibility = 'visible';
            // Send the token to your server
            var amount = totalAmount * 1000;
            var currency = 'eur';

            var token = result.token.id;
            fetch('http://localhost:3000/pay', {
                  method: 'POST',
                  headers: {
                     'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                     token: token,
                     amount: amount,
                     currency: currency
                  })
               })
               .then(function (response) {
                  if (response.ok) {
                     //save after pay

                     global_Event = localevent;
                     saveToDatabase(global_Event);
                     showToast('Payment Done.');
                     console.log('Payment successful!');
                  } else {
                     showToast('Payment failed.');
                     console.log('Payment failed.');
                  }
               })
               .catch(function (error) {
                  console.error(error);
               }).finally(function () {
                  // Re-enable the submit button
                  document.getElementById('loaderView').style.visibility = 'hidden';
               });
         }
      });
   } else {
      showToast('Tickets Not Available.');
   }
}

function setData(event) {
   if (event) {
      document.getElementById('eventTitle').innerHTML = event.title;
      document.getElementById('eventImage').src = getRandomImageUrl();
      document.getElementById('numTickets').innerHTML = noOfTicket;
      ticketPrice = event.ticketPrice;
      document.getElementById('ticketCost').innerHTML = event.ticketPrice;
      document.getElementById('totalCost').innerHTML = totalAmount;
      // Re-enable the submit button
      submitButton.disabled = false;
      global_Event = event;
   }
}


function getRandomImageUrl() {
   const imageUrls = [
      "https://firebasestorage.googleapis.com/v0/b/artefacto-84a15.appspot.com/o/1683976579377?alt=media&token=26f2f7b1-55d8-4251-bf7c-d531af9b6eb5",
      "https://firebasestorage.googleapis.com/v0/b/artefacto-84a15.appspot.com/o/1683978768600?alt=media&token=40cc7b8d-0b93-4fbc-9054-37438fc8655e",
      "https://firebasestorage.googleapis.com/v0/b/artefacto-84a15.appspot.com/o/1683978796534?alt=media&token=d1e6fe70-a20d-471b-8796-33a349330e98",
      "https://firebasestorage.googleapis.com/v0/b/artefacto-84a15.appspot.com/o/1683978723585?alt=media&token=17cfa75a-7efb-407e-8eee-c29c55d73a37",
      "https://firebasestorage.googleapis.com/v0/b/artefacto-84a15.appspot.com/o/Cultural-Festivals-Around-the-World.jpg?alt=media&token=b708b53a-416d-4f00-8d6e-9aae9f6078f3"
   ];

   const randomIndex = Math.floor(Math.random() * imageUrls.length);
   return imageUrls[randomIndex];
}


function saveToDatabase(event) {
   var ticketId = Date.now();
   let eventId = event.eventId;

   var data = {
      eventId: eventId,
      ticketId: ticketId,
      totalPaid: totalAmount,
      ticketPrice: ticketPrice,
      noOfTicket: noOfTicket,
   };

   //  myApp.create("events/" + eventId, event)
   //  .then(function (response) {
   //     let ref = "users/" + getUserId() + "/tickets/" ;
   //     console.log(ref);
   //     myApp.create(ref + ticketId, data).then(function (response) {
   //           showToast('Booking successful!');
   //           window.location.href = "./mytickets.html"
   //        })
   //        .catch(function (error) {
   //         console.log(error)
   //        });
   //  })
   //  .catch(function (error) {
   //     showToast('Something went wrong.');
   //  });


   myApp.create("events/" + eventId, event)
      .then(function (response) {
         let userId = getUserId();

         if (userId && ticketId && data && data.eventId) { // Check if eventId exists in data
            let ref = "users/" + userId + "/tickets/" + ticketId;
            console.log(ref);

            // Check if 'tickets' node exists
            myApp.read("users/" + userId + "/tickets", function (snapshot) {
                  if (!snapshot) {
                     // 'tickets' node does not exist, create it
                     myApp.update("users/" + userId, {
                           "tickets": {}
                        })
                        .then(function () {
                           // Create the ticket under 'tickets' node
                           myApp.create(ref, data)
                              .then(function (response) {
                                 showToast('Booking successful!');
                                 window.location.href = "./mytickets.html";
                              })
                              .catch(function (error) {
                                 console.log(error);
                                 showToast('Error while creating ticket.');
                              });
                        })
                        .catch(function (error) {
                           console.log(error);
                           showToast('Error while creating tickets node.');
                        });
                  } else {
                     // 'tickets' node already exists, create the ticket
                     myApp.create(ref, data)
                        .then(function (response) {
                           showToast('Booking successful!');
                           window.location.href = "./mytickets.html";
                        })
                        .catch(function (error) {
                           console.log(error);
                           showToast('Error while creating ticket.');
                        });
                  }
               })
               .catch(function (error) {
                  console.log(error);
                  showToast('Error while checking tickets node.');
               });
         } else {
            showToast('Some required values are missing or eventId is undefined.');
         }
      })
      .catch(function (error) {
         console.log(error);
         showToast('Something went wrong.');
      });


}


$(document).ready(function () {

   // Disable the submit button while processing
   submitButton = document.getElementById('pay-button');
   submitButton.disabled = true;

   var paymentForm = document.getElementById('payment-form');
   paymentForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the form from submitting
      pay();
   });

   const queryString = window.location.search;
   const urlParams = new URLSearchParams(queryString);
   var uid = urlParams.get('eventId')
   noOfTicket = urlParams.get('noOfTicket')
   totalAmount = urlParams.get('totalAmount')
   myApp.read("events/" + uid, setData);

});