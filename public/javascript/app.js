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
}