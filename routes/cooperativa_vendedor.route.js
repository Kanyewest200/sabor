const express = require('express');
const router = express.Router();

const CooperativaVendedorController = require('../controllers/cooperativa_vendedor.controller.js');

//rotas para uso do Controlador de cooperativas vendedores
router.post("/cooperativa-vendedor/adicionar", CooperativaVendedorController.adicionar);
router.get("/cooperativa-vendedor/listar", CooperativaVendedorController.listar);
router.post("/cooperativa-vendedor/remover/:id_cooperativa_vendedor", CooperativaVendedorController.remover);

module.exports = router;