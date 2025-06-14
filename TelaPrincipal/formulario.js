window.addEventListener("DOMContentLoaded", function () {
  const user = localStorage.getItem("user");

  if (user) {
    const userData = JSON.parse(user);
    const nomeUsuario = document.getElementById("nome-usuario");

    if (nomeUsuario && userData.nome) {
      nomeUsuario.textContent = userData.nome;
    }
  }

  const token = localStorage.getItem('authToken');

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  axios.get("http://localhost:3000/user/home", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(response => {
    const documentos = response.data.Formularios;
    const list = document.getElementById("forms");
    list.innerHTML = ""; // <-- ISSO LIMPA A LISTA ANTES DE ADICIONAR NOVOS ELEMENTOS


    documentos.forEach(doc => {
      const div = document.createElement('div');
      div.classList.add('formcriado');

      div.innerHTML = `
        <div>
          <strong>TÍTULO: ${doc.Titulo}</strong><br>
          STATUS: ${doc.Status}
        </div>
        <div class="codigo">ID: ${doc.IdForm}</div>
      `;

      div.style.cursor = 'pointer';
      div.addEventListener('click', () => {
        // Redireciona para listagemformulario.html com o código na URL
        window.location.href = `listagemformulario.html?id=${doc.IdForm}`;
      });

      list.appendChild(div);
    });
  }).catch(error => {
    console.error('Erro ao carregar formulários do backend:', error);
  });
});
