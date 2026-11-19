"use strict";

/*
- Exemplos:
- ""     -> /produto/listar
- "/api" -> /api/produto/listar
 */
const API_BASE = "http://localhost:3000/api/";

const $ = (id) => document.getElementById(id);

const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});

const state = {
    products: [],
    editingId: null,
    editingImage: "",
    deletingProduct: null,
    loading: false,
    saving: false,
    deleting: false,
    loaded: false,
    previewObjectURL: null
};

const productDialog = $("product-dialog");
const deleteDialog = $("delete-dialog");
const form = $("product-form");

function apiURL(path) {
    return `${API_BASE.replace(/\/$/, "")}${path}`;
}

/*
- Centraliza o tratamento de erros HTTP e respostas da API.
- Não interpreta uma resposta de erro como sucesso.
 */
async function request(path, options = {}) {
    let response;

    try {
        response = await fetch(apiURL(path), {
            credentials: "same-origin",
            ...options
        });
    } catch {
        throw new Error(
            "Não foi possível conectar ao servidor. Verifique a conexão."
        );
    }

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            if (response.ok) {
                throw new Error("O servidor retornou uma resposta JSON inválida.");
            }
        }
    }

    if (!response.ok) {
        const details = data && typeof data === "object"
            ? [data.mensagem, data.error, data.erro]
                .filter((item) => typeof item === "string")
            : [];

        throw new Error(
            details.join(" — ") ||
            `Não foi possível concluir a operação. HTTP ${response.status}.`
        );
    }

    return data;
}

function showMessage(element, message, error = false) {
    element.textContent = message;
    element.classList.toggle("error", error);
    element.hidden = false;
}

function clearMessage(element) {
    element.hidden = true;
    element.textContent = "";
}

function notify(message, error = false) {
    showMessage($("global-message"), message, error);
}

function normalizeSearch(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

/*
- Aceita apenas URLs HTTP(S), inclusive caminhos relativos.
- URLs locais blob: são usadas somente na prévia do arquivo.
 */
function resolveImageURL(value) {
    if (!String(value ?? "").trim()) return "";

    try {
        const base = new URL(
            `${API_BASE.replace(/\/$/, "")}/`,
            window.location.href
        );
        const url = new URL(String(value).trim(), base);

        return ["http:", "https:"].includes(url.protocol)
            ? url.href
            : "";
    } catch {
        return "";
    }
}

function mountImage(container, source, alt) {
    container.replaceChildren();

    if (!source) {
        container.textContent = "Sem imagem";
        return;
    }

    const image = document.createElement("img");
    image.src = source;
    image.alt = alt;
    image.loading = "lazy";

    image.addEventListener("error", () => {
        container.replaceChildren();
        container.textContent = "Sem imagem";
    }, { once: true });

    container.append(image);
}

function releasePreview() {
    if (state.previewObjectURL) {
        URL.revokeObjectURL(state.previewObjectURL);
        state.previewObjectURL = null;
    }
}

function setPreview(source) {
    mountImage($("image-preview"), source, "Prévia do produto");
}

function formatMoney(value) {
    const number = Number(value);
    return Number.isFinite(number) ? currency.format(number) : "—";
}

/*
- DECIMAL(10,2): até oito dígitos inteiros e dois decimais.
- A interface usa preços não negativos.
- Retorna string com ponto decimal ou string vazia se opcional e não preenchido.
 */
function parseMoney(value, label, required = false) {
    const stringValue = String(value ?? "").trim();

    if (!stringValue) {
        if (required) {
            throw new Error(`${label}: informe um valor válido.`);
        }
        return ""; // Permite campos opcionais vazios (como oldPrice)
    }

    const normalized = stringValue.replace(",", ".");

    if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(normalized)) {
        throw new Error(
            `${label}: informe um valor entre 0 e 99999999,99, ` +
            "com até duas casas decimais e sem separador de milhar."
        );
    }

    return Number(normalized).toFixed(2);
}

