import './sidebar.css';

const sidebarOptions = document.querySelectorAll('.sidebar-item');

let activeMenu = null;
let closeTimeout = null;
const CLOSE_DELAY = 1300; // ms delay before closing menu

function showMenu(menuId) {
    if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
    }

    if (activeMenu && activeMenu !== menuId) {
        document.getElementById(activeMenu).classList.add('hidden');
    }

    const menuElement = document.getElementById(menuId);
    menuElement.classList.remove('hidden');
    activeMenu = menuId;
}

function scheduleClose() {
    if (closeTimeout) {
        clearTimeout(closeTimeout);
    }

    closeTimeout = setTimeout(() => {
        if (activeMenu) {
            document.getElementById(activeMenu).classList.add('hidden');
            activeMenu = null;
        }
        closeTimeout = null;
    }, CLOSE_DELAY);
}

function cancelClose() {
    if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
    }
}

sidebarOptions.forEach(item => {
    item.addEventListener('mouseenter', () => {
        const menuId = item.dataset.menu;
        showMenu(menuId);
    });

    item.addEventListener('mouseleave', () => {
        scheduleClose();
    });
});

sidebarOptions.forEach(item => {
    const menuId = item.dataset.menu;
    const menuElement = document.getElementById(menuId);

    if (menuElement) {
        menuElement.addEventListener('mouseenter', () => {
            cancelClose();
        });

        menuElement.addEventListener('mouseleave', () => {
            scheduleClose();
        });
    }
});