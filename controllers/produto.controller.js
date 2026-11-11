const db = require("../configs/database.js");

const ProdutosController = {
  /**
   * função para cadastro de produtos
   * @param {*} req 
   * @param {*} res 
   */
  async cadastrar(req, res) {
    try {
      const [id] = await db('produtos').insert(req.body);
      res.status(201).json({ mensagem: "produtos cadastrado", id });

    } catch (error) {
      res.status(500).json({
        mensagem: "erro ao cadastrar produto",
        erro: error.message
      })

    }
  },
  /**
   * função pra listar os produtos cadastrados
   * @param {*} req 
   * @param {*} res 
   */
  async listar(req, res) {
    const produto = await db('produtos').select('*');
    res.json({ produto });
  },
  /**
   * função para atualizar os dados do produtos
   * @param {} req 
   * @param {*} res 
   */
  async atualizar(req, res) {
    await db('produtos').where({ id_produto: req.params.id_produto }).update(req.body);
    res.json({ mensagem: 'poduto atualizado com sucesso!' });
  },
  /**
   * função para remover produtos
   * @param {*} req 
   * @param {*} res 
   */
  async apagar(req, res) {
    await db('produtos').where({ id_produto: req.params.id_produto }).del();
    res.json({ mensagem: 'produto removido com sucesso!' })
  }
};

module.exports = ProdutosController;