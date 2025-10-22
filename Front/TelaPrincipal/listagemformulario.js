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
if (!token || isTokenExpired(token)) {
  alert("Sua sessão expirou ou é inválida. Faça login novamente.");
  window.location.href = "../login/index.html";
}

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const formularioId = urlParams.get("id");

  if (!formularioId) {
    alert("ID do formulário não fornecido.");
    window.location.href = "main.html";
    return;
  }

  const btnAvaliar = document.getElementById("btnAvaliar");
  const btnCopiarLink = document.getElementById("btnCopiarLink");
  const btnExcluir = document.getElementById("btnExcluir");
  const btnVoltar = document.getElementById("btnVoltar");
  const menuToggle = document.getElementById("userMenuToggle");
  const userMenu = document.getElementById("userMenu");
  const logoutBtn = document.getElementById("logoutBtn");
  const userEmailSpan = document.getElementById("userEmail");
  const loaderOverlay = document.getElementById("loader-overlay");

  function habilitarBotoes(habilitar) {
    if (btnAvaliar) btnAvaliar.disabled = !habilitar;
    if (btnCopiarLink) btnCopiarLink.disabled = !habilitar;
    if (btnExcluir) btnExcluir.disabled = !habilitar;
  }

  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      window.location.href = 'formulario.html';
    });
  }

  if (btnAvaliar) {
    btnAvaliar.addEventListener("click", async function () {
      habilitarBotoes(false);
      loaderOverlay.classList.remove("hidden");

      try {
        const response = await axios.get(`http://localhost:3000/publica/perguntas-form/${formularioId}`);
        const perguntas = response.data.Perguntas;

        for (const pergunta of perguntas) {
          await axios.put(
            `http://localhost:3000/pergunta/alterar-pergunta/${pergunta.idPergunta}`,
            { Status: "Avaliado" },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const respostas = await buscarRespostas(pergunta.idPergunta);

          if (respostas.length === 0) {
            console.log("Nenhuma resposta encontrada para a pergunta " + pergunta.idPergunta);
            continue;
          }

          for (const resp of respostas) {

            const resultado = await analisarSentimento(resp.Resposta);

            if (resultado) {
              const Avaliacao = resultado.sentimento;
              await axios.put(
                `http://localhost:3000/feedback/atualizar/${resp.idResposta}`,
                { Avaliacao, Status: "Avaliado" },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            }
          }
        }

        await axios.put(
          `http://localhost:3000/user/alterar-status/${formularioId}`,
          { Status: "Avaliado" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("Análise concluída!");
        await renderizarPerguntasComRespostas();

      } catch (error) {
        console.error("Erro durante análise:", error);
        alert("Erro ao realizar a análise. Verifique o console para mais detalhes.");
      } finally {
        loaderOverlay.classList.add("hidden");
        habilitarBotoes(true);
      }
    });
  }

  //antigo
  // if (btnAvaliar) {
  //   btnAvaliar.addEventListener("click", async function () {
  //     habilitarBotoes(false);
  //     loaderOverlay.classList.remove("hidden");

  //     try {
  //       const response = await axios.get(`http://localhost:3000/publica/perguntas-form/${formularioId}`);
  //       const perguntas = response.data.Perguntas;

  //       for (const pergunta of perguntas) {
  //         await axios.put(`http://localhost:3000/pergunta/alterar-pergunta/${pergunta.idPergunta}`, { Status: "Avaliado" }, { headers: { Authorization: `Bearer ${token}` } });

  //         const respostas = await buscarRespostas(pergunta.idPergunta);

  //         if (respostas.length === 0) {
  //           console.log("Nenhuma resposta encontrada para a pergunta " + pergunta.idPergunta);
  //           continue;
  //         }

  //         for (const resp of respostas) {
  //          const sentimento = await axios.post(`http://localhost:3000/feedback/sentimento`, { texto: resp.Resposta }, { headers: { Authorization: `Bearer ${token}` } });
  //          const Avaliacao = sentimento.data.sentimento;
  //           await axios.put(`http://localhost:3000/feedback/atualizar/${resp.idResposta}`, { Avaliacao, Status: "Avaliado" }, { headers: { Authorization: `Bearer ${token}` } });
  //         }
  //       }

  //       await axios.put(`http://localhost:3000/user/alterar-status/${formularioId}`, { Status: "Avaliado" }, { headers: { Authorization: `Bearer ${token}` } });

  //       alert("Análise concluída!");
  //       await renderizarPerguntasComRespostas();

  //     } catch (error) {
  //       console.error("Erro durante análise:", error);
  //       alert("Erro ao realizar a análise. Verifique o console para mais detalhes.");
  //     } finally {
  //       loaderOverlay.classList.add("hidden");
  //       habilitarBotoes(true);
  //     }
  //   });
  // }

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

  if (btnExcluir) {
    btnExcluir.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja excluir este formulário? Esta ação não pode ser desfeita.")) {
        axios.delete(`http://localhost:3000/user/formulario/${formularioId}`, { headers: { Authorization: `Bearer ${token}` } })
          .then(() => {
            alert("Formulário excluído com sucesso.");
            window.location.href = "/TelaPrincipal/formulario.html";
          })
          .catch(error => {
            console.error("Erro ao excluir formulário:", error);
            alert("Erro ao excluir formulário.");
          });
      }
    });
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    userEmailSpan.textContent = payload.email || "Usuário";
  } catch (e) {
    userEmailSpan.textContent = "Usuário";
  }

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", function (e) {
    if (!userMenu.classList.contains("hidden") && !userMenu.parentElement.contains(e.target)) {
      userMenu.classList.add("hidden");
    }
  });

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("authToken");
    window.location.href = "../Login/index.html";
  });

  renderizarPerguntasComRespostas();
});

