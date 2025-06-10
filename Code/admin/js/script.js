var loaderCount = 9;
var gloabalEventsData = {};
var total = 0;
var finalHtml = '';

var sliderEvent={}
var events3dList={}

function populateeventListSliderData(sliderEventdb){
  sliderEvent = sliderEventdb;
}

function updateSliderData(sliderEventDb){
  sliderEvent = sliderEventDb;
  populateeventListSlider(gloabalEventsData,sliderEvent);
}

function populateeventList3dEvents(_3dEbents){
  events3dList = _3dEbents;
}

let eventTodelete =  '';
let eventToAdd = '';
let eventToAddData;
let eventToDeteleFromSlider;


// Populate event list
function populateeventListUpcoming(upcommingList) {
  var count = 0;
  var finalHtml = '';

  if (!upcommingList || upcommingList.length === 0) {
    document.getElementById('count').textContent = 0;

    finalHtml = '<div class="row">';
    finalHtml += '<div class="col-md-12 text-center noResults">No Result Found</div>';
    finalHtml += '</div>';

    hideButton();

  } else {
    total = Object.keys(upcommingList).length;
    document.getElementById('count').textContent = total;

    if(total<loaderCount){
      hideButton();
    }else{
      showButton();
    }
    gloabalEventsData = upcommingList;
//    upcommingList = data;

    // Final html
    finalHtml = '<div class="row">';

    // Create final HTML
    for (var k in upcommingList) {
      count++;
      var result = {};
      const date = upcommingList[k].fromDate;
      if (!date) {
        result = {
          day: 0,
          month: "X"
        }
      } else {
        result = getDayAndMonth(date);
      }

      let image = upcommingList[k].eventPicture;
      if(!image){
            image = getRandomImageUrl();
      }

      finalHtml +=
      '<div class="col-md-4 col-sm-12 col-lg-4" >' +
        '<div class="website-artefacto-group121" style="justify-content: center;">' +
        '<button class="delete-button" onclick="openPopupDelete(\'' + upcommingList[k].eventId + '\')"><i class="fa fa-trash" style="color: #000000;"></i></button>' +
        '<button class="delete-button" style="right:50px" onclick="openPopupSlider(\'' + upcommingList[k].eventId + '\', \'' + upcommingList[k] + '\')"><i class="fa fa-sliders" style="color: #000000;"></i></button>' +
        // '<button class="delete-button" style="right:90px" onclick="openPopup3d(\'' + upcommingList[k].eventId + '\')"><i class="fa fa-cube" style="color: #000000;"></i></button>' +
        '<div class="website-artefacto-group103" onclick="goToEventDescription(\'' + upcommingList[k].eventId + '\')">' +
        '<img src="' + image + '" alt="Rectangle12168" class="website-artefacto-rectangle124" />' +
        '</div>' +
        '<span class="website-artefacto-text087">' +
        '<span>' + upcommingList[k].title + '</span>' +
        '</span>' +
        '<div class="website-artefacto-text089">' +
        '<div class="website-artefacto-group112">' +
        '<span class="website-artefacto-text096">' +
        '<span>' + result.month + '</span>' +
        '</span>' +
        '<span class="website-artefacto-text098"><span>' + result.day + '</span></span>' +
        '</div>' +
        '<span>' +
        '<span>' + upcommingList[k].description + '</span>' +
        '<br />' +
        '<span>' + upcommingList[k].fromDate + ' - ' + upcommingList[k].toDate + '</span>' +
        '<br />' +
        '</span>' +
        '</div>' +

        '</div>' +
        '</div>';

      if (count == loaderCount) {
        break;
      }
    }

    finalHtml += '</div>';
  }

  // Append final HTML to page
  document.getElementById("list").innerHTML = finalHtml;

  populateeventListSlider(gloabalEventsData,sliderEvent);
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
  
  
  
  function getDayAndMonth(dateString) {
    if (!dateString) {
      return {
        day: 0,
        month: "X"
      };
    }
  
    const dateParts = dateString.split(".");
    // const month = parseInt(dateParts[0], 10);
    var month = parseInt(dateParts[0].match(/\d+/)[0]);
    var day = parseInt(dateParts[1], 10);
 
    if (isNaN(day)) {
      var dayMatch = dateString.match(/\d{2}/);
      day = dayMatch ? parseInt(dayMatch[0], 10) : 0;
    }
  
  
    // Define an array of month names in English
    const monthNames = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];
  
    const monthInEnglish = monthNames[month - 1]; // Adjusting for zero-based indexing
  
    return {
      day,
      month: monthInEnglish
    };
  }


