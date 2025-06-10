function replaceSlashWithDot(inputString) {
    var replacedString = inputString.replace(/\//g, '.');
    return replacedString;
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

    if (category === null) {
      // No category selected, set default value to "Others"
      category = "Others";
    } else {
      category = category.value;
    }

    eventPicture = document.getElementById("eventPicture").files[0];
  
    var errorMessage = document.getElementById('errorMessage');
    errorMessage.innerText = '';
    // Validate the form inputs
    if (!eventName || !startDate || !endDate || !startTime || !endTime || !addressLine1 || !zipCode || !city || !country || !shortDescription || !longDescription || !ticketName || !ticketQuantity || !ticketPrice || !eventPicture) {
       // Display an error message if any required field is missing
       errorMessage.style.display = 'block';
       errorMessage.innerText = 'Please fill in all the required fields.';
       return;
    }else{

       
    // Create an event object with the form input values
    var e_id = Date.now();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var postedBy = urlParams.get('pb');
 

    let fromDate = replaceSlashWithDot(getFormattedDate(startDate));
    let toDate = replaceSlashWithDot(getFormattedDate(endDate));
    var event = {
       eventId:e_id,
       postedBy: postedBy,
       title: eventName,
       category: category,

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
       availableTicketQuantity:ticketQuantity,
       ticketPrice: ticketPrice
    };
 
    // Upload image

    document.getElementById('loaderView').style.visibility = 'visible';
    // Create path
    myApp.create("events/" + e_id, event)
       .then(function (response) {
          var successMessage = document.getElementById('successMessage');
          successMessage.style.display = 'block';
          successMessage.innerText = 'Event submitted successfully. Please wait';      
          uploadImage(e_id+"",eventPicture);
       })
       .catch(function (error) {
          // Display an error message if the event data cannot be saved
          var errorMessage = document.getElementById('errorMessage');
          errorMessage.style.display = 'block';
          errorMessage.innerText = 'Failed to submit the event. Please try again.';
          document.getElementById('loaderView').style.visibility = 'hidden';
          console.error(error);
       });

    }

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
  
 