document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const formularioId = urlParams.get("id");
  console.log("ID do formulário recebido:", formularioId);

  if (!formularioId) {
    alert("ID do formulário não fornecido.");
    return;
  }

  const perguntasContainer = document.getElementById("formulario");

  // Carrega perguntas do formulário
  axios.get(`http://localhost:3000/pergunta/perguntas-form/${formularioId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  })
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

  // Envio de respostas
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

    // Envia cada resposta individualmente
    const promises = respostas.map(resp =>
      axios.post("http://localhost:3000/Quest/novo-resposta", resp, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      })
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

// Modal functions
function abrirModal() {
  const modal = document.getElementById("modal-agradecimento");
  modal.style.display = "flex";
}

function fecharModal() {
  const modal = document.getElementById("modal-agradecimento");
  modal.style.display = "none";
}