// DROP DOWN MENU

document.addEventListener("click", function(event) {
  const dropdowns = document.querySelectorAll(".dropdown");
  dropdowns.forEach(function(dropdown) {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove("open");
    }
  });
});

const dropdownBtns = document.querySelectorAll(".dropdown-btn");
dropdownBtns.forEach(function(dropdownBtn) {
  dropdownBtn.addEventListener("click", function() {
    const dropdown = this.closest(".dropdown");
    dropdown.classList.toggle("open");
  });
});

const dropdownItems = document.querySelectorAll(".dropdown-menu li");
dropdownItems.forEach(function(item) {
  item.addEventListener("click", function() {
    const dropdown = this.closest(".dropdown");
    const button = dropdown.querySelector(".dropdown-btn");
    const placeholder = button.querySelector(".dropdown-placeholder");
    const selectedItem = this.textContent;
    const placeholderId = placeholder.id;


    //placeholder.textContent = selectedItem;
    dropdown.classList.remove("open"); 
    console.log(selectedItem);
    console.log(placeholderId);

    if(placeholderId.includes("eventCategory")){
      loaderCount = 9;
      if(selectedItem === "All"){
        populateeventListUpcoming(gloabalEventsData); 
      }else{
       displayFilteredByCategory(selectedItem);
      }
    }
    else if(placeholderId.includes("eventPlace")){
        loaderCount = 9;

       if(selectedItem === "All"){
        populateeventListUpcoming(gloabalEventsData); 
       }else{
        displayFilteredByPlace(selectedItem);
       }
    }

  });
});
 

function loadmore(){
  loaderCount += 9;
  if(loaderCount<total){
    populateeventListUpcoming(gloabalEventsData);
  }if(loaderCount>=total){
    loaderCount = total;
    populateeventListUpcoming(gloabalEventsData);
    //hide loadmore
    hideButton();
  }
}

function hideButton() {
  var button = document.getElementById('laodMoreBtn');
  button.style.display = "none";
}


function showButton() {
  var button = document.getElementById('laodMoreBtn');
  button.style.display = "block";
}


function displayFilteredByCategory(selectedItem) {
  var filteredList = [];

  for (var k in gloabalEventsData) {
    if (gloabalEventsData[k].category) {
      var tempLoc = gloabalEventsData[k].category;
      if (tempLoc.includes(selectedItem)) {
        filteredList.push(gloabalEventsData[k]);
      }
    }
  }
  // Call the function to populate the event list with the filtered items
  populateFilteredData(filteredList);
}


function displayFilteredByPlace(selectedItem){
  var filteredList = [];
  for (var k in gloabalEventsData) {
    if (gloabalEventsData[k].city) {
      var tempLoc = gloabalEventsData[k].city;
      if (tempLoc.includes(selectedItem)) {
        filteredList.push(gloabalEventsData[k]);
      }
    }
  }
  // Call the function to populate the event list with the filtered items
  populateFilteredData(filteredList);
  
}


function displayFilteredBySearch(selectedItem){
  var filteredList = [];

  for (var k in gloabalEventsData) {
    if (gloabalEventsData[k].title) {
      var tempTitle = gloabalEventsData[k].title;
      if (tempTitle.includes(selectedItem)) {
        filteredList.push(gloabalEventsData[k]);
      }
    }
  }
  // Call the function to populate the event list with the filtered items
  populateFilteredData(filteredList);
  
}


