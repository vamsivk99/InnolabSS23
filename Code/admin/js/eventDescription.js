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
  
  // let event_info = document.getElementById('event_info');
  // event_info.innerHTML= event.title;
  
  // let category = document.getElementById('eventCategory');
  // category.innerHTML= event.category;
  
  let title = document.getElementById('eventTitle');
  title.innerHTML= event.title;

  // let ticketCost= document.getElementById('ticketCost');
  // ticketCost.innerHTML = event.ticketPrice;
  // tktCost = event.ticketPrice;

  // ticket details
  // let eventTicketTitle = document.getElementById('eventTicketTitle');
  // eventTicketTitle.innerHTML= event.ticketName;

  // let fromDateTicket = document.getElementById('fromDateTicket');
  // fromDateTicket.innerHTML= event.fromDate;

  // let toDateTicket = document.getElementById('toDateTicket');
  // toDateTicket.innerHTML= event.toDate;

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