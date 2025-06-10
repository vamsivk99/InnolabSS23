document.addEventListener('DOMContentLoaded', function() {
    let userID = getUserId();
    // Reference to your tickets data in Firebase Database
    let ref = "users/" + userID + "/tickets/";
    var ticketsRef = myApp.ref(ref);
  
    // Fetch the tickets data
    ticketsRef.on('value', function(snapshot) {
      var tickets = snapshot.val();
  
      var finalHtml = '';
  
      if (!tickets || tickets.length === 0) {
        finalHtml = '<div class="row">';
        finalHtml += '<div class="col-md-12 text-center noResults">No Result Found</div>';
        finalHtml += '</div>';
        document.getElementById('tickets-container').innerHTML = finalHtml;
      } else {
        // Clear existing tickets
        $('#tickets-container').empty();
  
        // Iterate through the tickets and append them to the tickets container
        for (var id in tickets) {
          (function() {
            var ticket = tickets[id];
  
            myApp.read("events/" + ticket.eventId, function(event) {
              let tempID = id;
              ticket.imageUrl = event.eventPicture;
              if (!ticket.imageUrl) {
                ticket.imageUrl = getRandomImageUrl();
              }
  
              // Append the ticket to the tickets container
              $('#tickets-container').append(
                '<div id="ticket-' + id + '" class="ticket">' +
                '<div class="ticket-img-container">' +
                '<img src="' + ticket.imageUrl + '" class="ticket-img"/>' +
                '<p class="ticket-img-name">' + event.title + '</p>' +
                '</div>' +
                '<hr class="horizontal-line"/>' +
                '<div class="ticket-description-container">' +
                '<p class="ticket-description">' +
                'Event Description: ' + event.description +
                '</p>' +
                '<p class="ticket-description">' +
                'Event Date: ' + event.fromDate +
                '</p>' +
                '<p class="ticket-description">' +
                'Event Time: ' + event.addressLine1 + ',' + event.zipCode + ',' + event.city +
                '</p>' +
                '</div>' +
                '<div class="ticket-price-container">' +
                'Quantity: ' + ticket.noOfTicket +
                '</p>' +
                '<p class="price-btn">' +
                'Price: ' + ticket.totalPaid +
                '</p>' +
                '<div id="qrcode' + ticket.ticketId + '" style="width:100px; height:100px; margin-top:5px;"> </div>' +
                '</div>' +
                '</div>'
              );
  
              // Immediately invoke a function to capture the current values of tempID and event ID
              (function(ticID, eID) {
                makeCode(ticID, eID);
              })('qrcode' + ticket.ticketId, ticket.eventId);
            });
          })();
        }
      }
    });
  });
  
  function makeCode(ticID, eID) {
    console.log(ticID);
    let elementQR = document.getElementById(ticID);
    var qrcode = new QRCode(elementQR, {
      width: 100,
      height: 100
    });
    qrcode.makeCode(eID);
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
  