function populateFilteredData(upcommingList2){
  var count = 0;
  var finalHtml = '';

  if (!upcommingList2 || upcommingList2.length === 0) {
    document.getElementById('count').textContent = 0;

    finalHtml = '<div class="row">';
    finalHtml += '<div class="col-md-12 text-center noResults">No Result Found</div>';
    finalHtml += '</div>';

    hideButton();

  } else {
    total = Object.keys(upcommingList2).length;
    document.getElementById('count').textContent = total;

    if(total<loaderCount){
      hideButton();
    }else{
      showButton();
    }
    // Final html
    finalHtml = '<div class="row">';

    // Create final HTML
    for (var k in upcommingList2) {
      count++;
      var result = {};
      const date = upcommingList2[k].fromDate;
      if (!date) {
        result = {
          day: 0,
          month: "X"
        }
      } else {
        result = getDayAndMonth(date);
      }

      let image = upcommingList2[k].eventPicture;
      if(!image){
            image = getRandomImageUrl();
      }

      finalHtml +=
        '<div class="col-md-4 col-sm-12 col-lg-4">' +
        '<div class="website-artefacto-group121" style="justify-content: center;">' +
        '<button class="delete-button" onclick="openPopupDelete(\'' + upcommingList2[k].eventId + '\')"><i class="fa fa-trash" style="color: #000000;"></i></button>' +
        '<button class="delete-button" style="right:50px" onclick="openPopupSlider(\'' + upcommingList2[k].eventId + '\', \'' + upcommingList2[k] + '\')"><i class="fa fa-sliders" style="color: #000000;"></i></button>' +
        // '<button class="delete-button" style="right:90px" onclick="openPopup3d(\'' + upcommingList2[k].eventId + '\')"><i class="fa fa-cube" style="color: #000000;"></i></button>' +
        '<div class="website-artefacto-group103" onclick="goToEventDescription(\'' + upcommingList2[k].eventId + '\')">' +
        '<img src="' + image + '" alt="Rectangle12168" class="website-artefacto-rectangle124" />' +
        '</div>' +
        '<span class="website-artefacto-text087">' +
        '<span>' + upcommingList2[k].title + '</span>' +
        '</span>' +
        '<div class="website-artefacto-text089">' +
        '<div class="website-artefacto-group112">' +
        '<span class="website-artefacto-text096">' +
        '<span>' + result.month + '</span>' +
        '</span>' +
        '<span class="website-artefacto-text098"><span>' + result.day + '</span></span>' +
        '</div>' +
        '<span>' +
        '<span>' + upcommingList2[k].description + '</span>' +
        '<br />' +
        '<span>' + upcommingList2[k].fromDate + ' - ' + upcommingList2[k].toDate + '</span>' +
        '<br />' +
        '</span>' +
        '</div>' +

        '</div>' +
        '</div>';

      if (count == loaderCount) {
        break;
      }
    }

    finalHtml += '</div>';
  }

  // Append final HTML to page
  document.getElementById("list").innerHTML = finalHtml;
}


function resetUpcomingEventsList(){
  populateeventListUpcoming(gloabalEventsData);
}


  // Populate list
  // window.onload = function() {
  //   console.log('on')  
  //  };


  function goToEventDescription(eventId) {
    // Navigate to eventDEscription.html with the provided event ID
    window.location.href = 'eventDescription.html?eventId=' + eventId;
  }


//   // Function to open the popup
// function openPopup(eventId) {
//     eventTodelete = eventId
//     popupContainer.style.display = 'flex';
// }

// // Function to close the popup
// function closePopup() {
//     popupContainer.style.display = 'none';
// }

// // Get references to the popup and buttons
// let popupContainer;
// let btnYes;
// let btnCancel;


// // Event listener for opening the popup
// document.addEventListener('DOMContentLoaded', () => {
//     popupContainer = document.getElementById('popup-container');
//     btnYes = document.getElementById('btn-yes');
//     btnCancel = document.getElementById('btn-cancel');

//        // const openPopupButton = document.getElementById('open-popup-button');
//        // openPopupButton.addEventListener('click', openPopup);

//        // Event listener for the "Yes" button
//        btnYes.addEventListener('click', () => {
//            deleteEvent(eventTodelete);
//        closePopup();
//        });

//        // Event listener for the "Cancel" button
//        btnCancel.addEventListener('click', closePopup);
   
// });



