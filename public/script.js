const ROTA = "http://localhost:3000/api/produto/listar";

/* =========================================================
   DADOS DOS PRODUTOS
   ========================================================= */
let products = [];
async function carregarProdutos() {
  try {
    const response = await fetch(ROTA);
    if (!response.ok) {
      throw new Error(`ERRO HTTP ${response.status}`);
    }
    const data = await response.json();

    // Garante que é um array
    products = Array.isArray(data) ? data : [];

    console.log(`Produtos carregados = ${products.length}`);
    renderProducts();
  } catch (error) {
    console.log("Erro ao carregar produtos:", error);
    if (productGrid) {
      productGrid.innerHTML = `<p>Não foi possível carregar os produtos. Verifique se o servidor está ativo.</p>`;
    }
  }
}

/* =========================================================
   ESTADO DA APLICAÇÃO
   ========================================================= */
let activeCategory = "todos";
let currentSearch = "";
let currentSort = "default";
let showingAllProducts = false;
let favorites = JSON.parse(localStorage.getItem("saborFavorites")) || [];
let cart = JSON.parse(localStorage.getItem("saborCart")) || [];

/* =========================================================
   ELEMENTOS DO DOM
   ========================================================= */
const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const productsMessage = document.getElementById("productsMessage");
const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
const showAllProductsButton = document.getElementById("showAllProducts");
const cartCount = document.getElementById("cartCount");
const cartCountMobile = document.getElementById("cartCountMobile");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartSummary = document.getElementById("cartSummary");
const cartTotal = document.getElementById("cartTotal");
const cartItemsText = document.getElementById("cartItemsText");
const cepForm = document.getElementById("cepForm");
const cepInput = document.getElementById("cepInput");
const cepButtonText = document.getElementById("cepButtonText");
const newsletterForm = document.getElementById("newsletterForm");

/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */
function formatPrice(value) {
  const numero = Number(value) || 0;
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function saveFavorites() {
  localStorage.setItem("saborFavorites", JSON.stringify(favorites));
}

function saveCart() {
  localStorage.setItem("saborCart", JSON.stringify(cart));
}

function getProductById(id) {
  return products.find((product) => Number(product.id) === Number(id));
}

function showToast(message) {
  if (typeof M !== "undefined" && M.toast) {
    M.toast({
      html: message,
      displayLength: 2600,
      classes: "rounded"
    });
  } else {
    alert(message.replace(/<[^>]*>/g, ""));
  }
}

/* =========================================================
   INICIALIZAÇÃO GERAL
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  // Inicializa componentes Materialize
  if (typeof M !== "undefined") {
    M.Sidenav.init(document.querySelectorAll(".sidenav"));
    M.Modal.init(document.querySelectorAll(".modal"), {
      opacity: 0.55
    });
    M.Dropdown.init(document.querySelectorAll(".dropdown-trigger"), {
      coverTrigger: false,
      constrainWidth: false,
      alignment: "right",
      closeOnClick: true
    });
  }

  // Ano atual
  const anoElemento = document.getElementById("currentYear");
  if (anoElemento) anoElemento.textContent = new Date().getFullYear();

  // Carrega dados e atualiza interface
  if (productGrid) carregarProdutos();
  updateCart();
});

/* =========================================================
   FILTRO E RENDERIZAÇÃO DOS PRODUTOS
   ========================================================= */
function getFilteredProducts() {
  let filteredProducts = [...products];

  if (activeCategory !== "todos") {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === activeCategory
    );
  }

  if (currentSearch.trim() !== "") {
    const term = currentSearch.toLowerCase().trim();
    filteredProducts = filteredProducts.filter((product) => {
      const nome = (product.name || "").toLowerCase();
      const catLabel = (product.categoryLabel || "").toLowerCase();
      const cat = (product.category || "").toLowerCase();
      return nome.includes(term) || catLabel.includes(term) || cat.includes(term);
    });
  }

  if (currentSort === "az") {
    filteredProducts.sort((a, b) => (a.name || "").localeCompare(b.name || "", "pt-BR"));
  }
  if (currentSort === "price-asc") {
    filteredProducts.sort((a, b) => Number(a.price) - Number(b.price));
  }
  if (currentSort === "price-desc") {
    filteredProducts.sort((a, b) => Number(b.price) - Number(a.price));
  }

  return filteredProducts;
}

