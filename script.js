const shoppingCartQuantity = document.querySelector(".shopping-cart-quantity");
const containerCategories = document.querySelector(".categories");
const containerProducts = document.querySelector(".products-list");
const BASE_API = "https://fakestoreapi.com";
const listCartHTML = document.querySelector('.listCart');
const iconCart = document.querySelector('.shopping-cart');
const iconCartSpan = document.querySelector('.shopping-cart-quantity');
const body = document.querySelector('body');
const closeCart = document.querySelector('.close');
const checkOutButton = document.querySelector('.checkOut');
const loginButton = document.getElementById('loginButton');
const loginPopup = document.getElementById('loginPopup');

let shoppingCart = [];
let allProducts = [];
let filteredProducts = [];

iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});
closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

checkOutButton.addEventListener('click', () => {
    completePurchase();
});

const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(shoppingCart));
};

const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    let totalPrice = 0;

    if (shoppingCart.length > 0) {
        shoppingCart.forEach(item => {
            totalQuantity += item.quantity;
            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.id;

            let info = allProducts.find(product => product.id === item.id);
            totalPrice += info.price * item.quantity;
            listCartHTML.appendChild(newItem);
            newItem.innerHTML = `
                <div class="image">
                    <img src="${info.image}">
                </div>
                <div class="name">
                    ${info.title}
                </div>
                <div class="totalPrice">${(info.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${item.quantity}</span>
                    <span class="plus">></span>
                </div>
            `;
        });
    }

    iconCartSpan.innerText = totalQuantity;

    // Rodapé do Carrinho
    let footer = document.createElement('div');
    footer.classList.add('footer');
    footer.innerHTML = `
        <div class="total">
            <span>Total de Produtos: </span>
            <span>${totalQuantity} item(s)</span>
        </div>
        <div class="totalPrice">
            <span>Total: </span>
            <span>${totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
    `;
    listCartHTML.appendChild(footer);
};

listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('minus') || positionClick.classList.contains('plus')) {
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'minus';
        if (positionClick.classList.contains('plus')) {
            type = 'plus';
        }
        changeQuantityCart(product_id, type);
    }
});

const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = shoppingCart.findIndex(item => item.id == product_id);
    if (positionItemInCart >= 0) {
        let item = shoppingCart[positionItemInCart];
        switch (type) {
            case 'plus':
                shoppingCart[positionItemInCart].quantity += 1;
                break;
            case 'minus':
                let newQuantity = shoppingCart[positionItemInCart].quantity - 1;
                if (newQuantity > 0) {
                    shoppingCart[positionItemInCart].quantity = newQuantity;
                } else {
                    shoppingCart.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    updateShoppingCartQuantity();
    addCartToHTML();
    addCartToMemory();
};

async function getProducts() {
    try {
        let response = await fetch(`${BASE_API}/products`);
        let data = await response.json();

        allProducts = data;
        filteredProducts = allProducts;

        showProducts(filteredProducts);

        if (localStorage.getItem('cart')) {
            shoppingCart = JSON.parse(localStorage.getItem('cart'));
            updateShoppingCartQuantity();
            addCartToHTML();
        }
    } catch (error) {
        console.error(error);
    }
}

function showProducts(products) {
    containerProducts.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product");

        // Atualizado para garantir que a ordem seja correta: imagem, nome, preço, botão
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}" />
            <h2>${product.title}</h2>
            <p class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
            <button class="add-to-cart" data-id="${product.id}">Comprar</button>
        `;

        containerProducts.appendChild(productCard);
    });

    // Adiciona eventos aos botões de "Adicionar ao Carrinho"
    const addToCartButtons = document.querySelectorAll(".add-to-cart");
    addToCartButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            addInShoppingCart(event.target.dataset.id);
        });
    });
}

function addInShoppingCart(idProduct) {
    const productInCartIndex = shoppingCart.findIndex(item => item.id === parseInt(idProduct));

    if (productInCartIndex !== -1) {
        shoppingCart[productInCartIndex].quantity += 1;
    } else {
        const product = filteredProducts.find(item => item.id === parseInt(idProduct));
        product.quantity = 1;
        shoppingCart.push(product);
    }

    updateShoppingCartQuantity();
    addCartToHTML();
    addCartToMemory();
}

function updateShoppingCartQuantity() {
    const totalQuantity = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
    shoppingCartQuantity.innerHTML = totalQuantity;
}

function completePurchase() {
    if (shoppingCart.length === 0) {
        alert("O carrinho está vazio!");
        return;
    }

    // Envia a confirmação do pedido para a API AfterShip
    sendOrderConfirmation();

    // Limpa o carrinho
    shoppingCart = [];
    addCartToMemory();
    updateShoppingCartQuantity();
    addCartToHTML();

    alert("Compra finalizada com sucesso!");
}

// Função para enviar a notificação de confirmação de pedido para o AfterShip
async function sendOrderConfirmation() {
    try {
        const orderId = "12345"; 
        const trackingNumber = "TRK12345"; 
        const expectedDelivery = "2024-11-20T00:00:00Z"; 

        const response = await fetch('https://api.aftership.com/v4/trackings', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_API_KEY', 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tracking: {
                    tracking_number: trackingNumber,
                    slug: 'courier', 
                    expected_delivery: expectedDelivery,
                    order_id: orderId
                }
            })
        });
        const data = await response.json();
        console.log("Pedido confirmado", data);
    } catch (error) {
        console.error("Erro ao enviar confirmação de pedido:", error);
    }
}

async function getCategories() {
    try {
        let response = await fetch(`${BASE_API}/products/categories`);
        let categories = await response.json();

        categories.forEach(category => {
            const categoryElement = document.createElement('label');
            categoryElement.innerHTML = `
                <input name="category" type="checkbox" value="${category}" />
                ${category}
            `;
            containerCategories.appendChild(categoryElement);
        });

        // Adicionar event listeners aos checkboxes
        document.querySelectorAll('input[name="category"]').forEach(checkbox => {
            checkbox.addEventListener('change', filterPerCategory);
        });
    } catch (error) {
        console.error(error);
    }
}

function filterPerCategory() {
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(checkbox => checkbox.value);

    if (selectedCategories.length > 0) {
        filteredProducts = allProducts.filter(product => selectedCategories.includes(product.category));
    } else {
        filteredProducts = allProducts;
    }

    showProducts(filteredProducts);
}

// Função: Recarregar a página ao clicar no botão "Home"
const homeButton = document.querySelector('.menu-buttons button');
if (homeButton && homeButton.textContent.trim() === 'Home') {
    homeButton.addEventListener('click', () => {
        location.reload(); // Recarrega a página
    });
}

// Função: Abrir o popup de login
loginButton.addEventListener('click', () => {
    loginPopup.style.display = 'flex';
});

// Função: Fechar o popup de login
closeLoginPopup.addEventListener('click', () => {
    loginPopup.style.display = 'none';
});

// Fechar o popup ao clicar fora do conteúdo
loginPopup.addEventListener('click', (event) => {
    if (event.target === loginPopup) {
        loginPopup.style.display = 'none';
    }
});

// Remover o botão "Produtos" do menu
document.querySelectorAll('.menu-buttons button').forEach((button) => {
    if (button.textContent.trim() === 'Produtos') {
        button.remove();
    }
});


getProducts();
getCategories();