function populateCategoryFilter() {
    const select = $("category-filter");
    const selected = select.value;
    const categories = new Map();

    for (const product of state.products) {
        const code = String(product.category ?? "").trim();

        if (code && !categories.has(code)) {
            categories.set(
                code,
                String(product.categoryLabel || code)
            );
        }
    }

    select.replaceChildren(new Option("Todas as categorias", ""));

    const entries = [...categories.entries()].sort(
        (a, b) => a[1].localeCompare(b[1], "pt-BR")
    );

    for (const [code, label] of entries) {
        select.add(new Option(`${label} (${code})`, code));
    }

    if (categories.has(selected)) select.value = selected;
}

function updateStats() {
    const categories = new Set(
        state.products
            .map((product) => String(product.category ?? "").trim())
            .filter(Boolean)
    );

    const offers = state.products.filter((product) => {
        const price = Number(product.price);
        const oldPrice = Number(product.oldPrice);

        return Number.isFinite(price) &&
            Number.isFinite(oldPrice) &&
            oldPrice > price;
    });

    $("stat-products").textContent = state.products.length;
    $("stat-categories").textContent = categories.size;
    $("stat-offers").textContent = offers.length;
}

function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}

function createRow(product) {
    const row = document.createElement("tr");

    const productCell = document.createElement("td");
    const productContent = createTextElement("div", "product-cell", "");
    const thumbnail = createTextElement("div", "thumbnail", "");

    mountImage(thumbnail, resolveImageURL(product.image), "");

    const details = document.createElement("div");

    details.append(
        createTextElement(
            "span",
            "product-name",
            product.name || "Produto sem nome"
        ),
        createTextElement(
            "span",
            "muted",
            `#${product.id} · ${product.unit || "Unidade não informada"}`
        )
    );

    productContent.append(thumbnail, details);
    productCell.append(productContent);

    const categoryCell = document.createElement("td");
    categoryCell.append(
        createTextElement(
            "span",
            "pill",
            product.categoryLabel || product.category || "Sem categoria"
        )
    );

    const priceCell = document.createElement("td");
    priceCell.append(
        createTextElement("span", "price", formatMoney(product.price))
    );

    if (Number(product.oldPrice) > Number(product.price)) {
        priceCell.append(
            createTextElement(
                "span", "old-price", formatMoney(product.oldPrice)
            )
        );
    }

    const badgeCell = document.createElement("td");
    badgeCell.append(
        createTextElement(
            "span",
            product.badge ? "pill" : "muted",
            product.badge || "—"
        )
    );

    const actionsCell = document.createElement("td");
    const actions = createTextElement("div", "actions", "");

    const edit = createTextElement(
        "button",
        "button button-secondary button-small",
        "Editar"
    );

    edit.type = "button";
    edit.setAttribute("aria-label", `Editar ${product.name}`);
    edit.addEventListener("click", () => openProduct(product));

    const remove = createTextElement(
        "button",
        "button button-delete button-small",
        "Excluir"
    );

    remove.type = "button";
    remove.setAttribute("aria-label", `Excluir ${product.name}`);
    remove.addEventListener("click", () => openDelete(product));

    actions.append(edit, remove);
    actionsCell.append(actions);

    row.append(productCell, categoryCell, priceCell, badgeCell, actionsCell);

    return row;
}

function renderProducts() {
    if (!state.loaded) return;

    const search = normalizeSearch($("search").value);
    const category = $("category-filter").value;

    const filtered = state.products.filter((product) => {
        const matchesCategory = !category ||
            String(product.category ?? "").trim() === category;

        const text = normalizeSearch([
            product.id,
            product.name,
            product.category,
            product.categoryLabel,
            product.badge
        ].join(" "));

        return matchesCategory && text.includes(search);
    });

    const body = $("products-body");
    const fragment = document.createDocumentFragment();

    for (const product of filtered) {
        fragment.append(createRow(product));
    }

    body.replaceChildren(fragment);

    $("table-container").hidden = filtered.length === 0;
    $("list-state").hidden = filtered.length > 0;

    if (!filtered.length) {
        $("list-state").textContent = state.products.length
            ? "Nenhum produto corresponde aos filtros informados."
            : "Nenhum produto cadastrado. Clique em “Novo produto” para começar.";
    }

    $("list-count").textContent =
        `${filtered.length} de ${state.products.length} produto(s) exibido(s).`;
}

