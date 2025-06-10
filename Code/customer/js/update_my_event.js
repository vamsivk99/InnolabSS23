let eventPictureURL;
let eventIdForUpdate;
let postedByForUpdate;
let availableTicketQuantity;
let isImageChange = false

function replaceSlashWithDot(inputString) {
    var replacedString = inputString.replace(/\//g, '.');
    return replacedString;
  }
  

  window.onload = function () {
   const queryString = window.location.search;
   const urlParams = new URLSearchParams(queryString);
   var uid = urlParams.get('eventId')
   myApp.read("events/"+uid, setEventData); 
 };

 function setEventData(event) {
   // Set values for input fields
   eventIdForUpdate = event.eventId;
   document.getElementById('eventName').value = event.title   ;
   eventPictureURL = event.eventPicture;
   postedByForUpdate = event.postedBy;

   // document.getElementById('eventPicture').value = event.eventPicture;
   document.getElementById('startDate').value = convertDateFormat2(replaceSlashWithDash(convertDateFormat(event.fromDate)));
   document.getElementById('endDate').value = convertDateFormat2(replaceSlashWithDash(convertDateFormat(event.toDate)));
   document.getElementById('startTime').value = event.startTime;
   document.getElementById('endTime').value = event.endTime;
   document.getElementById('addressLine1').value = event.addressLine1;
   document.getElementById('zipCode').value = event.zipCode;
   document.getElementById('city').value = event.city;
   document.getElementById('country').value = event.country;
   document.getElementById('shortDescription').value = event.description;
   document.getElementById('longDescription').value = event.longDescription;
   document.getElementById('ticketName').value = event.ticketName;
   document.getElementById('ticketQuantity').value = event.ticketQuantity;
   document.getElementById('ticketPrice').value = event.ticketPrice;
   

   availableTicketQuantity = event.availableTicketQuantity;

   // Set value for category radio buttons
   const categoryRadios = document.getElementsByName('category');
   for (const radio of categoryRadios) {
     if (radio.value === event.category) {
       radio.checked = true;
       break;
     }
   }
   
   let imageUrl = event.eventPicture;
   if(!imageUrl){
    imageUrl = getRandomImageUrl()
   }
  //  // Load image from URL into the image view
  //  const imageContainer = document.getElementById('eventImage');
  // //  const eventPicture = document.getElementById('eventImage')
  // //  eventPicture.src = imageUrl; //event.eventPicture;
  // imageContainer.addEventListener('load', () => {
  //   // eventPicture.src = '';
  //    imageContainer.appendChild(eventPicture);
  //  });

  const eventPictureInput = document.getElementById('eventPicture');
  const eventImage = document.getElementById('eventImage');
  eventImage.src = imageUrl;

  eventPictureInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      eventImage.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });


 }
 

