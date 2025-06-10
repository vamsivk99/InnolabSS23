// Global firebase
var firebase = myFirebase.firebase;

let userProfilePic;
let picUploadReq = false;

$(document).ready(function() {
  // Set initial selection
  var selectedOption = '';

  // Register as an Individual button click event
  $('#registerIndividualBtn').click(function() {
    // Update selection
    selectedOption = 'individual';

    // Add or remove CSS classes to highlight the selected option
    $('#registerIndividualBtn').addClass('selected');
    $('#registerCompanyBtn').removeClass('selected');
  });

  // Register as a Company button click event
  $('#registerCompanyBtn').click(function() {
    // Update selection
    selectedOption = 'company';

    // Add or remove CSS classes to highlight the selected option
    $('#registerCompanyBtn').addClass('selected');
    $('#registerIndividualBtn').removeClass('selected');
  });

  // Form submission event
  $('#submitBtn').click(function() {
    // Check the selected option
    if (selectedOption === 'individual' || selectedOption === 'company') {
      // Handle form submission
      submitData();
    } else {
      // No option selected, handle accordingly
      console.log('Please select an option.');
    }
  });

  const userPictureInput = document.getElementById('userPicture');
  const userImage = document.getElementById('userImage');

  userPictureInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    userProfilePic = file;
    const reader = new FileReader();

    reader.onload = function(e) {
      userImage.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });


});

function submitData() 
{

  var selectedOption = '';


  if ($('#registerIndividualBtn').hasClass('selected')) {
    selectedOption = 'individual';
  } else if ($('#registerCompanyBtn').hasClass('selected')) {
    selectedOption = 'company';
  }else{
    selectedOption = 'individual';
  }

  var name = document.getElementById('username').value;
  var phoneNumber = document.getElementById('phone_number').value;
  var email = document.getElementById('email').value;
  var address = document.getElementById('address').value;
  var description = document.getElementById('description').value;

  // Perform input field validation
  if (name.trim() === '') {
    showToast("Please Enter a Name.");
    // console.log('Please enter a name.');
    return;
  }

  if (phoneNumber.trim() === '') {
    // console.log('Please enter a phone number.');
     showToast("Please Add Phone Number.");
    return;
  }

  if (email.trim() === '') {
    // console.log('Please enter an email.');
    showToast("Please Add An Email.");
    return;
  }

  if (address.trim() === '') {
    showToast("Please Add An Address.");
    return;
  }

  if (description.trim() === '') {
    showToast("Please Add Description.");
    return;
  }

  var preferences = [];
  $('.input-group-text').each(function() {
    var radioInput = $(this).find('input[type="checkbox"]');
    var label = $(this).find('label');

    if (radioInput.is(':checked')) {
      var preference = {
        id: radioInput.attr('id'),
        label: label.text()
      };
      preferences.push(preference);
    }
  });

  if(preferences.length==0){
    showToast("Please Select Preferecnce")
    return;
  }


  let userData;
    if(!userProfilePic){
      userProfilePic = "https://firebasestorage.googleapis.com/v0/b/artefacto-84a15.appspot.com/o/user.png?alt=media&token=b123c0ab-742d-4e2f-aac7-679e18d0764b"
      userData = {
        name: name,
        phoneNumber: phoneNumber,
        email: email,
        userPicture: userProfilePic,
        address: address,
        preferences: preferences,
        description: description,
        userType: selectedOption
    };
  }else{
    picUploadReq = true;

    userData = {
      name: name,
      phoneNumber: phoneNumber,
      email: email,
      address: address,
      preferences: preferences,
      description: description,
      userType: selectedOption
  };
  }

   
  
 document.getElementById('loaderView').style.visibility = 'visible';

    let userid = getUserId();
    myApp.create('users/' + userid, userData)
      .then(function (response) {
        if(picUploadReq){
          uploadImage(userid,userProfilePic);     
        }
        else{
          document.getElementById('loaderView').style.visibility = 'hidden';  
          window.localStorage.setItem("profileComplete",true);
          window.location.href = './index.html';
        
        }
       })
      .catch(function (error) {
        console.log("Error:", error);
        document.getElementById('loaderView').style.visibility = 'hidden';

      });


}


  
// Upload file
function uploadImage(userId,image){
  // Upload image
  myApp.upload(userId,image,setURL);

}

// Set image URL
function setURL(userId,url){
  
  // Create path
  var path = "users/" + userId +"";

  // Update record
  myApp.update(path ,{
      "userPicture" : url
  });

  document.getElementById('loaderView').style.visibility = 'hidden';
  
  window.localStorage.setItem("profileComplete",true);
  window.location.href = './index.html';

}