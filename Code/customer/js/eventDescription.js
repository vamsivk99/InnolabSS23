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