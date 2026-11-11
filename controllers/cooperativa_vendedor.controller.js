const db = require("../configs/database.js");

const CooperativaVendedorController = {
  /**
   * função para cadastro de Cooperativas_vendedores
   * @param {*} req 
   * @param {*} res 
   */
  async adicionar(req, res) {
    try {
      const [id] = await db('cooperativas_vendedores').insert(req.body);
      res.status(201).json({ mensagem: " vendedor adicionado", id });

    } catch (error) {
      res.status(500).json({
        mensagem: "erro ao dicionar vendedor  à cooperativa",
        erro: error.message
      })

    }
  },
  /**
   * função pra listar as cooperativas_vendedores cadastradas
   * @param {*} req 
   * @param {*} res 
   */
  async listar(req, res) {
    try {
      const result = await db('cooperativas_vendedores')
        .join('cooperativas', 'cooperativas.id_cooperativa', '=', 'cooperativas_vendedores.id_cooperativa')
        .join('vendedores', 'vendedores.id_vendedor', '=', 'cooperativas_vendedores.id_vendedor')
        .select('*')
      res.status(201).json(result);


    } catch (error) {
      res.status(500).json({
        erro: error.mensage,
        mensagem: "error.message"
      })
    }
  },
  
  /**
   * função para remover coopetiva_vendedor
   * @param {*} req 
   * @param {*} res 
   */
  async remover (req, res) {
    await db('cooperativas_vendedores').where({ id_cooperativa: req.params.id_cooperativa }).del();
    res.json({ mensagem: 'vendedor removido da cooperativa!' })
  }
};

module.exports = CooperativaVendedorController;