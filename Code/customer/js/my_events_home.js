
var data = {};
var total = 0;
var finalHtml = '';

let prefereces = []
let labels;

// Populate event list
function populateCustomeventList(recomList) {
     
  var count = 0;
  var finalHtml = '';

  if (!recomList || recomList.length === 0) {
    document.getElementById('count').textContent = 0;

    finalHtml = '<div class="row">';
    finalHtml += '<div class="col-md-12 text-center noResults">No Result Found</div>';
    finalHtml += '</div>';
  } else {
    data =[]
    total = Object.keys(recomList).length;

    if(labels){
      for (var k in recomList) {
        if (recomList[k].category && labels.includes(recomList[k].category)) {
          data.push(recomList[k]);
        } 
      }      
    }
    else{

      finalHtml = '<div class="row">';
      finalHtml += '<div class="col-md-12 text-center noResults">No Preferences Found.</div>';
      finalHtml += '</div>';

    }

    recomList = data;
    if (!recomList || recomList.length === 0) {
      finalHtml = '<div class="row">';
      finalHtml += '<div class="col-md-12 text-center noResults">No Prefered Event Found.</div>';
      finalHtml += '</div>';
    }else{
          // Final html
    finalHtml = '<div class="row">';

    // Create final HTML
    for (var k in recomList) {
      count++;
      var result = {};
      const date = recomList[k].fromDate;
      if (!date) {
        result = {
          day: 0,
          month: "X"
        }
      } else {
        result = getDayAndMonth(date);
      }

      let image = recomList[k].eventPicture;
      if(!image){
            image = getRandomImageUrl();
      }


      finalHtml +=
      '<div class="col-md-4 col-sm-12 col-lg-4" onclick="goToEventDescription(\'' + recomList[k].eventId + '\')">' +
        '<div class="website-artefacto-group121" style="justify-content: center;">' +
        '<div class="website-artefacto-group103">' +
        '<img src="' + image + '" alt="Rectangle12168" class="website-artefacto-rectangle124" />' +
        '</div>' +
        '<span class="website-artefacto-text087">' +
        '<span>' + recomList[k].title + '</span>' +
        '</span>' +
        '<div class="website-artefacto-text089">' +
        '<div class="website-artefacto-group112">' +
        '<span class="website-artefacto-text096">' +
        '<span>' + result.month + '</span>' +
        '</span>' +
        '<span class="website-artefacto-text098"><span>' + result.day + '</span></span>' +
        '</div>' +
        '<span>' +
        '<span>' + recomList[k].description + '</span>' +
        '<br />' +
        '<span>' + recomList[k].fromDate + ' - ' + recomList[k].toDate + '</span>' +
        '<br />' +
        '</span>' +
        '</div>' +

        '</div>' +
        '</div>';

      if (count == 3) {
        break;
      }
    }

    finalHtml += '</div>';
    }

  }

  // Append final HTML to page
  document.getElementById("recommendList").innerHTML = finalHtml;
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


  let dataLoaderTimeOut;

  function stopTimerCustom(){
    clearTimeout(dataLoaderTimeOut);
  }

  function goToEventDescription(eventId) {
    // Navigate to eventDEscription.html with the provided event ID
    window.location.href = 'eventDescription.html?eventId=' + eventId;
  }


  function loadData(){
    userId =getUserId();
 
     if(userId){
      myApp.read("users/" + userId, function (snapshot) {
        if (snapshot) {
          objects = snapshot.preferences;    
          if(objects){
            labels = objects.map((obj) => obj.label);
          }
        }
        stopTimerCustom();
        myApp.read("events",populateCustomeventList);
      });  
     }
  }

$(document).ready(function () {
    // Check if 'tickets' node exists
    dataLoaderTimeOut = setTimeout(loadData, 500);
});
  

