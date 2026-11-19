const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, '/uploads'); //3. Defina pasta: /sabor/uploads
//Verifica se a pasta de arquivos não existe no servidor
if(!fs.existsSync(uploadDir)){
     fs.mkdir(uploadDir);//5... se não existir ele cria ela.
}

//Importar as rotas a serem usadas
const rotasVendedor = require("./routes/vendedor.route.js");
const rotasProduto = require("./routes/product.route.js");
const rotasCooperativa = require("./routes/cooperativa.route.js");
const rotasCooperativaVendedor = require("./routes/cooperativa_vendedor.route.js");

const app = express();//Inicializa o servidor express
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(helmet());//Protege o cabeçalho da solicitação
app.use(cors());
app.use(morgan('dev'));

//Cria um ponto para uso das Rotas
app.use("/api", rotasVendedor);
app.use("/api", rotasProduto);
app.use("/api", rotasCooperativa);
app.use("/api", rotasCooperativaVendedor);
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: [ "'self'", "data:", "blob:" ],
                //scriptSrc: [ "'self'" ],
                //styleSrc: [ "'self'", "'unsafe-inline'" ],
                //connectSrc: [ "'self'" ],
                //objectSrc: [ "'nenhum'" ],
                baseUri: [ "'self'" ],
                formAction: [ "'self'" ],
                frameAncestors: [ "'self'" ]
            }
        }
    })
);

app.get("/status", async (req, res)=>{
    res.json({mensagem: "Funcionando", status: 200});
});

//9. Faça o Express usar o diretório de uploads
app.use('/uploads', express.static(uploadDir));

app.listen(3000, ()=> console.log('OK'));

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, "public")));