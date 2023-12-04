const headerItems = document.querySelector('.header-items');

if (document.querySelector('.header-sidebar')) {
    const toggleHTML = '<div class="ps-3 openSidebar mx-auto"><button onclick="openSidebar()" class="openSidebar navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggleExternalContent" aria-controls="navbarToggleExternalContent" aria-expanded="false" aria-label="Toggle navigation"><i class="bi bi-list"></i></button></div>';
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