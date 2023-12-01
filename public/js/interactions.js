const headerItems = document.querySelector('.header-items');

if (document.querySelector('.header-sidebar')) {
    const toggleHTML = '<div class="ps-3 openSidebar"><button onclick="openSidebar()" class="openSidebar d-flex justify-content-center align-items-center btn btn-light" style="width: 35px; height: 35px;"><i class="bi bi-list fs-5"></i></button></div>';
    const toggleComponent = document.createElement('div');

    toggleComponent.innerHTML = toggleHTML;
    headerItems.appendChild(toggleComponent);
}

function openSidebar() {

    const sidebar = document.querySelector('.header-sidebar');

    sidebar.classList.toggle('open');

    const isCol3 = sidebar.classList.contains('col-3');

    if (isCol3) {
        sidebar.classList.remove('col-3');
        sidebar.classList.add('col-8');
    }

}