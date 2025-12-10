const sidebarOptions = document.querySelectorAll('.sidebar-item');

sidebarOptions.forEach(sidebar => {
    sidebar.addEventListener('click', () => {
        const menu = sidebar.dataset.menu;
        document.getElementById(menu).classList.toggle('hidden');
    })
});

function toggleMenu(menu) {

}