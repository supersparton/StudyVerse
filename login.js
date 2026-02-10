email = document.getElementById("email");
password = document.getElementById("password");
const domain = "adaniuni.ac.in";


function check() {
    if (email.value == "" || password.value == "") {
        alert("Email and Password is required");
    }
    else {
        alert("Login successful");
    }
    if (email.endsWith(domain)) {
        alert("Email must be adaniuni.ac.in");
    }
}