// Function to open the popup
function openPopup(popupId) {
  const popupContainer = document.getElementById(popupId);
  if (!popupContainer) {
    console.error(`Popup container with ID "${popupId}" not found.`);
    return;
  }
  popupContainer.style.display = 'flex';
}

// Function to close the popup
function closePopup(popupId) {
  const popupContainer = document.getElementById(popupId);
  if (!popupContainer) {
    console.error(`Popup container with ID "${popupId}" not found.`);
    return;
  }
  popupContainer.style.display = 'none';
}

// Event listener for opening the popup
document.addEventListener('DOMContentLoaded', () => {
  // Get all the popup containers
  const popupContainers = document.querySelectorAll('.popup-container');

  // Loop through each popup container
  popupContainers.forEach((popupContainer) => {
    const btnYes = popupContainer.querySelector('.btn-yes');
    const btnCancel = popupContainer.querySelector('.btn-cancel');

    // Event listener for the "Yes" button
    btnYes.addEventListener('click', () => {
      // Perform the appropriate action based on the popup container
      const popupId = popupContainer.id;
      if (popupId === 'popup-container') {
        // Handle "Yes" button click for the delete event scenario
        // Delete the event
        deleteEvent(eventTodelete);
      } else if (popupId === 'popup-container-slider') {
        const positionDropdown = popupContainer.querySelector('#position-dropdown');
        const selectedPosition = positionDropdown.value;
        console.log(`Adding image at position ${selectedPosition}`);
        addEventToSliderList(selectedPosition, eventToAdd);
      }
      else if(popupId ===  'popup-container-slider-delete'){
        deleteEventSlider(eventToDeteleFromSlider);
      }

      closePopup(popupId);
    });

    // Event listener for the "Cancel" button
    btnCancel.addEventListener('click', () => {
      const popupId = popupContainer.id;
      closePopup(popupId);
    });
  });
});



function deleteEvent(eventID) {

  for (const eventKey in sliderEvent) {
    if (sliderEvent.hasOwnProperty(eventKey)) {
      const event = sliderEvent[eventKey];
      const pos = event.pos;
      const eid = event.eventId;
 
      if(eid == eventID)
      {
        showToast("Please remove from slider first to delete this event.");
        flag= false;
        break;
      }
    }
  }

  if(flag){
    // Create path
    var path = "events/"+eventID;

    // Delete event
    myApp.delete(path);
    // Populate the list again
    myApp.read("events",populateeventListUpcoming);
  }

}

// function goToAddEvent(){
//     let e_id = getUserId();
//     let linkAddMyEvent = "./add_My_Event.html?pb=" + e_id;
//     window.location.href = linkAddMyEvent;
// }


function openPopupDelete(id){
  eventTodelete = id;
  openPopup('popup-container');
}


function openPopupDeleteSlider(id){
  // eventTodelete = id;
  eventToDeteleFromSlider = id;
  openPopup('popup-container-slider-delete');
}



function openPopupSlider(id, evetData){
  eventToAdd = id;
  eventToAddData = evetData;
  openPopup('popup-container-slider');
}

function openPopup3d(id){
  openPopup('popup-container-3d');
}

// //////////////////////////////////////////////////////////
// SLider Evnts

