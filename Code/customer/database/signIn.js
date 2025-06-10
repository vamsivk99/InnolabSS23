// Function to show the pop-up message
function showPopUpMessage(message) {
  var toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");
  // Hide the pop-up message after 3 seconds
  setTimeout(function() {
    toast.classList.remove("show");
  }, 3000);
}

var authFlag = true;

(function() {

  firebase.auth().onAuthStateChanged(function(user) {

      if(!noChrome()){
          // Get location          var location = window.location.href;
          if(user && authFlag) { 

              if (user) {
                  // User is signed in
                  if (user) {
                  }
                  authFlag = false;
                  // Change location
                  if (location.includes("login.html")) {
                      window.location = "./index.html";
                  }

              } 
          } else {
              // Not signed in

              // Change location
              if (!location.includes("login.html")) {
                  window.location = "./login.html";  
              }
          }
      }else{
        if(user && authFlag) { 
            if (user) {
              
              console.log(user.uid);
              window.localStorage.setItem("userId",user.uid);              }
        }
      }
      
  });
})();


/// Sign in with email and password
function signInWithEmail() {
  var firebase = myFirebase;
  var email = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  // Validate email and password
  if (validateEmail(email) && validatePassword(password)) {
    try {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(function (userCredential) {
          // Sign in successful
          var user = userCredential.user;
          showToast('Sign in successful.');
          authFlag = false;
          window.localStorage.setItem("auth",true);
          // Check if the user profile is complete
        
          isProfileComplete(user)
          .then(function(result) {
            console.log(result); // true or false
            if(!result===false){
              window.location.href = "./index.html";
              setIsProfileCompleteFlag(true);
            }else{
              setIsProfileCompleteFlag(false);
              showPopUpMessage('Please complete your profile.');
              window.location.href = "./registration_page.html";

            }
          })
          .catch(function(error) {
            // Handle any errors that occurred during the process
            console.error(error);
          });

  
      // if (isProfileComplete(user)) {
      //   // Profile is complete, redirect to index.html
      // } else {
      //   // Profile is not complete, show pop-up message
      //   showPopUpMessage('Please complete your profile.');
      //   window.location.href = "./my_profile.html";
      // }

        })
        .catch(function (error) {
          // Handle sign in errors
          var errorCode = error.code;
          var errorMessage = error.message;
          console.error("Sign in error:", errorCode, errorMessage, error);
          showToast('Invalid Email or password');
        });
    } catch (error) {
      console.error(error);
    }
  } else {
    // Email or password is invalid or empty, show error
    if (!validateEmail(email)) {
      // Set error for email field
      showToast('Invalid Email.');
    }
    if (!validatePassword(password)) {
      // Set error for password field
      // document.getElementById("password").classList.add("error");
      showToast('Invalid Password.');
    }
  }
}


// Sign in with Google
function signInWithGoogle() {
  var firebase = myFirebase;
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(function (userCredential) {
      // Sign in successful
      var user = userCredential.user;
      console.log("Sign in with Google successful:", user);
      window.localStorage.setItem("auth",true);

      // Add further logic or redirect to a different page
           // Check if the user profile is complete
          //  if (isProfileComplete(user)) {
          //   // Profile is complete, redirect to index.html
          //     window.location.href = "./index.html";
          // } else {
          //   // Profile is not complete, show pop-up message
          //   showPopUpMessage('Please complete your profile.');
          //   window.location.href = "./my_profile.html";
          // }


          isProfileComplete(user)
          .then(function(result) {
            console.log(result); // true or false
            if(!result===false){
              window.location.href = "./index.html";
              setIsProfileCompleteFlag(true);
            }else{
              setIsProfileCompleteFlag(false);

              showPopUpMessage('Please complete your profile.');
              window.location.href = "./my_profile_viewer.html";

            }
          })
          .catch(function(error) {
            // Handle any errors that occurred during the process
            console.error(error);
          });

    })
    .catch(function (error) {
      // Handle sign in errors
      var errorCode = error.code;
      var errorMessage = error.message;
      console.error("Sign in with Google error:", errorCode, errorMessage);
    });
}

