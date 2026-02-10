const domain = "adaniuni.ac.in";


function check() {
    email = document.getElementById("email").value;
    password = document.getElementById("password").value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;

    if (email == "" || password == "") {
        alert("Email and Password is required");
    }
    else if (!email.endsWith(domain)) {
        alert("Email must be adaniuni.ac.in");
    }
    else if (!passwordRegex.test(password)) {
        console.log(passwordRegex.test(password));
        alert("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character");
    }
    else {
        window.location.href = "dashboard.html";
    }

}