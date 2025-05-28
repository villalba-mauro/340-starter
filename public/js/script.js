// Password toggle functionality for login and register forms
document.addEventListener('DOMContentLoaded', function() {
  const passwordBtn = document.getElementById("password-btn");
  const passwordField = document.getElementById("pword");
  
  if (passwordBtn && passwordField) {
    passwordBtn.addEventListener("click", function() {
      const type = passwordField.getAttribute("type");
      if(type === "password"){
        passwordField.setAttribute("type", "text");
        // Optional: Change icon or text to indicate state
        console.log("Password shown");
      } else {
        passwordField.setAttribute("type", "password");
        console.log("Password hidden");
      }
    });
    
    // Add cursor pointer style to make it clear it's clickable
    passwordBtn.style.cursor = "pointer";
  }
});