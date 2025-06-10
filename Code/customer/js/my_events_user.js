var loaderCount = 9;
var data = {};
var total = 0;
var finalHtml = '';


function goToAddEvent(){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);      
    var e_id = urlParams.get('pb')
    let linkAddMyEvent = "./add_My_Event.html?pb=" + e_id;
    window.location.href = linkAddMyEvent;
}

// Populate event list
function populateeventList(list) {
    var count = 0;
    var finalHtml = '';

    if (!list || Object.keys(list).length === 0) {
        document.getElementById('count').textContent = 0;

        finalHtml = '<div class="row">';
        finalHtml += '<div class="col-md-12 text-center noResults">No Result Found</div>';
        finalHtml += '</div>';

        hideButton();
    } else {
         var filteredList = list;
        var total = Object.keys(filteredList).length;
        document.getElementById('count').textContent = total;
        
        if (total < loaderCount) {
            hideButton();
        } else {
            showButton();
        }

        // Final html
        finalHtml = '<div class="row">';

        // Create final HTML
        for (var k in filteredList) {
            count++;
            var result = {};
            const date = filteredList[k].fromDate;
            if (!date) {
                result = {
                    day: 0,
                    month: "X"
                };
            } else {
                result = getDayAndMonth(date);
            }

            let image = list[k].eventPicture;
            if(!image){
                  image = getRandomImageUrl();
            }
      

            finalHtml +=

                '<div class="col-md-4 col-sm-12 col-lg-4">' +
                '<div class="website-artefacto-group121" style="justify-content: center;">' +
                '<button class="delete-button" onclick="openPopup(\'' + filteredList[k].eventId + '\')"><i class="fa fa-trash" style="color: #000000;"></i></button>' +
                '<button class="edit-button" onclick="editEvent(\'' + filteredList[k].eventId + '\')"><i class="fa fa-edit" style="color: #000000;"></i></button>' +
                '<div class="website-artefacto-group103"  onclick="goToEventDescription(\'' + filteredList[k].eventId + '\')">' +
                '<img src="' + image + '" alt="Rectangle12168" class="website-artefacto-rectangle124" />' +
                '</div>' +
                '<span class="website-artefacto-text087">' +
                '<span>' + filteredList[k].title + '</span>' +
                '</span>' +
                '<div class="website-artefacto-text089">' +
                '<div class="website-artefacto-group112">' +
                '<span class="website-artefacto-text096">' +
                '<span>' + result.month + '</span>' +
                '</span>' +
                '<span class="website-artefacto-text098"><span>' + result.day + '</span></span>' +
                '</div>' +
                '<span>' +
                '<span>' + filteredList[k].description + '</span>' +
                '<br />' +
                '<span>' + filteredList[k].fromDate + ' - ' + filteredList[k].toDate + '</span>' +
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
    document.getElementById("myAddedEventlist").innerHTML = finalHtml;
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

function loadmore() {
    loaderCount += 9;
    if (loaderCount < total) {
        populateeventList(data);
    } if (loaderCount >= total) {
        loaderCount = total;
        populateeventList(data);
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



function goToEventDescription(eventId) {
    // Navigate to eventDEscription.html with the provided event ID
    window.location.href = 'eventDescription.html?eventId=' + eventId;
}



function deleteEvent(eventID) {
    let flag = true;
    var sliderEvent = JSON.parse(window.localStorage.getItem("slider"));
    if (sliderEvent) {
        for (let i = 0; i < sliderEvent.length; i++) {
        const event = sliderEvent[i];

        const  str = event.link;
        const regex = /eventId=(\d+)/;
        const match = str.match(regex);

        const eid = match[1];
          if (eid == eventID) {
            showToast("Please ask admin to remove this event slider before deleting this event.");
            flag = false;
            break;
          }
        }
            
          if(flag){
            // Create path
            var path = "events/"+eventID;
        
            // Delete event
            myApp.delete(path);
            
            // Populate the list again
            // myApp.read("events",populateeventListUpcoming);
            
            // // Populate the list again
            fetchEventsByPostedBy();
          }
    
    }else{
        showToast("Something went wrong");
    }  

    // // Create path
    // var path = "events/"+eventID;

    // // Delete event
    // myApp.delete(path);

    // // Populate the list again
    // fetchEventsByPostedBy();
}



function fetchEventsByPostedBy() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);      
    var e_id = urlParams.get('pb')

    var eventsRef = myApp.ref('events');
    
    return eventsRef
      .orderByChild('postedBy')
      .equalTo(e_id)
      .once('value')
      .then(function(snapshot) {
        var events = snapshot.val();
  
        // Perform additional actions with the events data
        console.log(events);
        populateeventList(events); 
        return events;
      })
      .catch(function(error) {
        // Handle any errors that occurred during the data retrieval
        console.error(error);
        throw error;
      });
  }
  

  fetchEventsByPostedBy();



/*

function filterEventsByPostedBy(selectedItem) {
    var filteredList = [];

    for (var k in data) {
        if (data[k].postedBy) {
            var tempPostedby = data[k].pos;
            if (tempPostedby.includes(selectedItem)) {
                filteredList.push(data[k]);
            }
        }
    }
    // Call the function to populate the event list with the filtered items
    populateFilteredData(filteredList);

}


*/


let eventTodelete =  ''


// Function to open the popup
function openPopup(eventId) {
    eventTodelete = eventId
    popupContainer.style.display = 'flex';
}

// Function to close the popup
function closePopup() {
    popupContainer.style.display = 'none';
}


function editEvent(){
}


function editEvent(eventID) {
    window.location.href = "./update_My_Event.html?eventId="+eventID;
}

// Get references to the popup and buttons
let popupContainer;
let btnYes;
let btnCancel;


// Event listener for opening the popup
document.addEventListener('DOMContentLoaded', () => {
     popupContainer = document.getElementById('popup-container');
     btnYes = document.getElementById('btn-yes');
     btnCancel = document.getElementById('btn-cancel');

        // const openPopupButton = document.getElementById('open-popup-button');
        // openPopupButton.addEventListener('click', openPopup);

        // Event listener for the "Yes" button
        btnYes.addEventListener('click', () => {
            deleteEvent(eventTodelete);
        closePopup();
        });

        // Event listener for the "Cancel" button
        btnCancel.addEventListener('click', closePopup);
    
});

