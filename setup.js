const db = require("./configs/database.js");

async function criarTabela() {
    try {
        await db.schema.createTableIfNotExists('produtos',
            (table) => {
                table.increments('id_produto').primary();
                table.string('nome_produto').notNullable();
                table.text('imagem_produto');
                table.decimal('valor_produto', 10, 2).notNullable();
                table.text('descricao_produto');
                table.string('medida_produto');

            }
        );

        await db.schema.createTableIfNotExists('cooperativas',
            (table) => {
                table.increments('id_cooperativa').primary();
                table.string('nome_cooperativa').notNullable();
                table.text('localidade_cooperativa');
                table.text('imagem_cooprativa');
                table.string('telefone_cooperativa');
                table.string('email_cooperativa');
            }
        );

        await db.schema.createTableIfNotExists('vendedores',
            (table) => {
                table.increments('id_vendedor').primary();
                table.string('nome_vendedor').notNullable();
                table.string('telefon_vendedor');
                table.string('email_vendedor');
                table.string('senha_vendedor').notNullable;
                table.string('localidade_vendedor');
                table.text('imagem_vendedor');
            }
        );

        await db.schema.createTableIfNotExists('cooperativas_vendedores',
            (table) => {
                table.increments('id_cooperativa_vendedor').primary();
                table.integer('id_cooperativa').unsigned().notNullable();
                table.foreign('id_cooperativa').references('id_cooperativa').inTable('cooperativas').onDelete('cascade');

                table.integer('id_vendedor').unsigned().notNullable();
                table.foreign('id_vendedor').references('id_vendedor').inTable('vendedores').onDelete('cascade');
            }
        );

        await db.schema.createTableIfNotExists('products ',
            (table) => {
                table.increments('id').primary();
                table.string('name').notNullable();
                table.string('category');
                table.string('categoryLabel');
                table.string('unit');
                table.decimal('price', 10, 2).notNullable();
                table.decimal('oldPrice', 10, 2).notNullable();
                table.string('badge');
                table.text('image');
            });
    } catch (error) {
        console.error("erro ao criar tabelas", error);
        process.exit(1);
    }
}

criarTabela();