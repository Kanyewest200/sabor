const formProduto = document.getElementById("formProduto");

formProduto.addEventListener("submit", async (event) => {
    event.preventDefault();

    const dados = new FormData(formProduto);
    console.info(JSON.stringify(dados, null, 2));

    try {
        const response = await fetch("http://localhost:3000/api/produto/cadastrar", {
            method: "POST",
            body: dados
        });

        const resultado = await response.json();

        if (!response.ok) {
            throw new Error(resultado.mensagem);
        }

        console.log(resultado);

        //MOstra um alerta com uma mensagem
        alert(resultado.mensagem);

        //Zera todos os campos do formúlario HTML
        formProduto.reset();

    } catch (error) {
        console.log(error);
    }
});