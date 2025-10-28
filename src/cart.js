document.addEventListener('DOMContentLoaded', () => {
    const cartSidebar = document.getElementById('cart-sidebar');
    const openCartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');

    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    const saveCart = () => {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    };

    const updateCartUI = () => {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center col-span-full">Tu carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'flex items-center justify-between py-3';

                let imageHtml = '';
                if (item.image && item.image.trim() !== '') {
                    imageHtml = `<img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-contain rounded-md bg-white p-1">`;
                } else if (item.svg) {
                    imageHtml = `<div class="w-16 h-16 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">${item.svg}</div>`;
                }

                itemElement.innerHTML = `
                    <div class="flex items-center space-x-3">${imageHtml}
                        <div>
                            <p class="font-bold text-sm">${item.name}</p>
                            <p class="text-deezer-purple text-xs">$${parseFloat(item.price).toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="remove-item-btn text-red-500 hover:text-red-700" data-id="${item.id}">&times;</button>
                        <span class="font-bold text-sm">${item.quantity}</span>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);
                total += item.price * item.quantity;
                totalItems += item.quantity;
            });
        }

        cartTotal.textContent = `$${total.toFixed(2)}`;
        cartCount.textContent = totalItems;
        cartCount.classList.toggle('hidden', totalItems === 0);
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        updateCartUI();
        openCart(); // Abrir el carrito al añadir un producto
    };

    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartUI();
    };

    const openCart = () => cartSidebar.classList.remove('translate-x-full');
    const closeCart = () => cartSidebar.classList.add('translate-x-full');

    // Event Listeners
    openCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.product-card');
            const product = {
                id: card.dataset.id,
                name: card.dataset.name,
                price: parseFloat(card.dataset.price),
                image: card.dataset.image,
                svg: card.dataset.svg || ''
            };
            addToCart(product);
        });
    });

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item-btn')) {
            removeFromCart(e.target.dataset.id);
        }
    });

    // Initial Load
    updateCartUI();
});