function submitEvent() {

    // Get the form input values
    var eventName = document.getElementById('eventName').value;
    var eventPicture = document.getElementById('eventPicture').value; // Assuming you want to store the file path
    var startDate = document.getElementById('startDate').value;
    var endDate = document.getElementById('endDate').value;
    var startTime = document.getElementById('startTime').value;
    var endTime = document.getElementById('endTime').value;
    var addressLine1 = document.getElementById('addressLine1').value;
    var zipCode = document.getElementById('zipCode').value;
    var city = document.getElementById('city').value;
    var country = document.getElementById('country').value;
    var shortDescription = document.getElementById('shortDescription').value;
    var longDescription = document.getElementById('longDescription').value;
    var ticketName = document.getElementById('ticketName').value;
    var ticketQuantity = document.getElementById('ticketQuantity').value;
    var ticketPrice = document.getElementById('ticketPrice').value;
    var category = document.querySelector('input[name="category"]:checked');


    eventPicture = document.getElementById("eventPicture").files[0];

    if(!eventPicture){
      isImageChange = false
      eventPicture = eventPictureURL; 
    }
    else{
      isImageChange = true
    }

    if (category === null) {
      // No category selected, set default value to "Others"
      category = "Others";
    } else {
      category = category.value;
    }

   
    var errorMessage = document.getElementById('errorMessage');
    errorMessage.innerText = '';
    // Validate the form inputs
    if (!eventName || !startDate || !endDate || !startTime || !endTime || !addressLine1 || !zipCode || !city || !country || !shortDescription || !longDescription || !ticketName || !ticketQuantity || !ticketPrice) {
       // Display an error message if any required field is missing
       errorMessage.style.display = 'block';
       errorMessage.innerText = 'Please fill in all the required fields.';
       return;
    }
 
    // Create an event object with the form input values
    var e_id = eventIdForUpdate;
    var postedBy = postedByForUpdate;
 
    let fromDate = replaceSlashWithDot(getFormattedDate(startDate));
    let toDate = replaceSlashWithDot(getFormattedDate(endDate));
    var event = {
       eventId:e_id,
       postedBy: postedBy,
       title: eventName,
       category: category,
       eventPicture: eventPicture,
       fromDate: fromDate,
       toDate: toDate,
       startTime: startTime,
       endTime: endTime,
       addressLine1: addressLine1,
       zipCode: zipCode,
       city: city,
       country: country,
       description: shortDescription,
       longDescription: longDescription,
       ticketName: ticketName,
       ticketQuantity: ticketQuantity,
       availableTicketQuantity:availableTicketQuantity,
       ticketPrice: ticketPrice
    };
 
    // Upload image
    //uploadImage(uid+"",image);
 
    document.getElementById('loaderView').style.visibility = 'visible';
    // Create path
    myApp.create("events/" + e_id, event)
       .then(function (response) {
          if(isImageChange){
            var successMessage = document.getElementById('successMessage');
            successMessage.style.display = 'block';
            successMessage.innerText = 'Event submitted successfully. Please wait';
            uploadImage(e_id+"",eventPicture);
      
          }else{
          // Clear the form inputs
          var successMessage = document.getElementById('successMessage');
          successMessage.style.display = 'block';
          successMessage.innerText = 'Event submitted successfully.';

          clearFormInputs();
          goBackToMyEventList();
          }
       })
       .catch(function (error) {
          // Display an error message if the event data cannot be saved
          var errorMessage = document.getElementById('errorMessage');
          errorMessage.style.display = 'block';
          errorMessage.innerText = 'Failed to submit the event. Please try again.';
          console.error(error);
          document.getElementById('loaderView').style.visibility = 'hidden';
       });
 }
 
    
  function clearFormInputs() {
    document.getElementById('eventName').value = '';
    document.getElementById('eventPicture').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
    document.getElementById('addressLine1').value = '';
    document.getElementById('zipCode').value = '';
    document.getElementById('city').value = '';
    document.getElementById('country').value = '';
    document.getElementById('shortDescription').value = '';
    document.getElementById('longDescription').value = '';
    document.getElementById('ticketName').value = '';
    document.getElementById('ticketQuantity').value = '';
    document.getElementById('ticketPrice').value = '';
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
  }
  
// Upload file
function uploadImage(eventId,image){
    
  // Upload image
  myApp.upload(eventId,image,setURL);

}

// Set image URL
function setURL(eventId,url){
  
  // Create path
  var path = "events/" + eventId +"";

  // Update record
  myApp.update(path ,{
      "eventPicture" : url
  });

      document.getElementById('loaderView').style.visibility = 'hidden';
      // Clear the form inputs
      clearFormInputs();
      goBackToMyEventList();
}

function goBackToMyEventList(){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);      
   //  var e_id = urlParams.get('pb')
    let linkAddMyEvent = "./my_events_user.html?pb=" + getUserId();
    window.location.href = linkAddMyEvent;
}

function getFormattedDate(inputValue) {
    var dateParts = inputValue.split('-');
    var year = parseInt(dateParts[0]);
    var month = parseInt(dateParts[1]) - 1; // Adjust month value (0-based index)
    var day = parseInt(dateParts[2]);
    var date = new Date(year, month, day);
 
    var options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
    var formattedDate = date.toLocaleDateString('en-US', options);
 
    return formattedDate;
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

function convertDateFormat(dateString) {
   const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
   const date = new Date(dateString);
   return date.toLocaleDateString('en-US', options);
 }

 
 function replaceSlashWithDash(inputString) {
   var replacedString = inputString.replace(/\//g, '-');
   return replacedString;
 }
 

 function convertDateFormat2(dateString) {
   const dateParts = dateString.split('-');
   const year = dateParts[2];
   const month = dateParts[0].padStart(2, '0');
   const day = dateParts[1].padStart(2, '0');
   return `${year}-${month}-${day}`;
 }
 