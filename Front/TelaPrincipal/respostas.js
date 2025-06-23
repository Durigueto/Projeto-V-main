// Função para buscar e mostrar perguntas e respostas do formulário
function carregarFormulario() {
    const params = new URLSearchParams(window.location.search);
    const idFormulario = params.get('id');
  
    if (!idFormulario) {
      console.error("ID do formulário não encontrado na URL");
      return;
    }
  
    // Fazer requisição para API (ajuste a URL conforme seu backend)
    fetch(`/api/formularios/${idFormulario}/perguntas`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        mostrarPerguntasERepostas(data);
      })
      .catch(error => {
        console.error('Erro ao carregar dados:', error);
      });
  }
  
  // Função para renderizar perguntas e respostas no HTML
  function mostrarPerguntasERepostas(dados) {
    const container = document.getElementById('container-perguntas');
    container.innerHTML = ''; // limpa conteúdo anterior
  
    dados.forEach(pergunta => {
      const divPergunta = document.createElement('div');
      divPergunta.classList.add('pergunta');
  
      // Título da pergunta
      const titulo = document.createElement('h3');
      titulo.textContent = pergunta.texto; // ou o campo correto do seu objeto pergunta
      divPergunta.appendChild(titulo);
  
      // Lista das respostas
      const listaRespostas = document.createElement('ul');
      pergunta.respostas.forEach(resposta => {
        const item = document.createElement('li');
        item.textContent = resposta.texto; // ajuste conforme sua estrutura
        listaRespostas.appendChild(item);
      });
      divPergunta.appendChild(listaRespostas);
  
      container.appendChild(divPergunta);
    });
  }
  
  // Executa a função quando o DOM estiver carregado
  document.addEventListener('DOMContentLoaded', carregarFormulario);

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
