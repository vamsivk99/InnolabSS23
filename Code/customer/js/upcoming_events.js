var loaderCount = 9;
var gloabalEventsData = {};
var total = 0;
var finalHtml = '';

// ML Integration variables
var mlRecommendations = [];
var isMLEnabled = false;

// ML Enhancement Functions
var trendingEvents = [];
var demandPredictions = {};

// Populate event list with ML enhancements
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

    // Check if ML service is available and get trending events
    if (window.mlService && window.mlService.isMLEnabled) {
      enhanceEventsWithML(upcommingList);
    }

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

      // Check if this event is trending or has ML enhancements
      const mlEnhancements = getMLEnhancementsForEvent(upcommingList[k].eventId);

      finalHtml +=
      '<div class="col-md-4 col-sm-12 col-lg-4" onclick="goToEventDescriptionML(\'' + upcommingList[k].eventId + '\')">' +
        '<div class="website-artefacto-group121" style="justify-content: center; position: relative;">' +
        mlEnhancements.badges +
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
        mlEnhancements.footer +
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

  // Enhanced event description navigation with ML tracking
  function goToEventDescriptionML(eventId) {
    // Track the interaction if ML service is available
    if (window.mlService && window.mlService.isMLEnabled) {
        window.mlService.trackInteraction(eventId, 'click');
    }
    
    // Navigate to event description (fallback to existing function)
    if (typeof goToEventDescription === 'function') {
        goToEventDescription(eventId);
    } else {
        // Direct navigation if function doesn't exist
        window.location.href = `eventDescription.html?eventId=${eventId}`;
    }
}

// Enhance events with ML data
async function enhanceEventsWithML(events) {
    if (!window.mlService || !window.mlService.isMLEnabled) return;
    
    try {
        // Get trending events
        const trending = await window.mlService.getTrendingEvents();
        if (trending && trending.length > 0) {
            trendingEvents = trending;
        }
        
        // Get demand predictions for visible events
        const eventIds = Object.keys(events).slice(0, loaderCount);
        for (const eventId of eventIds) {
            try {
                const prediction = await window.mlService.getEventDemandPrediction({
                    event_id: eventId,
                    title: events[eventId].title,
                    category: events[eventId].category,
                    city: events[eventId].city,
                    fromDate: events[eventId].fromDate
                });
                
                if (prediction && prediction.predicted_demand) {
                    demandPredictions[eventId] = prediction.predicted_demand;
                }
            } catch (e) {
                // Skip individual prediction errors
                console.debug(`Skipping prediction for event ${eventId}:`, e);
            }
        }
    } catch (error) {
        console.warn('Error enhancing events with ML:', error);
    }
}

// Get ML enhancements for a specific event
function getMLEnhancementsForEvent(eventId) {
    let badges = '';
    let footer = '';
    
    // Add trending badge
    if (trendingEvents.includes(eventId)) {
        badges += '<div class="trending-badge"><i class="fa fa-fire"></i> Trending</div>';
    }
    
    // Add demand prediction badge
    if (demandPredictions[eventId]) {
        const demand = Math.round(demandPredictions[eventId]);
        const demandLevel = demand > 80 ? 'high' : demand > 50 ? 'medium' : 'low';
        const demandColor = demand > 80 ? '#ff4757' : demand > 50 ? '#ffa502' : '#2ecc71';
        
        badges += `<div class="demand-badge" style="background-color: ${demandColor}">
                    <i class="fa fa-users"></i> ${demand}% Expected
                   </div>`;
    }
    
    return { badges, footer };
}

// Add ML-enhanced search functionality
function searchEventsWithML(query) {
    if (!window.mlService || !window.mlService.isMLEnabled || !query.trim()) {
        // Fallback to existing search
        displayFilteredBySearch(query);
        return;
    }
    
    // Use ML-enhanced search
    window.mlService.searchEventsML(query, {
        category: document.getElementById('eventCategory').textContent,
        place: document.getElementById('eventPlace').textContent
    }).then(results => {
        if (results && results.length > 0) {
            // Convert ML results to format expected by existing functions
            const formattedResults = {};
            results.forEach((result, index) => {
                formattedResults[index] = result.event_data;
            });
            populateFilteredData(formattedResults);
            
            // Show ML search indicator
            showMLSearchIndicator(query, results.length);
        } else {
            // Fallback to regular search
            displayFilteredBySearch(query);
        }
    }).catch(error => {
        console.error('ML search failed, using fallback:', error);
        displayFilteredBySearch(query);
    });
}

// Show ML search enhancement indicator
function showMLSearchIndicator(query, resultCount) {
    const existingIndicator = document.querySelector('.ml-search-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    const indicator = document.createElement('div');
    indicator.className = 'ml-search-indicator';
    indicator.innerHTML = `
        <div class="ml-search-enhancement">
            <i class="fa fa-magic" style="color: #007bff; margin-right: 8px;"></i>
            <strong>AI-Enhanced Search Results</strong> for "${query}" (${resultCount} personalized matches)
            <button onclick="this.parentElement.parentElement.remove()" style="float: right; border: none; background: none; color: #666;">×</button>
        </div>
    `;
    
    const listContainer = document.getElementById('list');
    if (listContainer) {
        listContainer.parentNode.insertBefore(indicator, listContainer);
    }
}

// Initialize ML features when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add ML-enhanced styles
    const mlStyles = document.createElement('style');
    mlStyles.textContent = `
        .trending-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            background: linear-gradient(45deg, #ff4757, #ff6b6b);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            z-index: 10;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .demand-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            z-index: 10;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .ml-search-indicator {
            margin: 10px 0;
        }
        
        .ml-search-enhancement {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border: 1px solid #2196f3;
            border-radius: 8px;
            padding: 12px 16px;
            margin: 10px 0;
            font-size: 14px;
            color: #1976d2;
        }
        
        .website-artefacto-group121:hover .trending-badge,
        .website-artefacto-group121:hover .demand-badge {
            transform: scale(1.1);
            transition: transform 0.2s ease;
        }
    `;
    document.head.appendChild(mlStyles);
    
    // Initialize ML service integration
    setTimeout(() => {
        if (window.mlService) {
            isMLEnabled = window.mlService.isMLEnabled;
            console.log('ML Integration initialized for upcoming events');
        }
    }, 1000);
});

myApp.read("events",populateeventListUpcoming);