async function loadProducts() {
    if (state.loading) return false;

    state.loading = true;
    $("reload").disabled = true;
    $("catalogo").setAttribute("aria-busy", "true");

    if (!state.loaded) {
        $("list-state").hidden = false;
        $("list-state").textContent = "Carregando produtos...";
    }

    try {
        const products = await request("/produto/listar");

        if (!Array.isArray(products)) {
            throw new Error("A listagem deve retornar um array de produtos.");
        }

        state.products = products;
        state.loaded = true;

        populateCategoryFilter();
        updateStats();
        renderProducts();

        return true;
    } catch (error) {
        notify(error.message, true);

        if (!state.loaded) {
            $("list-state").textContent = "Não foi possível carregar os produtos. Tente atualizar a lista.";
        }

        return false;
    } finally {
        state.loading = false;
        $("reload").disabled = false;
        $("catalogo").setAttribute("aria-busy", "false");
    }
}

function openProduct(product = null) {
    form.reset();
    clearMessage($("form-message"));
    releasePreview();

    state.editingId = product ? product.id : null;
    state.editingImage = product?.image ?? "";

    const editing = state.editingId !== null;

    $("dialog-title").textContent = editing
        ? "Editar produto"
        : "Novo produto";

    $("save-product").textContent = editing
        ? "Salvar alterações"
        : "Cadastrar produto";

    // A imagem fica disponível nas duas operações.
    $("upload-field").hidden = false;
    $("image-file").disabled = false;

    // Obrigatória somente no cadastro.
    $("image-file").required = !editing;

    const fields = [
        "name",
        "category",
        "categoryLabel",
        "unit",
        "badge",
        "price",
        "oldPrice"
    ];

    for (const field of fields) {
        $(field).value = product?.[field] ?? "";
    }

    // Na edição, mostra a imagem que já está cadastrada.
    // No cadastro, mostra "Sem imagem".
    setPreview(resolveImageURL(state.editingImage));

    productDialog.showModal();

    $("name").focus();
}

function setSaving(saving) {
    state.saving = saving;
    $("product-fields").disabled = saving;
    $("save-product").disabled = saving;
    $("cancel-product").disabled = saving;
    $("close-product").disabled = saving;
    $("save-product").textContent = saving
        ? "Salvando..."
        : state.editingId !== null
            ? "Salvar alterações"
            : "Cadastrar produto";
}


form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (state.saving) return;

    clearMessage($("form-message"));

    const editing = state.editingId !== null;

    try {
        const name = $("name").value.trim();

        if (!name) {
            throw new Error("Informe o nome do produto.");
        }

        const payload = {
            name,
            category: $("category").value.trim(),
            categoryLabel: $("categoryLabel").value.trim(),
            unit: $("unit").value.trim(),
            price: parseMoney($("price").value, "Preço atual", true),
            oldPrice: parseMoney($("oldPrice").value, "Preço anterior", false),
            badge: $("badge").value.trim()
        };

        const file = $("image-file").files[0];

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        let path;
        let options;

        // CADASTRO
        if (!editing) {

            // Imagem obrigatória.
            if (!file) {
                throw new Error("Selecione a imagem do produto.");
            }

            if (!allowedTypes.includes(file.type)) {
                throw new Error(
                    "Selecione uma imagem JPEG, PNG, WebP ou GIF."
                );
            }

            const data = new FormData();

            for (const [key, value] of Object.entries(payload)) {
                data.append(key, value);
            }

            data.append("image", file);

            path = "/produto/cadastrar";

            options = {
                method: "POST",
                body: data
            };

        } else {

            // ATUALIZAÇÃO
            path = `/produto/atualizar/${encodeURIComponent(state.editingId)}`;

            if (file) {

                // Se escolheu uma nova imagem, valida e envia o arquivo.
                if (!allowedTypes.includes(file.type)) {
                    throw new Error(
                        "Selecione uma imagem JPEG, PNG, WebP ou GIF."
                    );
                }

                const data = new FormData();

                for (const [key, value] of Object.entries(payload)) {
                    data.append(key, value);
                }

                data.append("image", file);

                options = {
                    method: "POST",
                    body: data
                };

            } else {

                // Sem nova imagem: preserva a imagem existente.
                payload.image = state.editingImage;

                options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                };
            }
        }

        setSaving(true);

        await request(path, options);

        productDialog.close();

        notify(
            editing
                ? "Produto atualizado com sucesso."
                : "Produto cadastrado com sucesso."
        );

        const refreshed = await loadProducts();

        if (!refreshed) {
            notify(
                "A operação foi concluída, mas a lista não pôde ser " +
                "recarregada. Clique em “Atualizar lista”.",
                true
            );
        }

    } catch (error) {

        showMessage(
            $("form-message"),
            error.message,
            true
        );

    } finally {

        setSaving(false);

    }
});

