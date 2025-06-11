let fb;
let insta;
let twitter;


function eventData(event){
  console.log(event);
  let eventImg = document.getElementById('eventImg');
  eventImg.src = event.eventPicture

  let description = document.getElementById('eventDescriptionShort');  
  description.innerHTML = event.description;
  
  let longDescription = document.getElementById('eventDescriptionLong');  
  longDescription.innerHTML = event.longDescription;

  let todate = document.getElementById('toDate');
  todate.innerHTML= event.toDate  +  ' , ' + event.endTime;

  
  let fromDate = document.getElementById('fromDate');
  fromDate.innerHTML= event.fromDate +  ' , ' + event.startTime;
  
  let evntLocation = document.getElementById('evntLocation');
  evntLocation.innerHTML = event.addressLine1 + ',' + event.zipCode + ',' + event.city
  
  let event_info = document.getElementById('event_info');
  event_info.innerHTML= event.title;
  
  // let category = document.getElementById('eventCategory');
  // category.innerHTML= event.category;
  
  let title = document.getElementById('eventTitle');
  title.innerHTML= event.title;

  let ticketCost= document.getElementById('ticketCost');
  ticketCost.innerHTML = event.ticketPrice;
  tktCost = event.ticketPrice;

  // ticket details
  let eventTicketTitle = document.getElementById('eventTicketTitle');
  eventTicketTitle.innerHTML= event.ticketName;

  let fromDateTicket = document.getElementById('fromDateTicket');
  fromDateTicket.innerHTML= event.fromDate;

  let toDateTicket = document.getElementById('toDateTicket');
  toDateTicket.innerHTML= event.toDate;

  let available = document.getElementById('available');
  available.innerHTML= parseInt(event.ticketQuantity) - parseInt(event.availableTicketQuantity);

  let total = document.getElementById('total');
  total.innerHTML= event.ticketQuantity;


  myApp.read('users/'+event.postedBy, updateDetails);

}

function updateDetails(user){

  let eventPostedBy = document.getElementById('eventPoster');
  eventPostedBy.innerHTML= user.name;

  let eventPosterDetails = document.getElementById('eventPosterDetails');
  eventPosterDetails.innerHTML= user.description;

  let evnetContact = document.getElementById('evnetContact');
  evnetContact.innerHTML= user.phoneNumber;

  let userPicture = document.getElementById('userPicture');
  userPicture.src= user.userPicture
  ;

  const fbCont=document.getElementById('fbCont');
  const inCont= document.getElementById('inCont');
  const twCont = document.getElementById('twCont');
  
  const facebookHandle = document.getElementById("facebookHandle");
  const instagramHandle = document.getElementById("instagramHandle");
  const twitterHandle = document.getElementById("twitterHandle");

 fb = user.socialMediaHandles.facebook;
 insta = user.socialMediaHandles.instagram;
 twitter = user.socialMediaHandles.twitter;

 if(!fb){
  fbCont.style.display = 'none';
 }else{
  facebookHandle.innerHTML =  user.socialMediaHandles.facebook
 }

 if(!insta){
  inCont.style.display = 'none';
 }else{
  instagramHandle.innerHTML = user.socialMediaHandles.instagram
 }

 if(!twitter){
  twCont.style.display = 'none';
 }else{
  twitterHandle.innerHTML = user.socialMediaHandles.twitter
 }

}

// get event details
window.onload = function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var uid = urlParams.get('eventId')
  myApp.read("events/"+uid, eventData);


  // event ticket
// Get the modal element
var myModal = document.getElementById("myModal");

// Get the button that opens the modal
var openModalBtn = document.getElementById("buy_ticket_btn");

// Get the <span> element that closes the modal
var closeBtn = document.getElementsByClassName("close")[0];


