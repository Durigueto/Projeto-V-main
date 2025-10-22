const dados = [
    {
        pergunta: "O que você achou do atendimento?",
        respostas: ["Muito bom", "Poderia ser mais rápido", "Excelente"]
    },
    {
        pergunta: "Recomendaria nossos serviços?",
        respostas: ["Sim", "Com certeza", "Talvez"]
    },
    {
        pergunta: "Sugestões de melhoria?",
        respostas: ["Mais opções no menu", "Atendimento 24h"]
    }
];

// Função para gerar as perguntas e respostas dinamicamente
const container = document.getElementById('respostas-container');

dados.forEach(item => {
    const perguntaDiv = document.createElement('div');
    perguntaDiv.classList.add('pergunta');

    const perguntaTitulo = document.createElement('h2');
    perguntaTitulo.textContent = `Pergunta: ${item.pergunta}`;
    perguntaDiv.appendChild(perguntaTitulo);

    item.respostas.forEach(resposta => {
        const respostaDiv = document.createElement('div');
        respostaDiv.classList.add('resposta');
        respostaDiv.textContent = `Resposta: ${resposta}`;
        perguntaDiv.appendChild(respostaDiv);
    });

    container.appendChild(perguntaDiv);
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