function renderProducts() {
  if (!productGrid || !emptyState || !productsMessage || !showAllProductsButton) return;

  const filteredProducts = getFilteredProducts();
  const visibleProducts = showingAllProducts
    ? filteredProducts
    : filteredProducts.slice(0, 8);

  productGrid.innerHTML = "";

  if (filteredProducts.length === 0) {
    emptyState.classList.remove("hide");
    showAllProductsButton.classList.add("hide");
    productsMessage.textContent = "Não encontramos itens para esta busca.";
    return;
  }

  emptyState.classList.add("hide");

  visibleProducts.forEach((product) => {
    const isFavorite = favorites.includes(Number(product.id));
    const oldPriceHTML = product.oldPrice
      ? `<span class="price-old">${formatPrice(product.oldPrice)}</span>`
      : "";
    const badgeHTML = product.badge
      ? `<span class="product-badge">${product.badge}</span>`
      : "";
    const nomeSeguro = product.name || "Produto";
    const imagemSegura = product.image || "/imagens/sem-imagem.jpg";
    const catLabelSegura = product.categoryLabel || "";
    const unidadeSegura = product.unit || "";

    productGrid.innerHTML += `
      <article class="product-card">
        <div class="product-image-wrapper">
          ${badgeHTML}
          <button
            class="favorite ${isFavorite ? "active" : ""}"
            type="button"
            data-favorite="${product.id}"
            aria-label="Adicionar ${nomeSeguro} aos favoritos"
            title="Adicionar aos favoritos"
          >
            <i class="material-icons">
              ${isFavorite ? "favorite" : "favorite_border"}
            </i>
          </button>
          <img
            class="product-image"
            src="${imagemSegura}"
            alt="${nomeSeguro}"
            loading="lazy"
          >
        </div>
        <div class="product-info">
          <span class="product-category">${catLabelSegura}</span>
          <h3>${nomeSeguro}</h3>
          <p class="product-unit">${unidadeSegura}</p>
          <div class="price-row">
            <span class="price">${formatPrice(product.price)}</span>
            ${oldPriceHTML}
          </div>
          <button
            class="btn-add waves-effect"
            type="button"
            data-add="${product.id}"
          >
            <i class="material-icons left">add_shopping_cart</i>
            Adicionar
          </button>
        </div>
      </article>
    `;
  });

  updateProductsMessage(filteredProducts.length);

  if (filteredProducts.length > 8 && !showingAllProducts) {
    showAllProductsButton.classList.remove("hide");
    showAllProductsButton.textContent = "Ver todos os produtos";
  } else if (showingAllProducts && filteredProducts.length > 8) {
    showAllProductsButton.classList.remove("hide");
    showAllProductsButton.textContent = "Mostrar menos";
  } else {
    showAllProductsButton.classList.add("hide");
  }
}

function updateProductsMessage(quantity) {
  if (!productsMessage) return;

  const categoryNames = {
    todos: "todos os produtos",
    frutas: "frutas",
    verduras: "verduras",
    legumes: "legumes",
    temperos: "temperos",
    polpas: "polpas",
    naturais: "produtos naturais",
    outros: "produtos regionais"
  };

  if (currentSearch.trim() !== "") {
    productsMessage.textContent = `${quantity} produto(s) encontrado(s) para “${currentSearch.trim()}”.`;
    return;
  }

  if (activeCategory !== "todos") {
    productsMessage.textContent = `Confira ${quantity} opção(ões) em ${categoryNames[activeCategory] || activeCategory}.`;
    return;
  }

  productsMessage.textContent = "Confira produtos frescos disponíveis para você.";
}

/* =========================================================
   CATEGORIAS
   ========================================================= */
