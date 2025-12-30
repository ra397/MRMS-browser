import { productGroups } from "../../display/config.js";
import './productSelector.css';

const menuContainer = document.getElementById('product-menu-container');

function createHeaderEntry(title, type) {
    const header = document.createElement('div');
    header.className = `accordion-header ${type}-header`;
    header.innerHTML = `
        <div class="header-left">
            <svg class="chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
            <span class="header-label">${title}</span>
        </div>
    `;

    header.addEventListener('click', () => {
        header.parentElement.classList.toggle('active');
    });
    return header;
}

function createProductEntry(product) {
    const label = document.createElement('label');
    label.className = 'product-radio-item';
    label.innerHTML = `
        <input type="radio" name="product_selection" value="${product.s3_name}">
        <span>${product.display_name}</span>
    `;

    label.querySelector('input').addEventListener('change', (e) => {
        emitProductSelected(e.target.value);
    });

    return label;
}

function renderMenu() {
    menuContainer.innerHTML = '';

    productGroups.forEach(group => {
        // 1. Create Category Wrapper
        const catWrapper = document.createElement('div');
        catWrapper.className = 'menu-group category-group';

        // 2. Add Category Header
        catWrapper.appendChild(createHeaderEntry(group.name, 'category'));

        // 3. Container for Category Children
        const catContent = document.createElement('div');
        catContent.className = 'accordion-content';
        const catInner = document.createElement('div');
        catInner.className = 'content-inner';

        // 4. Loop through items in this Category
        group.items.forEach(item => {

            if (item.type === 'subcategory') {
                // -- IT IS A SUBCATEGORY --
                const subWrapper = document.createElement('div');
                subWrapper.className = 'menu-group subcategory-group';

                subWrapper.appendChild(createHeaderEntry(item.name, 'subcategory'));

                const subContent = document.createElement('div');
                subContent.className = 'accordion-content';
                const subInner = document.createElement('div');
                subInner.className = 'content-inner';

                // Render products inside subcategory
                item.items.forEach(prod => {
                    subInner.appendChild(createProductEntry(prod));
                });

                subContent.appendChild(subInner);
                subWrapper.appendChild(subContent);
                catInner.appendChild(subWrapper);

            } else {
                // -- IT IS A DIRECT PRODUCT --
                // (Like the "Models" category example)
                catInner.appendChild(createProductEntry(item));
            }
        });

        catContent.appendChild(catInner);
        catWrapper.appendChild(catContent);
        menuContainer.appendChild(catWrapper);
    });
}

function emitProductSelected(val) {
    document.dispatchEvent(new CustomEvent('product-selected', {
        detail: { product: val },
    }));
}

renderMenu();