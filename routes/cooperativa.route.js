const express = require('express');
const router = express.Router();

const CooperativaController = require('../controllers/cooperativa.controller.js');

//rotas para uso do Controlador de vendedores
router.post("/cooperativa/cadastrar", CooperativaController.cadastrar);
router.get("/cooperativa/listar", CooperativaController.listar);
router.post("/cooperativa/atualizar/:id_cooperativa", CooperativaController.atualizar);
router.post("/cooperativa/apagar/:id_cooperativa", CooperativaController.apagar);

module.exports = router;