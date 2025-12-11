import { products } from "../../display/config.js";
import './productSelector.css';

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

    products.forEach((product) => {
        const opt = document.createElement('option');
        opt.value = product.s3_name;
        opt.textContent = product.display_name;
        dropdown.appendChild(opt);
    });
}

renderProducts();
emitProductSelected();