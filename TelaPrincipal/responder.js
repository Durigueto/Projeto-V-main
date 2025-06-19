function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    return true;
  }
}

/*const token = localStorage.getItem('authToken');
if (!token) {
  alert("Você precisa estar logado para acessar esta página.");
  window.location.href = "../login/index.html";
}

if (isTokenExpired(token)) {
  alert("Sua sessão expirou. Faça login novamente.");
  window.location.href = "../login/index.html";
} */

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const formularioId = urlParams.get("id");
  console.log("ID do formulário recebido:", formularioId);

  if (!formularioId) {
    alert("ID do formulário não fornecido.");
    return;
  }

  const perguntasContainer = document.getElementById("perguntas-container");

 axios.get(`http://localhost:3000/publica/perguntas-form/${formularioId}`)

  .then(response => {
    const perguntas = response.data.Perguntas;

    if (!perguntas || perguntas.length === 0) {
      perguntasContainer.innerHTML = "<p>Nenhuma pergunta encontrada para este formulário.</p>";
      return;
    }

    perguntas.forEach((pergunta, index) => {
      const div = document.createElement("div");
      div.className = "pergunta-bloco";

      const label = document.createElement("label");
      label.textContent = `Pergunta ${index + 1}: ${pergunta.Pergunta}`;
      label.setAttribute("for", `resposta-${pergunta.idPergunta}`);

      const input = document.createElement("textarea");
      input.rows = 3;
      input.name = `resposta-${pergunta.idPergunta}`;
      input.id = `resposta-${pergunta.idPergunta}`;
      input.dataset.perguntaId = pergunta.idPergunta;
      input.required = true;

      div.appendChild(label);
      div.appendChild(input);
      perguntasContainer.appendChild(div);
    });
  })
  .catch(error => {
    console.error("Erro ao carregar perguntas:", error.response?.data || error.message);
    perguntasContainer.innerHTML = "<p>Erro ao carregar perguntas.</p>";
  });

  const form = document.getElementById("formulario");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const inputs = form.querySelectorAll("textarea");
    const respostas = [];

    inputs.forEach(input => {
      const idPergunta = input.dataset.perguntaId;
      const FeedBack = input.value.trim();
      if (FeedBack !== "") {
        respostas.push({ idPergunta, FeedBack });
      }
    });

    if (respostas.length === 0) {
      alert("Por favor, preencha todas as respostas.");
      return;
    }

    const promises = respostas.map(resp =>
      axios.post(
        `http://localhost:3000/publica/novo_feedBack/${resp.idPergunta}`,
        { resposta: resp.FeedBack }
      )
    );

    Promise.all(promises)
      .then(() => {
        abrirModal();
      })
      .catch(err => {
        console.error("Erro ao enviar respostas:", err.response?.data || err.message);
        alert("Erro ao enviar as respostas. Verifique o console para detalhes.");
      });
  });
});

function abrirModal() {
  const modal = document.getElementById("modal-agradecimento");
  modal.style.display = "flex";
}

function fecharModal() {
  const modal = document.getElementById("modal-agradecimento");
  modal.style.display = "none";
}
