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

        await axios.put(`http://localhost:3000/user/alterar-status/${formularioId}`, {
          Status: "Avaliado" 
          }, {
            headers: { Authorization: `Bearer ${token}` }
        });

      } catch (error) {
        console.error("Erro durante análise:", error);
        alert("Erro ao realizar a análise. Verifique o console.");
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

    // Colete todas as respostas de todas as perguntas
    let todasRespostas = [];

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

      // Adicione as respostas dessa pergunta ao array geral
      todasRespostas = todasRespostas.concat(respostas);

      if (respostas.length > 0) {
        const respostasFormatadas = respostas.map((r, i) => {
          let icone = "";
          if (r.Avaliacao) {
            const avaliacao = r.Avaliacao.trim().toLowerCase();
            if (avaliacao.includes("positivo")) {
              icone = "🟢";
            } else if (avaliacao.includes("neutro")) {
              icone = "🟡";
            } else if (avaliacao.includes("negativo")) {
              icone = "🔴";
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

    // Agora, fora do loop, calcule e exiba o status predominante do formulário
    const statusForm = statusPredominante(todasRespostas);
    const statusDiv = document.getElementById("statusForm");
    if (statusDiv) {
      statusDiv.innerHTML = `<strong>Status predominante do formulário:</strong> ${statusForm}`;
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

function statusPredominante(respostas) {
  const contagem = { positivo: 0, neutro: 0, negativo: 0 };

  respostas.forEach(r => {
    if (!r.Avaliacao) return;
    const avaliacao = r.Avaliacao.trim().toLowerCase();
    if (avaliacao.includes("positivo")) {
      contagem.positivo++;
    } else if (avaliacao.includes("neutro")) {
      contagem.neutro++;
    } else if (avaliacao.includes("negativo")) {
      contagem.negativo++;
    }
  });

  // Descobre o maior
  const maior = Math.max(contagem.positivo, contagem.neutro, contagem.negativo);
  if (maior === 0) return "Sem avaliações";
  if (maior === contagem.positivo) return "Positivo";
  if (maior === contagem.neutro) return "Neutro";
  return "Negativo";
}

//botao de deletar
document.addEventListener("DOMContentLoaded", function () {
  const btnDeletar = document.getElementById("btnExcluir");
  if (btnDeletar) {
    btnDeletar.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja excluir este formulário?")) {
        axios.delete(`http://localhost:3000/user/formulario/${formularioId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(() => {
          alert("Formulário excluído com sucesso.");
          window.location.href = "/TelaPrincipal/formulario.html";
        }).catch(error => {
          console.error("Erro ao excluir formulário:", error);
          alert("Erro ao excluir formulário.");
        });
      }
    });
  }
});