$("image-file").addEventListener("change", () => {
    releasePreview();

    const file = $("image-file").files[0];

    if (!file) {
        // Se o usuário cancelar a seleção durante a edição,
        // volta a mostrar a imagem original.
        setPreview(
            resolveImageURL(state.editingImage)
        );

        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    if (!allowedTypes.includes(file.type)) {
        setPreview(
            resolveImageURL(state.editingImage)
        );

        showMessage(
            $("form-message"),
            "Selecione uma imagem JPEG, PNG, WebP ou GIF.",
            true
        );

        $("image-file").value = "";

        return;
    }

    clearMessage($("form-message"));

    state.previewObjectURL = URL.createObjectURL(file);

    setPreview(state.previewObjectURL);
});



function closeProduct() {
    if (!state.saving) productDialog.close();
}

$("close-product").addEventListener("click", closeProduct);
$("cancel-product").addEventListener("click", closeProduct);

productDialog.addEventListener("cancel", (event) => {
    if (state.saving) event.preventDefault();
});

productDialog.addEventListener("close", releasePreview);

function openDelete(product) {
    state.deletingProduct = product;
    clearMessage($("delete-message"));

    $("delete-description").textContent = `Deseja excluir “${product.name}” do catálogo?`;

    deleteDialog.showModal();
}

$("cancel-delete").addEventListener("click", () => {
    if (!state.deleting) deleteDialog.close();
});

deleteDialog.addEventListener("cancel", (event) => {
    if (state.deleting) event.preventDefault();
});

$("confirm-delete").addEventListener("click", async () => {
    if (state.deleting || !state.deletingProduct) return;

    state.deleting = true;
    $("confirm-delete").disabled = true;
    $("cancel-delete").disabled = true;
    $("confirm-delete").textContent = "Excluindo...";
    clearMessage($("delete-message"));

    try {
        const id = encodeURIComponent(state.deletingProduct.id);

        await request(`/produto/apagar/${id}`, { method: "POST" });

        deleteDialog.close();
        notify("Produto excluído com sucesso.");

        const refreshed = await loadProducts();

        if (!refreshed) {
            notify(
                "O produto foi excluído, mas a lista não pôde ser " +
                "recarregada. Clique em “Atualizar lista”.",
                true
            );
        }
    } catch (error) {
        showMessage($("delete-message"), error.message, true);
    } finally {
        state.deleting = false;
        $("confirm-delete").disabled = false;
        $("cancel-delete").disabled = false;
        $("confirm-delete").textContent = "Excluir produto";
    }
});

$("new-product").addEventListener("click", () => openProduct());
$("search").addEventListener("input", renderProducts);
$("category-filter").addEventListener("change", renderProducts);

$("reload").addEventListener("click", async () => {
    clearMessage($("global-message"));

    if (await loadProducts()) {
        notify("Lista atualizada.");
    }
});

loadProducts();