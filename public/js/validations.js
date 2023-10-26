(() => {
    'use strict';
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            var password = document.forms['registerAuth']['password'];
            var authpassword = document.forms['registerAuth']['confirmpassword'];

            if (password.value !== authpassword.value) {
                event.preventDefault();
                event.stopPropagation();
                authpassword.classList.add('is-invalid');
            }

            form.classList.add('was-validated');
        }, false);
    });
})();
