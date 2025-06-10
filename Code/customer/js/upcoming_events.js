var loaderCount = 9;
var gloabalEventsData = {};
var total = 0;
var finalHtml = '';

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
      '<div class="col-md-4 col-sm-12 col-lg-4" onclick="goToEventDescription(\'' + upcommingList[k].eventId + '\')">' +
        '<div class="website-artefacto-group121" style="justify-content: center;">' +
        '<div class="website-artefacto-group103">' +
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
        '<div class="col-md-4 col-sm-12 col-lg-4" onclick="goToEventDescription(\'' + upcommingList2[k].eventId + '\')">' +
        '<div class="website-artefacto-group121" style="justify-content: center;">' +
        '<div class="website-artefacto-group103">' +
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

   myApp.read("events",populateeventListUpcoming);
