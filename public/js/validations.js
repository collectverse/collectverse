// esta validado, mas o retorno do usuário esta incompleto!
'use strict';

function isEmailValid(email) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
}

function isPasswordValid(password) {
    const pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/;
    return pattern.test(password);
}

function isConfirmpasswordValid(password, confirmPassword) {
    return confirmPassword === password;
}

function authregister() {

    const username = document.forms["registerAuth"]["username"];
    const email = document.forms["registerAuth"]["email"];
    const password = document.forms["registerAuth"]["password"];
    const confirmpassword = document.forms["registerAuth"]["confirmpassword"];

    if (!(username && username.length >= 4)) {
        return false;
    }

    if (!(email && isEmailValid(email))) {
        return false;
    }

    if (!(isPasswordValid(password) && password.length >= 6)) {
        return false;
    }

    if (!isConfirmpasswordValid(password, confirmpassword)) {
        return false;
    }

    return true;
}

const forms = document.querySelectorAll('.needs-validation');

Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
        if (!authregister()) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }

        form.classList.add('was-validated');
    }, false);
});