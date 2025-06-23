function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp está em segundos desde 1970-01-01
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    return true; // token inválido
  }
}

const token = localStorage.getItem('authToken');
if (!token) {
  alert("Você precisa estar logado para acessar esta página.");
  window.location.href = "../login/index.html"; 
}

if (isTokenExpired(token)) {
  alert("Sua sessão expirou. Faça login novamente.");
  window.location.href = "../login/index.html";
}

window.addEventListener("DOMContentLoaded", function () {
  const user = localStorage.getItem("user");

  if (user) {
    const userData = JSON.parse(user);
    const nomeUsuario = document.getElementById("nome-usuario");

    if (nomeUsuario && userData.nome) {
      nomeUsuario.textContent = userData.nome;
    }
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

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("userMenuToggle");
  const userMenu = document.getElementById("userMenu");
  const logoutBtn = document.getElementById("logoutBtn");
  const userEmailSpan = document.getElementById("userEmail");

  // Lê o token e exibe o e-mail
  const token = localStorage.getItem("authToken");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userEmailSpan.textContent = payload.email || "Usuário";
    } catch (e) {
      userEmailSpan.textContent = "Usuário";
    }
  }

  // Alternar visibilidade do menu
  menuToggle.addEventListener("click", () => {
    userMenu.classList.toggle("hidden");
  });

  // Fechar se clicar fora
  document.addEventListener("click", function (e) {
    if (!document.querySelector(".user-menu-wrapper").contains(e.target)) {
      userMenu.classList.add("hidden");
    }
  });

  // Sair
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("authToken");
    window.location.href = "../Login/index.html";
  });
});

