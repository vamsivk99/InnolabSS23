// Get the current page URL
var currentPage = window.location.pathname;

// Check if the current page is index.html
if (currentPage.includes("index.html")) {
    // Show the search bar div
    if (document.getElementById("searchBarDiv")) {
        document.getElementById("searchBarDiv").style.visibility = "visible";

        // Get the search icon element
        var searchIcon = document.getElementById("onSearch");
        // Get the input field
        var inputField = document.getElementById("searchContent");

        // Add click event listener
        searchIcon.addEventListener("click", performSearch);


        inputField.addEventListener("keydown", function(event) {
            // Check if the pressed key is the enter key (key code 13)
            if (event.keyCode === 13) {
                performSearch();
            }
            // else if (inputField.value === "") {
            //     toggleSearchIcon();
            // }
        });
    }

} else {
    // Hide the search bar div
    if (document.getElementById("searchBarDiv")) {
        document.getElementById("searchBarDiv").style.visibility = "hidden";
    }
}


// Function to toggle between search icon and cross icon
function toggleSearchIcon() {
if (searchIcon.classList.contains("fa-search")) {
    searchIcon.classList.remove("fa-search");
    searchIcon.classList.add("fa-times");
} else {
    searchIcon.classList.remove("fa-times");
    searchIcon.classList.add("fa-search");
    resetUpcomingEventsList();
}
}


function performSearch() {
if (searchIcon.classList.contains("fa-times")) {
    inputField.value = "";
    toggleSearchIcon();
} else {
    // Get the input value
    var searchValue = inputField.value;

    // Check if the input value is empty
    if (searchValue === "") {
        // Show toast or display an error message
        showToast("Please enter a search query.");
    } else {
        // Log the input value
        console.log("Search query:", searchValue);
        // inputField.value = "";
        displayFilteredBySearch(searchValue);
        toggleSearchIcon();
    }
}
}

function login(){
    window.location.href = "./login.html"; 
}

function singup(){
   window.location.href = "./signup.html"; 
}


function reload(){
    window.location.href = "./index.html"; 
 }


function signOut(){
    logout();
    reloadOnceAfterDelay();
}

function reloadOnceAfterDelay() {
    setTimeout(function() {
        reload();
    }, 500);
  }


$(document).ready(function () {
    // if (isAuthenticated() !== 'false') {
    //     let headerButtons = document.getElementById('headerButtons');
   
    //     let user = getUserId();
    //     let name = getUserName();
    //      name = name.substring(0, name.indexOf(' '));
        
    //     let linkMyEvent = "./my_events_user.html?pb=" + user;
    //     if(!getIsProfileCompleteFlag().includes('false')){
    //         headerButtons.innerHTML = `
    //         <span id='userName' class="nav-button" style='font-weight:bold;'>Hello User</span>
    //         <a id='menubar1' class="nav-button" href="{linkMyEvent}" >My Events</a>
    //         <a id='menubar2' class="nav-button" href="./mytickets.html">My Tickets</a>
    //         <a id='menubar3' class="nav-button" href="./my_profile_viewer.html">My Profile</a>
    //         <button class="nav-button transparent-button" onclick="signOut()">Sign Out</button>`;
    //     }else{
    //         headerButtons.innerHTML = `
    //         <span class="nav-button" style='font-weight:bold;'>Hey User</span>
    //         <button class="nav-button transparent-button" onclick="signOut()">Sign Out</button>`;
    //     }

    //     document.getElementById("menubar1").href = linkMyEvent;
    //     if(name){
    //         document.getElementById("userName").innerHTML = 'Hey ' + name;
    //     }

    // }else{
    //     let headerButtons = document.getElementById('headerButtons');
    //     headerButtons.innerHTML = `
    //     <button class="nav-button transparent-button" onclick="login()">Login</button>
    //     <button class="nav-button transparent-button" onclick="singup()">Sign Up</button>`;
    // }
  });
  

