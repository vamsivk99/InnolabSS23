var firebase = myFirebase;
var authFlag = true;


setInterval(function(){

    // Is loggedin
    var result = isAuthenticated();
    
    // Check if not then change page
    if (result=="false") {
        
        if (window.location.href.includes("login.html")) {
               // Do nothing
        } else {

            // Chnage page
            window.location = "./login.html";
        }
    }

},1000);


(function() {

        firebase.auth().onAuthStateChanged(function(user) {

            if(!noChrome()){

                // Get location
                var location = window.location.href;
                
                if(user && authFlag) { 

                    if (user) {
                        // User is signed in

                        authFlag = false;
                        // Change location
                        if (location.includes("login.html")) {
                            window.location = "./index.html";
                        }
                        window.localStorage.setItem("userId",user.uid);
                    } 
                } else {
                    // Not signed in

                    // Change location
                    if (!location.includes("login.html")) {
                        window.location = "./login.html";  
                    }
                }
            }
            
        });
})();

function login(){
        
    // Get email and password
    var email = document.getElementById("loginEmail").value;
    var password = document.getElementById("loginPassword").value;

    if (!email && !password) {
        
        // No email and password
        document.getElementById("error3").innerHTML = '<div class="alert alert-danger" role="alert">Please enter email and password properly! </div>';
    
    } else if (!email) {

        // No email
        document.getElementById("error3").innerHTML = '<div class="alert alert-danger" role="alert">Please enter email!</div>';
    
    } else if (!password) {

        // No password
        document.getElementById("error3").innerHTML = '<div class="alert alert-danger" role="alert">Please enter password!</div>';
    
    } else {

        // Signin
        firebase.auth()
        .signInWithEmailAndPassword(email, password)
        .then(function (res) {

            authFlag = false;

            window.localStorage.setItem("auth",true);

            // Change Page
            window.location.href = "./index.html";
            
        }).catch(function(error) {
            
            // Handle Errors here.
            var errorCode = error.code;

            if (errorCode.includes("user-not-found")) {
                
                // Email not found 
                document.getElementById("error3").innerHTML = '<div class="alert alert-danger" role="alert">Email not found! </div>';
            }
            else if (errorCode.includes("password")) {
                
                // Wrong password 
                document.getElementById("error3").innerHTML = '<div class="alert alert-danger" role="alert">Incorrect password! </div>';
            }
        });
    }
}

// Change password
function changePassword(){

    // Remove error
    document.getElementById("error4").innerHTML = "";
    
    // New Password
    var oldPassword = document.getElementById("oldPassword").value;

    // New Password
    var newPassword = document.getElementById("newPassword").value;

    // In no password entered
    if (!newPassword || !oldPassword) {

        // No password 
        document.getElementById("error4").innerHTML = '<div class="alert alert-danger" role="alert">Please enter old and new password!</div>';
    } else {

        // Get user
        var user = firebase.auth().currentUser;
        
        // Get credentials
        var credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPassword);

        // Reauthenticate the user
        user.reauthenticateWithCredential(credential).then(function() {
            
            // Reauth successful.
            user.updatePassword(newPassword).then(function() {
            
                // Password is changed 
                document.getElementById("error4").innerHTML = '<div class="alert alert-success" role="alert">Password is changed!</div>';

              }).catch(function(error) {
    
                // An error happened.
              });

          }).catch(function(error) {

            // An error happened.
            if (error.code=="auth/wrong-password") {
                
                // Wrong password 
                document.getElementById("error4").innerHTML = '<div class="alert alert-danger" role="alert">Password is wrong!</div>';
            }
          });
    }
}
// Forget password
function forgetPassword() {

    // Remove error
    document.getElementById("error5").innerHTML = "";

    // Email
    var forgetEmail =  document.getElementById("forgetEmail").value;

    if (!forgetEmail) {

        // No email 
        document.getElementById("error5").innerHTML = '<div class="alert alert-danger" role="alert">Please enter email!</div>';
    } else {

        firebase.auth().sendPasswordResetEmail(forgetEmail).then(function() {
            
            // Password is changed
            document.getElementById("error5").innerHTML = '<div class="alert alert-success" role="alert">Email sent! Please check your email</div>';
    
          }).catch(function(error) {
    
            // An error happened.
            if (error.code) {
                document.getElementById("error5").innerHTML = '<div class="alert alert-danger" role="alert">Email not found!</div>';
            }
            
          });
    }
}
// Is authenticated
function isAuthenticated(){
    
    return window.localStorage.getItem("auth");
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
// Logout
function logout(){

    authFlag = true;
    window.localStorage.setItem("auth",false);
    window.localStorage.setItem("userId",'');
    firebase.auth().signOut();
}


function getUserId(){
    return window.localStorage.getItem('userId');
  }