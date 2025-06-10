var firebase = myFirebase;



// Sign up with email and password
function signUpWithEmail() 
{
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function (userCredential)
     {
      // Sign up successful
      var user = userCredential.user;
    //   console.log("Sign up successful:", user);
      showToast('Sign up successful.');
      isAuth = true;
     
      // Add further logic or redirect to a different page        
          // window.location.href = "./index.html";
          window.localStorage.setItem("userId",user.uid);         
          window.localStorage.setItem("auth",true);
          
          window.location.href = "./registration_page.html";


    })
    .catch(function (error) 
    {
      // Handle sign up errors
      var errorCode = error.code;
      var errorMessage = error.message;
      showToast('Sign up error.');

      console.error("Sign up error:", errorCode, errorMessage);
    });
}

// Sign up with Google
function signUpWithGoogle() 
{
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(function (userCredential) 
    {
      // Sign up successful
      var user = userCredential.user;
      window.localStorage.setItem("userId",user.uid);       
      window.localStorage.setItem("auth",true);
      
      console.log("Sign up with Google successful:", user);
      // Add further logic or redirect to a different page
      window.location.href = "./registration_page.html";

    })
    .catch(function (error) 
    {
      // Handle sign up errors
      var errorCode = error.code;
      var errorMessage = error.message;
      console.error("Sign up with Google error:", errorCode, errorMessage);
    });
}

// Sign up with Facebook
function signUpWithFacebook() 
{
  var provider = new firebase.auth.FacebookAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(function (userCredential) {
      // Sign up successful
      var user = userCredential.user;
      window.localStorage.setItem("userId",user.uid);   
      window.localStorage.setItem("auth",true);

      console.log("Sign up with Facebook successful:", user);
      window.location.href = "./registration_page.html";

      // Add further logic or redirect to a different page
    })
    .catch(function (error) 
    {
      // Handle sign up errors
      var errorCode = error.code;
      var errorMessage = error.message;
      console.error("Sign up with Facebook error:", errorCode, errorMessage);
    });
}


