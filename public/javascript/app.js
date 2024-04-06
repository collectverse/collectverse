// menu

const button = document.querySelector(".li-menu .menu");
const menu = document.querySelector(".responsive-itens-home");
const boby = document.querySelector("body");

if (!menu) {
    button.remove();
} else {
    const e = () => {

        if (menu) {
            menu.classList.toggle("activated");
            boby.classList.toggle("overflow")
        }
    }

    button.addEventListener("click", e);
};

// dropdown

const perfil = document.querySelector(".li-dropdown-header .dropdown");
const dropdown = document.querySelector(".dropdown-content");

if(perfil && dropdown) {
    const f = () => {
        dropdown.classList.toggle("onBlock")
    }

    perfil.addEventListener("click", f);
};

// menu itens

const dots = document.querySelectorAll(".more-icon");

if (dots.length > 0) {
    const d = (event) => {
        const dot = event.currentTarget;
        const menu = dot.querySelector(".dropdown-content");
        
        // Verifica se o menu existe antes de tentar alterar seu estilo
        if (menu) {
            menu.classList.toggle("onBlock");
        }
    };

    dots.forEach((dot) => dot.addEventListener("click", d));
}

// previw de imagens

function previewImage(input, imageClass) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function(e) {
            $('.' + imageClass).attr('src', e.target.result);
        }
        
        reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
};