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

function salvarFormulario() {
  const tituloInput = document.getElementById('titulo');
  const perguntasContainer = document.getElementById('perguntas-container');

  const titulo = tituloInput.value.trim();
  const perguntas = Array.from(perguntasContainer.querySelectorAll('input[type="text"]'))
                        .map(input => input.value.trim())
                        .filter(texto => texto !== "");

  if (!titulo) {
    alert('Por favor, preencha o título do formulário.');
    return;
  }

  if (perguntas.length === 0) {
    alert('Por favor, adicione pelo menos uma pergunta ao formulário.');
    return;
  }

  axios.post(
    'http://localhost:3000/user/novo-form',
    { titulo },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  ).then(response => {
    const Id = response.data.id;

    let promises = perguntas.map(Pergunta => {
      let Documento = {
        pergunta: Pergunta,
        status: 0
      };
      return axios.post(
        `http://localhost:3000/pergunta/novo-pergunta/${Id}`,
        Documento,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    });

    Promise.all(promises)
      .then(() => {
        // Mostrar modal com link do formulário gerado
        mostrarModalLink(Id);
      })
      .catch(error => {
        console.error("Erro ao cadastrar as perguntas:", error);
        alert("Erro ao cadastrar as perguntas.");
      });

  }).catch(error => {
    console.error("Erro ao enviar o formulário:", error);
    alert("Erro ao criar o formulário. Tente novamente.");
  });
}

// Mostrar modal com link
function mostrarModalLink(idFormulario) {
  const modal = document.getElementById("modalLink");
  const linkInput = document.getElementById("linkFormulario");

  const link = `${window.location.origin}/TelaPrincipal/responder.html?id=${idFormulario}`;
  linkInput.value = link;

  modal.style.display = "flex";
}

// Copiar link
function copiarLink() {
  const linkInput = document.getElementById("linkFormulario");
  linkInput.select();
  document.execCommand("copy");
  alert("Link copiado para a área de transferência!");
}

// Modal de link
document.addEventListener('DOMContentLoaded', () => {
  const fecharModalLink = document.getElementById("fecharModal");
  if (fecharModalLink) {
    fecharModalLink.addEventListener("click", () => {
      document.getElementById("modalLink").style.display = "none";
      window.location.href = "formulario.html";
    });
  }
});

function confirmarCancelamento() {
  const titulo = document.getElementById('titulo').value.trim();
  const perguntasInputs = document.querySelectorAll('#perguntas-container input[type="text"]');

  let perguntasPreenchidas = false;
  perguntasInputs.forEach(input => {
    if (input.value.trim() !== '') {
      perguntasPreenchidas = true;
    }
  });

  if (titulo !== '' || perguntasPreenchidas) {
    abrirModal();
  } else {
    window.location.href = 'formulario.html';
  }
}

function abrirModal() {
  const modal = document.getElementById('modal-cancelar');
  modal.style.display = 'flex';
}

function fecharModal() {
  const modal = document.getElementById('modal-cancelar');
  modal.style.display = 'none';
}

function confirmarSaida() {
  window.location.href = 'formulario.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const btnSalvar = document.querySelector('.btn-salvar');
  const btnCancelar = document.querySelector('.btn-cancelar');
  const btnConfirmarSaida = document.querySelector('.btn-confirmar-saida');
  const btnFecharModal = document.querySelector('.btn-fechar-modal');

  if (btnSalvar) {
    btnSalvar.addEventListener('click', (e) => {
      e.preventDefault();
      salvarFormulario();
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', (e) => {
      e.preventDefault();
      confirmarCancelamento();
    });
  }

  if (btnConfirmarSaida) {
    btnConfirmarSaida.addEventListener('click', confirmarSaida);
  }

  if (btnFecharModal) {
    btnFecharModal.addEventListener('click', fecharModal);
  }
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
