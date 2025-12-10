import { products } from "../../display/config.js";

const dropdown = document.getElementById('product');

dropdown.addEventListener('change', () => {
    emitProductSelected();
});

function emitProductSelected() {
    document.dispatchEvent(new CustomEvent('product-selected', {
        detail: { product: dropdown.value },
    }));
}

function renderProducts() {
    dropdown.innerHTML = '';

    const options = Object.keys(products);
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        dropdown.appendChild(opt);
    })
}

renderProducts();
emitProductSelected();