import './modal.css';

const overlay = document.getElementById('modal-overlay');
const messageEl = document.getElementById('modal-message');
const confirmBtn = document.getElementById('modal-confirm-btn');
const cancelBtn = document.getElementById('modal-cancel-btn');

let resolvePromise = null;

/**
 * Show a modal dialog with a message
 * @param {string} message - The message to display
 * @param {Object} options - Configuration options
 * @param {boolean} options.showCancel - Whether to show the cancel button (default: true)
 * @param {string} options.confirmText - Text for the confirm button (default: 'Yes')
 * @param {string} options.cancelText - Text for the cancel button (default: 'No')
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
export function showModal(message, options = {}) {
    const {
        showCancel = true,
        confirmText = 'Yes',
        cancelText = 'No'
    } = options;

    messageEl.textContent = message;
    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;

    if (showCancel) {
        cancelBtn.classList.remove('hidden');
    } else {
        cancelBtn.classList.add('hidden');
    }

    overlay.classList.remove('hidden');

    return new Promise((resolve) => {
        resolvePromise = resolve;
    });
}

function hideModal() {
    overlay.classList.add('hidden');
}

confirmBtn.addEventListener('click', () => {
    hideModal();
    if (resolvePromise) {
        resolvePromise(true);
        resolvePromise = null;
    }
});

cancelBtn.addEventListener('click', () => {
    hideModal();
    if (resolvePromise) {
        resolvePromise(false);
        resolvePromise = null;
    }
});

// Close modal if clicking on overlay background
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        hideModal();
        if (resolvePromise) {
            resolvePromise(false);
            resolvePromise = null;
        }
    }
});