// Populate event list
function populateeventListSlider(gloabalEventsData, sliderEvent) {
  var count = 0;
  var finalHtml = '';


  const eventIdsArray = [];

// Loop through each event in the `sliderEvent` object and extract the eventId
for (const eventKey in sliderEvent) {
  if (sliderEvent.hasOwnProperty(eventKey)) {
    const event = sliderEvent[eventKey];
    const eventId = event.eventId;
    eventIdsArray.push(eventId);
  }
}


  if (!gloabalEventsData || gloabalEventsData.length === 0) {
    document.getElementById('count').textContent = 0;

    finalHtml = '<div class="row">';
    finalHtml += '<div class="col-md-12 text-center noResults">No Result Found</div>';
    finalHtml += '</div>';

    hideButton();

  } else {
    total = Object.keys(gloabalEventsData).length;
    document.getElementById('count').textContent = total;

    if(total<loaderCount){
      hideButton();
    }else{
      showButton();
    }

    // Final html
    finalHtml = '<div class="row">';

    // Create final HTML
    for (var k in gloabalEventsData) {

      var eventIDToCheck = gloabalEventsData[k].eventId;
      if (!eventIdsArray.includes(eventIDToCheck)) {
        continue;
      }

      count++;
      var result = {};
      const date = gloabalEventsData[k].fromDate;
      if (!date) {
        result = {
          day: 0,
          month: "X"
        }
      } else {
        result = getDayAndMonth(date);
      }

      let image = gloabalEventsData[k].eventPicture;
      if(!image){
            image = getRandomImageUrl();
      }


      finalHtml +=
      '<div class="col-md-4 col-sm-12 col-lg-4" >' +
        '<div class="website-artefacto-group121" style="justify-content: center;">' +
        '<button class="delete-button" onclick="openPopupDeleteSlider(\'' + gloabalEventsData[k].eventId + '\')"><i class="fa fa-trash" style="color: #000000;"></i></button>' +
        '<div class="website-artefacto-group103" onclick="goToEventDescription(\'' + gloabalEventsData[k].eventId + '\')">' +
        '<img src="' + image + '" alt="Rectangle12168" class="website-artefacto-rectangle124" />' +
        '</div>' +
        '<span class="website-artefacto-text087">' +
        '<span>' + gloabalEventsData[k].title + '</span>' +
        '</span>' +
        '<div class="website-artefacto-text089">' +
        '<div class="website-artefacto-group112">' +
        '<span class="website-artefacto-text096">' +
        '<span>' + result.month + '</span>' +
        '</span>' +
        '<span class="website-artefacto-text098"><span>' + result.day + '</span></span>' +
        '</div>' +
        '<span>' +
        '<span>' + gloabalEventsData[k].description + '</span>' +
        '<br />' +
        '<span>' + gloabalEventsData[k].fromDate + ' - ' + gloabalEventsData[k].toDate + '</span>' +
        '<br />' +
        '</span>' +
        '</div>' +

        '</div>' +
        '</div>';

      if (count == loaderCount) {
        break;
      }
    }

    finalHtml += '</div>';
  }

  // Append final HTML to page
  document.getElementById("sliderList").innerHTML = finalHtml;
}


function addEventToSliderList(selectedPosition, eventId){
  let flag = true;
  
  selectedPosition = parseInt(selectedPosition);
  eventId = parseInt(eventId);


  for (const eventKey in sliderEvent) {
    if (sliderEvent.hasOwnProperty(eventKey)) {
      const event = sliderEvent[eventKey];
      const pos = event.pos;
      const eid = event.eventId;
 
      if(eid == eventId)
      {
        showToast("Event Already Added.");
        flag= false;
        break;
      }


      if(pos === selectedPosition){
        flag = false;
        showToast("Position Already Occupied.");
        break;
      }
 
    }
  }

 let dataToUpload = gloabalEventsData[eventId]

  let sliderData ={
    description: dataToUpload.description,
    eventId:dataToUpload.eventId,
    image: dataToUpload.eventPicture,
    pos: selectedPosition,
    title:dataToUpload.title    
  }

  if(flag){
    let ref = "sliderNew/" + "event"+selectedPosition;
    myApp.create(ref, sliderData)
    .then(function (response) {
      myApp.read("sliderNew",updateSliderData);    

    })
    .catch(function (error) {
    });
  }
}

function deleteEventSlider(eventId) {
  eventId = parseInt(eventId);

  if(Object.keys(sliderEvent).length  === 1){
    showToast("You Must have atlease one event in the slider for working properly.");
  }else{

    let pos = -1;
    for (const eventKey in sliderEvent) {
      if (sliderEvent.hasOwnProperty(eventKey)) {
        const event = sliderEvent[eventKey];
        const eid = event.eventId;
        
        if(eid === eventId){
          pos = event.pos;
          break;
        }  
      }
    }

    if(pos>0){
      var path = "sliderNew/" + "event"+pos;
      // Delete event
      myApp.delete(path);
      delete sliderEvent["event"+pos]
      myApp.read("sliderNew",updateSliderData); 
    }
  }
}
