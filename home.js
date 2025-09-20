// Plan modal & cart logic
const planCards = document.querySelectorAll('.plan-card');
const modal = document.getElementById('planModal');
const modalName = document.getElementById('modalPlanName');
const modalPrice = document.getElementById('modalPrice');
const modalPortions = document.getElementById('modalPortions');
const modalDuration = document.getElementById('modalDuration');
const addCartBtn = document.getElementById('addCartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartBtn = document.getElementById('cartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');

let cart = [];
let selectedPlan = null;

// Open modal
planCards.forEach(card => {
  card.querySelector('.view-details').addEventListener('click', () => {
    selectedPlan = {
      name: card.dataset.name,
      price: card.dataset.price,
      portions: card.dataset.portions,
      duration: card.dataset.duration
    };
    modalName.textContent = selectedPlan.name;
    modalPrice.textContent = selectedPlan.price;
    modalPortions.textContent = selectedPlan.portions;
    modalDuration.textContent = selectedPlan.duration;
    modal.classList.add('show');
  });
});

// Close modal
modal.querySelector('.modal-close').addEventListener('click', () => modal.classList.remove('show'));

// Add to cart with subscription duration
addCartBtn.addEventListener('click', () => {
  if (!selectedPlan) return;

  const selectedDuration = document.querySelector('input[name="subDuration"]:checked').value;
  cart.push({
    ...selectedPlan,
    chosenDuration: selectedDuration
  });

  renderCart();
  modal.classList.remove('show');
  cartDrawer.classList.add('show');
});

// Render cart
function renderCart() {
  cartItemsEl.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    // Dummy pricing logic based on duration
    let basePrice = parseInt(item.price.replace('₹','')) || 100;
    if(item.chosenDuration === '1 month') basePrice *= 4;
    if(item.chosenDuration === '1 year') basePrice *= 52;
    total += basePrice;

    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <div class="cart-item-name">${item.name} — ${item.chosenDuration}</div>
      <div>
        ₹${basePrice} 
        <button class="cart-item-remove" data-index="${index}">×</button>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });

  cartTotalEl.textContent = `₹${total}`;

  // Remove buttons
  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.dataset.index;
      cart.splice(idx, 1);
      renderCart();
    });
  });
}

// Open / Close cart
cartBtn.addEventListener('click', () => cartDrawer.classList.add('show'));
closeCartBtn.addEventListener('click', () => cartDrawer.classList.remove('show'));

// Checkout dummy
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if(cart.length === 0){
    alert('Cart is empty!');
    return;
  }
  alert('Checkout dummy — order placed!');
  cart = [];
  renderCart();
  cartDrawer.classList.remove('show');
});