document.querySelectorAll(".category").forEach((button) => {
  button.addEventListener("click", function () {
    activeCategory = this.dataset.category;
    currentSearch = "";
    if (searchInput) searchInput.value = "";
    showingAllProducts = false;

    document.querySelectorAll(".category").forEach((category) => {
      category.classList.remove("active");
    });
    this.classList.add("active");

    renderProducts();
    const secProdutos = document.getElementById("produtos");
    if (secProdutos) {
      secProdutos.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

/* =========================================================
   BUSCA
   ========================================================= */
if (searchForm) {
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!searchInput) return;
    currentSearch = searchInput.value;
    activeCategory = "todos";
    showingAllProducts = true;

    document.querySelectorAll(".category").forEach((category) => {
      category.classList.remove("active");
      if (category.dataset.category === "todos") {
        category.classList.add("active");
      }
    });

    renderProducts();
    const secProdutos = document.getElementById("produtos");
    if (secProdutos) {
      secProdutos.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

if (searchInput) {
  searchInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      currentSearch = "";
      showingAllProducts = false;
      renderProducts();
    }
  });
}

/* =========================================================
   ORDENAÇÃO
   ========================================================= */
document.querySelectorAll("[data-sort]").forEach((button) => {
  button.addEventListener("click", function () {
    currentSort = this.dataset.sort;
    renderProducts();

    const sortLabels = {
      default: "Destaques",
      az: "Nome: A-Z",
      "price-asc": "Menor preço",
      "price-desc": "Maior preço"
    };

    showToast(`Ordenado por: <b>${sortLabels[currentSort]}</b>`);
  });
});

/* =========================================================
   MOSTRAR TODOS
   ========================================================= */
if (showAllProductsButton) {
  showAllProductsButton.addEventListener("click", function () {
    showingAllProducts = !showingAllProducts;
    renderProducts();

    if (!showingAllProducts) {
      const secProdutos = document.getElementById("produtos");
      if (secProdutos) {
        secProdutos.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
}

/* =========================================================
   FAVORITOS E ADIÇÃO AO CARRINHO
   ========================================================= */
document.addEventListener("click", function (event) {
  const favoriteButton = event.target.closest("[data-favorite]");
  const addButton = event.target.closest("[data-add]");
  const seasonButton = event.target.closest("[data-search]");

  if (favoriteButton) {
    const productId = Number(favoriteButton.dataset.favorite);
    if (favorites.includes(productId)) {
      favorites = favorites.filter((id) => id !== productId);
      showToast("Produto removido dos favoritos.");
    } else {
      favorites.push(productId);
      showToast("Produto adicionado aos favoritos.");
    }
    saveFavorites();
    renderProducts();
  }

  if (addButton) {
    const productId = Number(addButton.dataset.add);
    addToCart(productId);
  }

  if (seasonButton) {
    currentSearch = seasonButton.dataset.search;
    if (searchInput) searchInput.value = currentSearch;
    activeCategory = "todos";
    showingAllProducts = true;

    document.querySelectorAll(".category").forEach((category) => {
      category.classList.remove("active");
      if (category.dataset.category === "todos") {
        category.classList.add("active");
      }
    });

    renderProducts();
    const secProdutos = document.getElementById("produtos");
    if (secProdutos) {
      secProdutos.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
});

/* =========================================================
   CARRINHO
   ========================================================= */
function addToCart(productId) {
  const item = cart.find((cartItem) => Number(cartItem.id) === Number(productId));

  if (item) {
    item.quantity += 1;
  } else {
    cart.push({
      id: productId,
      quantity: 1
    });
  }

  saveCart();
  updateCart();

  const product = getProductById(productId);
  showToast(`<b>${product?.name || "Produto"}</b> foi adicionado ao carrinho.`);
}

function updateCart() {
  const totalItems = cart.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );
  if (cartCount) cartCount.textContent = totalItems;
  if (cartCountMobile) cartCountMobile.textContent = totalItems;
  renderCartItems();
}

function renderCartItems() {
  if (!cartItems || !cartEmpty || !cartSummary || !cartItemsText || !cartTotal) return;

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartEmpty.classList.remove("hide");
    cartSummary.classList.add("hide");
    cartItemsText.textContent = "Seu carrinho está vazio.";
    return;
  }

  cartEmpty.classList.add("hide");
  cartSummary.classList.remove("hide");

  const totalItems = cart.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );
  cartItemsText.textContent = `${totalItems} item(ns) adicionado(s) ao seu pedido.`;

  let total = 0;
  cart.forEach((item) => {
    const product = getProductById(item.id);
    if (!product) return;

    const qtd = item.quantity || 0;
    const preco = Number(product.price) || 0;
    const subtotal = preco * qtd;
    total += subtotal;

    cartItems.innerHTML += `
      <div class="cart-item">
        <img
          src="${product.image || "/imagens/sem-imagem.jpg"}"
          alt="${product.name || "Produto"}"
          class="cart-item-image"
        >
        <div>
          <h5>${product.name || "Produto"}</h5>
          <small>${product.unit || ""}</small>
          <div class="cart-item-price">${formatPrice(subtotal)}</div>
          <button
            type="button"
            class="remove-item"
            data-remove="${product.id}"
          >
            Remover
          </button>
        </div>
        <div class="cart-controls">
          <button
            type="button"
            data-decrease="${product.id}"
            aria-label="Diminuir quantidade de ${product.name || "Produto"}"
          >
            <i class="material-icons">remove</i>
          </button>
          <span>${qtd}</span>
          <button
            type="button"
            data-increase="${product.id}"
            aria-label="Aumentar quantidade de ${product.name || "Produto"}"
          >
            <i class="material-icons">add</i>
          </button>
        </div>
      </div>
    `;
  });

  cartTotal.textContent = formatPrice(total);
}

document.addEventListener("click", function (event) {
  const increaseButton = event.target.closest("[data-increase]");
  const decreaseButton = event.target.closest("[data-decrease]");
  const removeButton = event.target.closest("[data-remove]");

  if (increaseButton) {
    const productId = Number(increaseButton.dataset.increase);
    const item = cart.find((cartItem) => Number(cartItem.id) === productId);
    if (item) {
      item.quantity = (item.quantity || 0) + 1;
      saveCart();
      updateCart();
    }
  }

  if (decreaseButton) {
    const productId = Number(decreaseButton.dataset.decrease);
    const item = cart.find((cartItem) => Number(cartItem.id) === productId);
    if (item && (item.quantity || 0) > 1) {
      item.quantity -= 1;
    } else {
      cart = cart.filter((cartItem) => Number(cartItem.id) !== productId);
    }
    saveCart();
    updateCart();
  }

  if (removeButton) {
    const productId = Number(removeButton.dataset.remove);
    cart = cart.filter((cartItem) => Number(cartItem.id) !== productId);
    saveCart();
    updateCart();
    showToast("Produto removido do carrinho.");
  }
});

/* =========================================================
   FINALIZAR PEDIDO
   ========================================================= */
const botaoFinalizar = document.getElementById("checkoutButton");
if (botaoFinalizar) {
  botaoFinalizar.addEventListener("click", function () {
    if (cart.length === 0) {
      showToast("Seu carrinho ainda está vazio.");
      return;
    }
    showToast("Pedido iniciado! Em uma loja real, você seguiria para o pagamento.");
  });
}

/* =========================================================
   CEP
   ========================================================= */
if (cepInput) {
  cepInput.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, "");
    if (value.length > 5) {
      value = `${value.slice(0, 5)}-${value.slice(5, 8)}`;
    }
    this.value = value;
  });
}

if (cepForm) {
  cepForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!cepInput) return;

    const cep = cepInput.value.replace(/\D/g, "");
    if (cep.length !== 8) {
      showToast("Digite um CEP válido com 8 números.");
      return;
    }

    if (cepButtonText) cepButtonText.textContent = `CEP: ${cepInput.value}`;
    const modalElement = document.getElementById("cepModal");
    if (modalElement && typeof M !== "undefined") {
      const modalInstance = M.Modal.getInstance(modalElement);
      if (modalInstance) modalInstance.close();
    }
    showToast("Entrega consultada para a sua região.");
  });
}

/* =========================================================
   NEWSLETTER
   ========================================================= */
if (newsletterForm) {
  newsletterForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const emailEl = document.getElementById("newsletterEmail");
    const email = emailEl ? emailEl.value.trim() : "";

    if (email === "") return;

    showToast("Cadastro realizado! Você receberá nossas novidades.");
    this.reset();
  });
}