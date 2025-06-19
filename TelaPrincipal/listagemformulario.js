function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    return true;
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

const urlParams = new URLSearchParams(window.location.search);
const formularioId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", function () {
  if (!formularioId) {
    alert("ID do formulário não fornecido.");
    return;
  }

  renderizarPerguntasComRespostas();

  // Botão Avaliar
  const btnAvaliar = document.getElementById("btnAvaliar");
  if (btnAvaliar) {
    btnAvaliar.addEventListener("click", async function () {
      try {
        const response = await axios.get(`http://localhost:3000/publica/perguntas-form/${formularioId}`);
        const perguntas = response.data.Perguntas;

        for (const pergunta of perguntas) {
          await axios.put(`http://localhost:3000/pergunta/alterar-pergunta/${pergunta.idPergunta}`, {
            Status: "Avaliado"
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const respostas = await buscarRespostas(pergunta.idPergunta);

          for (const resp of respostas) {
            const sentimento = await axios.post(`http://localhost:3000/feedback/sentimento`, {
              texto: resp.Resposta
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            const Avaliacao = sentimento.data.sentimento;

            await axios.put(`http://localhost:3000/feedback/atualizar/${resp.idResposta}`, {
              Avaliacao,
              Status: "Avaliado"
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        }

        alert("Análise concluída!");
        await renderizarPerguntasComRespostas();

      } catch (error) {
        console.error("Erro durante análise:", error);
        alert("Erro ao realizar a análise. Verifique o console.");
      }
    });
  }

  // Botão Excluir
  const btnExcluir = document.getElementById("btnExcluir");
  if (btnExcluir) {
    btnExcluir.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja excluir este formulário?")) {
        axios.delete(`http://localhost:3000/formulario/deletar/${formularioId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(() => {
          alert("Formulário excluído com sucesso.");
          window.location.href = "../TelaPrincipal/index.html";
        }).catch(error => {
          console.error("Erro ao excluir formulário:", error);
          alert("Erro ao excluir formulário.");
        });
      }
    });
  }

  // Botão Copiar Link
  const btnCopiarLink = document.getElementById("btnCopiarLink");
  if (btnCopiarLink) {
    btnCopiarLink.addEventListener("click", function () {
      const link = `http://localhost:5500/TelaPrincipal/responder.html?id=${formularioId}`;
      navigator.clipboard.writeText(link)
        .then(() => alert("Link copiado para a área de transferência!"))
        .catch(err => {
          console.error("Erro ao copiar link:", err);
          alert("Não foi possível copiar o link.");
        });
    });
  }
});

function buscarRespostas(perguntaId) {
  return axios.get(`http://localhost:3000/feedback/visualizar/${perguntaId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(res => res.data.data || []);
}

async function renderizarPerguntasComRespostas() {
  const perguntasContainer = document.getElementById("perguntasContainer");
  perguntasContainer.innerHTML = "";

  try {
    const response = await axios.get(`http://localhost:3000/publica/perguntas-form/${formularioId}`);
    const perguntas = response.data.Perguntas;

    for (let index = 0; index < perguntas.length; index++) {
      const pergunta = perguntas[index];

      const card = document.createElement("div");
      card.classList.add("bloco-pergunta");

      const titulo = document.createElement("h3");
      titulo.textContent = `Pergunta ${index + 1}: ${pergunta.Pergunta}`;
      card.appendChild(titulo);

      const respostasDiv = document.createElement("div");
      respostasDiv.id = `respostas-${pergunta.idPergunta}`;
      respostasDiv.classList.add("respostas");

      const respostas = await buscarRespostas(pergunta.idPergunta);

      if (respostas.length > 0) {
        const respostasFormatadas = respostas.map((r, i) => {
          let icone = "";
          if (r.Avaliacao) {
            switch (r.Avaliacao) {
              case "Muito positiva":  
                icone = "🟢";
                break;
              case "Positiva":
                icone = "🟢";
                break;
              case "Neutra":
                icone = "🟡";
                break;
              case "Negativa":
                icone = "🔴";
                break;
              case "Muito negativa":
                icone = "🔴";
                break;
            }
          }
          return `<p class='resposta'><strong>Resposta ${i + 1}:</strong> ${r.Resposta} ${icone}</p>`;
        }).join("");
        respostasDiv.innerHTML = respostasFormatadas;
      } else {
        respostasDiv.innerHTML = "<p class='sem-resposta'><i>Ainda sem respostas.</i></p>";
      }

      card.appendChild(respostasDiv);
      perguntasContainer.appendChild(card);
    }

  } catch (error) {
    console.error("Erro ao carregar perguntas:", error);
    perguntasContainer.innerHTML = "<p style='padding: 1rem;'>Erro ao carregar perguntas do formulário.</p>";
  }
}

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