// When the user clicks the button, open the modal
openModalBtn.onclick = function() {

  if (isAuthenticated() !== 'false') {
  
    myModal.style.display = "block";  

    // Handle total ticket price
    var ticketqty = document.getElementById("ticketQuantity");
    var ticketCost = document.getElementById('ticketCost').textContent;
    var payCost = document.getElementById('payCost');
    payCost.textContent = Number(ticketCost).toFixed(2);
    var totalCost = document.getElementById('payCostTotal');
    ticketqty.addEventListener('input', function(event) {
    const qty = event.target.value;
    totalCost.textContent = (qty * Number(ticketCost)).toFixed(2);
  });
  
  var qtyplus = document.getElementById("qtyplus");
  qtyplus.addEventListener('click', function(event) {
    const qty = document.getElementById("ticketQuantity").value;
    totalCost.textContent = (qty * Number(ticketCost)).toFixed(2);
  });
  
  var qtyminus = document.getElementById("qtyminus");
  qtyminus.addEventListener('click', function(event) {
    const qty = document.getElementById("ticketQuantity").value;
    totalCost.textContent = (qty * Number(ticketCost)).toFixed(2);
  });
  
  
  }
  else{
    showToast('Sign in To Book Tickets');
  }

}

// When the user clicks on <span> (x), close the modal
closeBtn.onclick = function() {
  myModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == myModal) {
    myModal.style.display = "none";
  }
}

// Handle form submission
var paymentForm = document.getElementById("paymentForm");
paymentForm.addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent the form from submitting

  // Add your code to process the payment here

  // Close the modal after processing the payment
  myModal.style.display = "none";
});

};


// ticket content
function plus(idname){
  var quantity = document.getElementById(idname);
  let val = quantity.value;
  val++;
  quantity.value = val;
}
function minus(idname){
  var quantity = document.getElementById(idname);
  let val = quantity.value;

  if (val > 0) {
    val--;
    quantity.value = val;
  }
}

function paynow(){
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var eventId = urlParams.get('eventId');
  var noOfTicket = document.getElementById("ticketQuantity").value;
  if(parseInt(noOfTicket)>0){
    var totalAmount = document.getElementById("payCostTotal").textContent;
    console.log('ticket cost: ', totalAmount);
    console.log('ticketQuantity: ', noOfTicket);
    var paymentUrl = './payment.html?eventId=' + eventId + '&noOfTicket=' + noOfTicket + '&totalAmount=' + totalAmount; 
    window.location.href =  paymentUrl;   
  }else{
    showToast("Please Select atleast 1 ticket.")
  }
}

// ML Integration for Similar Events
let currentEventId = null;

// Load similar events using ML service
async function loadSimilarEvents() {
    // Get current event ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentEventId = urlParams.get('eventId');
    
    if (!currentEventId) {
        console.log('No event ID found in URL');
        return;
    }
    
    // Track page view
    if (window.mlService && window.mlService.isMLEnabled) {
        window.mlService.trackInteraction(currentEventId, 'view');
        
        try {
            const similarEvents = await window.mlService.getSimilarEvents(currentEventId, 4);
            if (similarEvents && similarEvents.length > 0) {
                displaySimilarEvents(similarEvents);
                document.getElementById('similar-events-section').style.display = 'block';
            } else {
                hideSimilarEventsSection();
            }
        } catch (error) {
            console.error('Error loading similar events:', error);
            hideSimilarEventsSection();
        }
    } else {
        hideSimilarEventsSection();
    }
}

