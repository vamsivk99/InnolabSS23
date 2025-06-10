function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.visibility = 'visible';
    toast.style.opacity = '1';
  
    setTimeout(function() {
      toast.style.visibility = 'hidden';
      toast.style.opacity = '0';
    }, 3000); // Toast will be hidden after 3 seconds (3000 milliseconds)
  }

  

  