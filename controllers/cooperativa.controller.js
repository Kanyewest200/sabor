const db = require("../configs/database.js");

const CooperativaController = {
  /**
   * função para cadastro de Cooperativas
   * @param {*} req 
   * @param {*} res 
   */
  async cadastrar(req, res) {
    try {
      const [id] = await db('cooperativas').insert(req.body);
      res.status(201).json({ mensagem: "cooperativa cadastrado", id });

    } catch (error) {
      res.status(500).json({
        mensagem: "erro ao cadastrar cooperativa",
        erro: error.message
      })

    }
  },
  /**
   * função pra listar as cooperativas cadastradas
   * @param {*} req 
   * @param {*} res 
   */
  async listar(req, res) {
    try {
      const cooperativas = await db('cooperativas').select('*');
      res.json({ cooperativas });

    } catch (error) {
      res.status(500).json({
        erro: error.mensage,
        mensagem: "error.message"
      })
    }
  },
  /**
   * função para atualizar os dados da cooperativa
   * @param {} req 
   * @param {*} res 
   */
  async atualizar(req, res) {
    await db('cooperativas').where({ id_cooperativa: req.params.id_cooperativa }).update(req.body);
    res.json({ mensagem: 'cooperativa atualizado com sucesso!' });
  },
  /**
   * função para remover coopetiva
   * @param {*} req 
   * @param {*} res 
   */
  async apagar(req, res) {
    await db('cooperativas').where({ id_cooperativa: req.params.id_cooperativa }).del();
    res.json({ mensagem: 'cooperativa removido com sucesso!' })
  }
};

module.exports = CooperativaController;