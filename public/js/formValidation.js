
(() => {
    'use strict';

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validation-form');

    // Loop over them and prevent submission
    Array.from(forms).forEach((form) => {
        form.addEventListener(
            'submit',
            (event) => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add('was-validated');
            },
            false
        );
    });
})();


const reviewForm = document.querySelector(".reviewForm");
const defaultStarInput = document.querySelector("input[name='review[rating]']");
const statusContainer = document.querySelector("#status");
if (reviewForm) {
    reviewForm.addEventListener("submit", function (e) {
        if (defaultStarInput.checked) {
            statusContainer.classList.remove("d-none");
            e.preventDefault();
        } else {
            statusContainer.classList.add("d-none");
        }
    })
}
