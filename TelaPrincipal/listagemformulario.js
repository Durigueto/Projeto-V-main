document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const formularioId = urlParams.get("id");
  const token = localStorage.getItem("authToken");

  if (!formularioId) {
    alert("ID do formulário não fornecido.");
    return;
  }

  if (!token) {
    alert("Token não encontrado. Faça login novamente.");
    return;
  }

  const perguntasContainer = document.getElementById("perguntasContainer");
  perguntasContainer.innerHTML = "";

  axios.get(`http://localhost:3000/pergunta/perguntas-form/${formularioId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(response => {
    const perguntas = response.data.Perguntas;

    if (!perguntas || perguntas.length === 0) {
      perguntasContainer.innerHTML = "<p style='padding: 1rem;'>Nenhuma pergunta encontrada para este formulário.</p>";
      return;
    }

    perguntas.forEach((pergunta, index) => {
      const card = document.createElement("div");
      card.classList.add("bloco-pergunta");

      const titulo = document.createElement("h3");
      titulo.textContent = `Pergunta ${index + 1}: ${pergunta.Pergunta}`;
      card.appendChild(titulo);

      const respostasDiv = document.createElement("div");
      respostasDiv.id = `respostas-${pergunta.idPergunta}`;
      respostasDiv.classList.add("respostas"); // Adiciona classe para aplicar estilo
      respostasDiv.innerHTML = "<p class='carregando'>Carregando respostas...</p>";

      card.appendChild(respostasDiv);
      perguntasContainer.appendChild(card);

      // Buscar respostas
      axios.get(`http://localhost:3000/resposta/${pergunta.idPergunta}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(respostaResp => {
        const respostas = respostaResp.data.Respostas;
        if (!respostas || respostas.length === 0) {
          respostasDiv.innerHTML = "<p class='sem-resposta'>Ainda sem respostas.</p>";
        } else {
          respostasDiv.innerHTML = respostas
            .map((r, i) => `<p class='resposta'><strong>Resposta ${i + 1}:</strong> ${r.FeedBack}</p>`)
            .join("");
        }
      }).catch(() => {
        respostasDiv.innerHTML = "<p class='sem-resposta'>Ainda sem respostas.</p>";
      });
    });
  }).catch(error => {
    console.error("Erro ao carregar perguntas:", error);
    perguntasContainer.innerHTML = "<p style='padding: 1rem;'>Erro ao carregar perguntas do formulário.</p>";
  });
});
