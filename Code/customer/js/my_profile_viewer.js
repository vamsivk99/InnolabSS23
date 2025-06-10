


$(document).ready(function () {
  // Check if 'tickets' node exists
  userId =getUserId();
  myApp.read("users/" + userId, function (snapshot) {
    if (snapshot) {
      setData(snapshot);
    }
  });

});


// function setData(userData){
//     // Render the profile data on the page
//     document.getElementById("username").textContent = userData.name;
//     document.getElementById("phone_number").textContent = userData.phoneNumber;
//     document.getElementById("email").textContent = userData.email;
//     document.getElementById("address").textContent = userData.address;

//     let labelsSocial; 
//     let objectsSocial = userData.socialMedia;    
//     if (objectsSocial) {
//       labelsSocial = objectsSocial.map((obj) => obj.label);
//     }

//     if (labelsSocial) {
//       var socialMediaLinks = labelsSocial.map(function(link) {
//         return "<li>" + link + "</li>";
//       }).join("");
//       document.getElementById("social_media").innerHTML = socialMediaLinks;
//     }

//     let labelsPreferences;
//     let objects = userData.preferences;    
//     if (objects) {
//       labelsPreferences = objects.map((obj) => obj.label);
//     }

//     if (labelsPreferences) {
//       var preferences = labelsPreferences.map(function(preference) {
//         return "<li>" + preference + "</li>";
//       }).join("");
//       document.getElementById("user_preferences").innerHTML = preferences;
//     }

// }

function setData(userData) {
  // Render the profile data on the page
  document.getElementById("username").value = userData.name;
  document.getElementById("phone_number").value = userData.phoneNumber;
  document.getElementById("email").value = userData.email;
  document.getElementById("address").value = userData.address;
  document.getElementById("userPicture").src = userData.userPicture;// getRandomImageUrl();
  if(userData.description){
    document.getElementById("description").value = userData.description;
  }


  let socialMediaData = userData.socialMediaHandles;
  var socialMediaLinks;
  if (socialMediaData) {
    // labelsSocial = Object.values(socialMediaData);

    socialMediaLinks = "Facebook: "+userData.socialMediaHandles.facebook + "\n" +
    "Instagram: " +userData.socialMediaHandles.instagram + "\n" +
    "Twitter: "+userData.socialMediaHandles.twitter + "" ;
  }

  // if (labelsSocial) {
  //   var socialMediaLinks = labelsSocial.map(function (link) {
  //     return link;
  //   }).join("\n");
  // }

  document.getElementById("social_media").value = socialMediaLinks;
  
  let labelsPreferences;
  let objects = userData.preferences;
  if (objects) {
    labelsPreferences = objects.map((obj) => obj.label);
  }

  if (labelsPreferences) {
    var preferences = labelsPreferences.map(function (preference) {
      return preference;
    }).join("\n");
    document.getElementById("user_preferences").value = preferences;
  }
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
  var updatedData = {
    name: document.getElementById("username").textContent,
    phoneNumber: document.getElementById("phone_number").textContent,
    email: document.getElementById("email").textContent,
    address: document.getElementById("address").textContent,
    description: document.getElementById("desriptiom").textContent,
    socialMedia: [
      document.getElementById("social-media-1").value,
      document.getElementById("social-media-2").value,
      document.getElementById("social-media-3").value
    ]
    // Add any other fields you want to update
  };

  // Update the user's profile data in the backend
  myFirebase.firebase
    .database()
    .ref("users/" + userId)
    .update(updatedData)
    .then(function() {
      // Display success message or perform any other actions
      console.log("Profile data updated successfully!");

      // Redirect to viewable fields
      window.location.href = "my_profile.html?id=" + userId;
    })
    .catch(function(error) {
      // Display error message or perform any other actions
      console.error("Error updating profile data:", error);
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