function buscarRespostas(perguntaId) {
  return axios.get(`http://localhost:3000/feedback/visualizar/${perguntaId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data.data || []);
}

async function renderizarPerguntasComRespostas() {
  const perguntasContainer = document.getElementById("perguntasContainer");
  const formularioId = new URLSearchParams(window.location.search).get("id");
  perguntasContainer.innerHTML = "";

  try {
    const response = await axios.get(`http://localhost:3000/publica/perguntas-form/${formularioId}`);
    const perguntas = response.data.Perguntas;
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
      todasRespostas = todasRespostas.concat(respostas);

      if (respostas.length > 0) {
        const respostasFormatadas = respostas.map((r, i) => {
          let icone = "";
          // ...existing code...
          if (r.Avaliacao) {
            console.log(respostas, r.Avaliacao);
            const avaliacao = r.Avaliacao.trim().toLowerCase();
            if (avaliacao.includes("muito positivo")) icone = "🟢";
            else if (avaliacao.includes("muito negativo")) icone = "🔴";
            else icone = "🟡";
          }
          //
          return `<p class='resposta'><strong>Resposta ${i + 1}:</strong> ${r.Resposta} ${icone}</p>`;
        }).join("");
        respostasDiv.innerHTML = respostasFormatadas;
      } else {
        respostasDiv.innerHTML = "<p class='sem-resposta'><i>Ainda sem respostas.</i></p>";
      }
      card.appendChild(respostasDiv);
      perguntasContainer.appendChild(card);
    }

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

function statusPredominante(respostas) {
  const contagem = { positivo: 0, neutro: 0, negativo: 0 };
  respostas.forEach(r => {
    if (!r.Avaliacao) return;
    const avaliacao = r.Avaliacao.trim().toLowerCase();
    if (avaliacao.includes("muito positivo")) contagem.positivo++;
    else if (avaliacao.includes("muito negativo")) contagem.negativo++;
    else contagem.neutro++;

  });

  const total = contagem.positivo + contagem.neutro + contagem.negativo;
  if (total === 0) return "Aguardando avaliação";

  const maior = Math.max(contagem.positivo, contagem.neutro, contagem.negativo);
  if (maior === contagem.positivo) return "Positivo";
  if (maior === contagem.neutro) return "Neutro";
  return "Negativo";
}

async function analisarSentimento(texto) {
  try {
    const response = await axios.post(
      "http://localhost:3000/feedback/analisar",
      { texto },
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
    );
    console.log(response.data)
    return response.data; // { sentimento, explicacao }
  } catch (error) {
    console.error("Erro ao analisar sentimento:", error.response?.data || error.message);
    return null;
  }
}