// Sign in with Facebook
function signInWithFacebook() {
  var firebase = myFirebase;
  var provider = new firebase.auth.FacebookAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(function (userCredential) {
      // Sign in successful
      var user = userCredential.user;
      console.log("Sign in with Facebook successful:", user);
      window.localStorage.setItem("auth",true);
 
      // Add further logic or redirect to a different page
           // Check if the user profile is complete
          //  if (isProfileComplete(user)) {
          //   // Profile is complete, redirect to index.html
          //     window.location.href = "./index.html";
          // } else {
          //   // Profile is not complete, show pop-up message
          //   showPopUpMessage('Please complete your profile.');
          //   window.location.href = "./my_profile.html";
          // }

          isProfileComplete(user)
          .then(function(result) {
            console.log(result); // true or false
            if(!result===false){
              window.location.href = "./index.html";
              setIsProfileCompleteFlag(true);
            }else{
              setIsProfileCompleteFlag(false);
              showPopUpMessage('Please complete your profile.');
              window.location.href = "./my_profile_viewer.html";

            }
          })
          .catch(function(error) {
            // Handle any errors that occurred during the process
            console.error(error);
          });

    })
    .catch(function (error) {
      // Handle sign in errors
      var errorCode = error.code;
      var errorMessage = error.message;
      console.error("Sign in with Facebook error:", errorCode, errorMessage);
    });
}

// Helper function to validate email
function validateEmail(email) {
  // Regex pattern for email validation
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// Helper function to validate password (minimum 6 characters)
function validatePassword(password) {
  return password.length >= 6;
}



// Is authenticated
function isAuthenticated(){   
  return window.localStorage.getItem("auth");
}

function getUserId(){
  return window.localStorage.getItem('userId');
}

function getUserName(){
  return window.localStorage.getItem('userName');
}



// Logout
function logout(){
  authFlag = true;
  window.localStorage.setItem("auth",false);
  window.localStorage.setItem("userId",'');
  window.localStorage.setItem("userName",'');
  firebase.auth().signOut();
}


 $(document).ready(function () {
$('#LoginForm').submit(function () {
  signInWithEmail();
  return false;
 });
 
//  document.getElementById("togglePassword").addEventListener("click", function(event) {  
//   var passwordInput = document.getElementById("password");
//   var icon = document.getElementById("togglePassword");

//   if (passwordInput.type === "password") {
//     passwordInput.type = "text";
//     icon.classList.remove("fa-eye-slash");
//     icon.classList.add("fa-eye");
//   } else {
//     passwordInput.type = "password";
//     icon.classList.remove("fa-eye");
//     icon.classList.add("fa-eye-slash");
//   }
// });

});



// function getUserData(uid) 
// {
//   var userDataRef = firebase.database().ref('users/' + uid);
//   return userDataRef.once('value').then(function(snapshot) 
//   {
//     return snapshot.val();
//   });
// }


async function getUserData(uid) {
  var userDataRef = myApp.ref('users/' + uid);
  
  try {
    var snapshot = await userDataRef.once('value');
    var userData = snapshot.val();
    
    // Perform additional actions with the userData
    console.log(userData);
    
    // Continue with other code here...
    // ...
    
    return userData;
  } catch (error) {
    // Handle any errors that occurred during the data retrieval
    console.error(error);
    throw error;
  }
}




async function isProfileComplete(user) {
  try {
    var userData = await getUserData(user.uid);
    
    if (
      userData &&
      userData.name &&
      userData.phoneNumber &&
      userData.email &&
      userData.description &&
      userData.address
    ) {
      window.localStorage.setItem("userName", userData.name);    
      return true; // Profile is complete
    } else {
      return false; // Profile is not complete
    }
  } catch (error) {
    // Handle any errors that occurred during the data retrieval
    console.error(error);
    return false; // Assuming an incomplete profile in case of an error
  }
}

// No Chrome
function noChrome(){

  // Opera 8.0+
  var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

  // Firefox 1.0+
  var isFirefox = typeof InstallTrigger !== 'undefined';

  // Safari 3.0+ "[object HTMLElementConstructor]" 
  var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

  // Internet Explorer 6-11
  var isIE = /*@cc_on!@*/false || !!document.documentMode;

  // Edge 20+
  var isEdge = !isIE && !!window.StyleMedia;

  // Chrome 1 - 79
  var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

  // Edge (based on chromium) detection
  var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);

  // Blink engine detection
  var isBlink = (isChrome || isOpera) && !!window.CSS;

  if (isChrome) {
      return false;
  } else {
      return true;
  }

}

function setIsProfileCompleteFlag(status){
  window.localStorage.setItem("profileComplete",status);
}

function getIsProfileCompleteFlag(){
  return window.localStorage.getItem("profileComplete");
}