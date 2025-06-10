// JavaScript

  
  function upload() {
    // Get the email input value
    const email = document.getElementById('emailInput').value;
  
    // Validate the email
    if (email.trim() === '') {
      // Show error message
      const errorMessage = document.getElementById('errorMessage');
      errorMessage.textContent = 'Please enter a valid email.';
      errorMessage.style.display = 'block';
  
      // Hide the toast
      const toast = document.getElementById('toast');
      toast.style.visibility = 'hidden';
      toast.style.opacity = '0';
    } else {

      var emailsRef = myApp.ref('subscribers/');
    //   const newEmailRef = emailsRef.push(); // Generate a unique key
    //   newEmailRef.set(email);
  
      emailsRef.orderByValue().equalTo(email).once('value', function(snapshot) {
        if (snapshot.exists()) {
            // Email already exists, show toast message
            showToast('You are already subscribed.');
        } else {
            // Email does not exist, add it to the database
            const newEmailRef = emailsRef.push(); // Generate a unique key
            newEmailRef.set(email);
            // Show success toast message
            showToast('Successfully subscribed!');
        }
    });

      // Clear the input field
      document.getElementById('emailInput').value = '';
  
      // Hide the error message
      const errorMessage = document.getElementById('errorMessage');
      errorMessage.style.display = 'none';
    }
  }

  // Event listener for form submission
  const emailForm = document.getElementById('emailForm');
  emailForm.addEventListener('submit', function(event) {
    event.preventDefault();
    upload();
  });
  