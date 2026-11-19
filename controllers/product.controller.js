const db = require("../configs/database.js");

const ProductController = {
    /**
     * Função para cadastro de produtos
     * @param {*} req 
     * @param {*} res 
     */
    async cadastrar(req, res) {
        if (!req.file) {
            return res.status(400).json({ error: "Imagem não enviada" });
        }

        try {
            const {
                name,
                category,
                categoryLabel,
                unit,
                price,
                oldPrice,
                badge
            } = req.body;

            const image = req.file;

            const dados = {
                image: `/uploads/${image.filename}`,
                name: name,
                category: category,
                categoryLabel: categoryLabel,
                unit: unit,
                price: normalizar(price),
                oldPrice: normalizar(oldPrice),
                badge: badge
            };

            const [id] = await db('products').insert(dados);

            res.status(201).json({ mensagem: "produto cadastrado", id });
        } catch (error) {
            res.status(500).json({
                mensagem: "erro ao cadastrar produto",
                erro: error.message
            })
        }

    },
    /**
     * Função para listar os produtos cadastrados
     * @param {*} req 
     * @param {*} res 
     */
    async listar(req, res) {
        const produtos = await db('products').select('*');
        res.status(201).json(produtos);
    },
    /**
     * Função para atualizar os dados do produto
     * @param {*} req 
     * @param {*} res 
     */
    async atualizar(req, res) {
        try {
            const {
                name,
                category,
                categoryLabel,
                unit,
                price,
                oldPrice,
                badge
            } = req.body;

            const dados = {
                name: name,
                category: category,
                categoryLabel: categoryLabel,
                unit: unit,
                price: normalizar(price),
                oldPrice: normalizar(oldPrice),
                badge: badge
            };

            if (req.file) {
                const image = req.file;
                dados.image = `/uploads/${image.filename}`;
            }

            await db('products')
                .where({ id: req.params.id })
                .update(dados);

            res.status(201).json({ mensagem: "produto atualizado", id: req.params.id });
        } catch (error) {
            res.status(500).json({
                mensagem: "erro ao cadastrar produto",
                erro: error.message
            })
        }
    },
    /**
     * Função para remover produto
     * @param {*} req 
     * @param {*} res 
     */
    async apagar(req, res) {
        await db('products')
            .where({ id: req.params.id })
            .del();
        res.json({ mensagem: "Produto removido!" });
    },
};

//Função para transformar texto em número
function normalizar(numero) {
    let auxiliar = numero.replace(",", ".");
    return Number(auxiliar);
}

module.exports = ProductController;