const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const path = require('path');
const fs = require("fs");//!

const uploadDir = path.join(__dirname, '/uploads');//3.definir pastar
//.verifica se a pastat  de aquirvos já existe  no servidor
if (!fs.existsSync(uploadDir)) {
    fs.mkdir(uploadDir);//5...se não existir ele cria ela 
}

//import as rotas a serem usada 
const rotasVendedor = require("./routes/vendedor.route.js");
const rotasProduto = require("./routes/product.route.js");
const rotasCooperativa = require("./routes/cooperativa.route.js");
const rotasCooperativaVendedor = require("./routes/cooperativa_vendedor.route.js");

const app = express();//inicializar osevidor express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));//!
app.use(helmet());//protege o cabeçalho das request
app.use(cors());
app.use(morgan('dev'));

//cria um ponto para udo da rotas
app.use("/api", rotasVendedor);
app.use("/api", rotasProduto);
app.use("/api", rotasCooperativa);
app.use("/api", rotasCooperativaVendedor);

app.get("/status", async (req, res) => {
    res.json({ mensagem: "funcionando", status: 200 })
});


//9. faz o express usar o diretório de uploads
app.use('/uploads', express.static(uploadDir));

app.listen(3000, () => console.log('ok'));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));