// Display similar events
function displaySimilarEvents(similarEvents) {
    const listContainer = document.getElementById('similar-events-list');
    if (!listContainer) return;
    
    let html = '';
    similarEvents.forEach(similar => {
        const event = similar.event_data;
        const similarity = Math.round(similar.similarity_score * 100);
        
        // Get date parts (using existing utility function if available)
        const date = event.fromDate ? getDayAndMonth(event.fromDate) : { day: 0, month: "X" };
        const image = event.eventPicture || getRandomImageUrl();
        
        html += `
            <div class="col-md-3 col-sm-6 col-lg-3 similar-event-card" onclick="goToSimilarEvent('${event.eventId}')">
                <div class="website-artefacto-group121" style="justify-content: center; position: relative;">
                    <div class="similarity-badge">${similarity}% Similar</div>
                    <div class="website-artefacto-group103">
                        <img src="${image}" alt="Event Image" class="website-artefacto-rectangle124" />
                    </div>
                    <span class="website-artefacto-text087">
                        <span>${event.title}</span>
                    </span>
                    <div class="website-artefacto-text089">
                        <div class="website-artefacto-group112">
                            <span class="website-artefacto-text096">
                                <span>${date.month}</span>
                            </span>
                            <span class="website-artefacto-text098"><span>${date.day}</span></span>
                        </div>
                        <span>
                            <span>${event.description}</span>
                            <br />
                            <span>${event.fromDate} - ${event.toDate}</span>
                            <br />
                        </span>
                    </div>
                    <div class="similarity-reason">
                        <small><i class="fa fa-lightbulb-o"></i> ${similar.reason || 'Similar content and category'}</small>
                    </div>
                </div>
            </div>
        `;
    });
    
    listContainer.innerHTML = html;
}

// Navigate to similar event
function goToSimilarEvent(eventId) {
    // Track the interaction
    if (window.mlService && window.mlService.isMLEnabled) {
        window.mlService.trackInteraction(eventId, 'click_similar');
    }
    
    // Navigate to the event
    window.location.href = `eventDescription.html?eventId=${eventId}`;
}

// Hide similar events section
function hideSimilarEventsSection() {
    const section = document.getElementById('similar-events-section');
    if (section) {
        section.style.display = 'none';
    }
}

// Utility functions (fallbacks if not available elsewhere)
function getDayAndMonth(dateString) {
    if (!dateString) {
        return { day: 0, month: "X" };
    }
    
    try {
        const dateParts = dateString.split(".");
        const month = parseInt(dateParts[0].match(/\d+/)[0]);
        const day = parseInt(dateParts[1], 10);
        
        const monthNames = [
            "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
            "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
        ];
        
        return {
            day: isNaN(day) ? 0 : day,
            month: monthNames[month - 1] || "X"
        };
    } catch (e) {
        return { day: 0, month: "X" };
    }
}

// Add ML styles for similar events
document.addEventListener('DOMContentLoaded', function() {
    const mlStyles = document.createElement('style');
    mlStyles.textContent = `
        .similar-event-card {
            margin-bottom: 20px;
            cursor: pointer;
        }
        
        .similar-event-card .website-artefacto-group121 {
            transition: all 0.3s ease;
            border: 2px solid transparent;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .similar-event-card:hover .website-artefacto-group121 {
            border-color: #007bff;
            box-shadow: 0 8px 25px rgba(0,123,255,0.15);
            transform: translateY(-5px);
        }
        
        .similarity-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: linear-gradient(45deg, #28a745, #20c997);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            z-index: 10;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .similarity-reason {
            margin-top: 10px;
            padding: 8px;
            background: rgba(0,123,255,0.1);
            border-radius: 5px;
            color: #007bff;
            font-style: italic;
            font-size: 12px;
        }
        
        .section-title {
            color: #2c3e50;
            font-weight: 600;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .ml-badge {
            background: linear-gradient(45deg, #ff6b6b, #ffa500);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            margin-left: 10px;
        }
    `;
    document.head.appendChild(mlStyles);
});

function openFB(){

  if(fb){
    window.open(
      'https://www.facebook.com/'+fb,
      '_blank' // <- This is what makes it open in a new window.
    );
  }
}

function openInsta(){
  if(insta){
    window.open(
      'https://www.instagram.com/'+insta,
      '_blank' // <- This is what makes it open in a new window.
    );
  } 
}

function openTwitter(){
  if(twitter){
    window.open(
      'https://twitter.com/'+twitter,
      '_blank' // <- This is what makes it open in a new window.
    );
  }
}

//# sourceMappingURL=eventDescription.js.map