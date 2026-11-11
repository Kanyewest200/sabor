const formCadastro =document.getElementById('formCadastro');

formCadastro.addEventListener( "submit",async(event )=>{ 
    event.preventDefault();

    const dados = new FormData(formCadastro);

     try {
        const response = await fetch("http://localhost:3000/api/vendedor/cadastrar", {
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
