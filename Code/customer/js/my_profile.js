
let userProfilePic;
let picUploadReq = false;
let userType;

$(document).ready(function () {
  // Check if 'tickets' node exists
  userId =getUserId();
  myApp.read("users/" + userId, function (snapshot) {
    if (snapshot) {
      setData(snapshot);
    }
  });

});


function setData(userData) {
  // Render the profile data on the page
  document.getElementById("username").value = userData.name;
  document.getElementById("phone_number").value = userData.phoneNumber;
  document.getElementById("email").value = userData.email;
  document.getElementById("address").value = userData.address;
  
  userProfilePic = userData.userPicture;
  userType = userData.userData;
  if(!userType){
    userType = "individual";
  }

  // document.getElementById("userPicture").src = userData.userPicture;// getRandomImageUrl();
  if(userData.description){
    document.getElementById("description").value = userData.description;
  }

  // let labelsSocial;
  // let socialMediaData = userData.socialMedia;
  // if (socialMediaData) {
  //   labelsSocial = Object.values(socialMediaData);
  // }

  // if (labelsSocial) {
  //   var socialMediaLinks = labelsSocial.map(function (link) {
  //     return link;
  //   }).join("\n");
  //   document.getElementById("social_media").value = socialMediaLinks;
  // }

  // let labelsPreferences;
  // let objects = userData.preferences;
  // if (objects) {
  //   labelsPreferences = objects.map((obj) => obj.label);
  // }

  // if (labelsPreferences) {
  //   var preferences = labelsPreferences.map(function (preference) {
  //     return preference;
  //   }).join("\n");
  //  // document.getElementById("user_preferences").value = preferences;
  // }


  let labelsPreferences;
  let objects = userData.preferences;
  if (objects) {
    labelsPreferences = objects.map((obj) => obj.label);
  }

  if (labelsPreferences) {
    labelsPreferences.forEach(function (preference) {
      const checkboxElement = document.getElementById("preferences_" + (labelsPreferences.indexOf(preference) + 1));
      checkboxElement.checked = true;
    });
  }
// /////////////////////////////////////////////////////////////////
  const userPictureInput = document.getElementById('userPicture');
  const userImage = document.getElementById('userImage');
  userImage.src = userData.userPicture;


  const facebookHandle = document.getElementById("facebookHandle");
  const instagramHandle = document.getElementById("instagramHandle");
  const twitterHandle = document.getElementById("twitterHandle");

  facebookHandle.value =  userData.socialMediaHandles.facebook
  instagramHandle.value = userData.socialMediaHandles.instagram
  twitterHandle.value = userData.socialMediaHandles.twitter

  userPictureInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    userProfilePic = file;
    picUploadReq = true;
    const reader = new FileReader();

    reader.onload = function(e) {
      userImage.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });

}



function enableEditing() {
  var inputFields = document.getElementsByTagName("input");
  for (var i = 0; i < inputFields.length; i++) {
    inputFields[i].readOnly = false;
  }

  document.getElementById("editButton").disabled = true;

  // Redirect to another page
  window.location.href = "my_profile.html?id=" + userId;

}


function submitData() {


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


  const facebookHandle = document.getElementById("facebookHandle").value;
  const instagramHandle = document.getElementById("instagramHandle").value;
  const twitterHandle = document.getElementById("twitterHandle").value;

  const socialMediaHandles = {
    facebook: facebookHandle,
    instagram: instagramHandle,
    twitter: twitterHandle,
  };

  

  let userData;
    if(!picUploadReq){
      userData = {
        name: name,
        phoneNumber: phoneNumber,
        email: email,
        address: address,
        preferences: preferences,
        description: description,
        userPicture: userProfilePic,
        userType: userType,
        socialMediaHandles: socialMediaHandles
    };
  }else{

    userData = {
      name: name,
      phoneNumber: phoneNumber,
      email: email,
      address: address,
      preferences: preferences,
      description: description,
      userType: userType,
      socialMediaHandles: socialMediaHandles
   };
  }

    
 document.getElementById('loaderView').style.visibility = 'visible';

  let userid = getUserId();
  // Update the user's profile data in the backend

  myApp.create('users/' + userid, userData)
      .then(function (response) {
        if(picUploadReq){
          uploadImage(userid,userProfilePic);     
        }
        else{
          document.getElementById('loaderView').style.visibility = 'hidden';  
          window.location.href = "my_profile.html?id=" + userId;
        
        }
       })
      .catch(function (error) {
        console.log("Error:", error);
        document.getElementById('loaderView').style.visibility = 'hidden';

      });
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
  // Redirect to viewable fields
  window.location.href = "my_profile.html?id=" + userId;
}


