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

async function carregarIndicadores() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "../login/index.html";
    return;
  }

  function getCount(url) {
    return axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(response => response.data.Respostas.length)
      .catch(error => {
        if (error.response && error.response.status === 404) return 0;
        throw error;
      });
  }

  // Busca todos os tipos de avaliações
  // const [
  //   muitoPositivo, positivo, neutro, negativo, muitoNegativo
  // ] = await Promise.all([
  //   getCount('http://localhost:3000/feedback/visualizar_Avaliacao/Muito positivo'),
  //   getCount('http://localhost:3000/feedback/visualizar_Avaliacao/Positivo'),
  //   getCount('http://localhost:3000/feedback/visualizar_Avaliacao/Neutro'),
  //   getCount('http://localhost:3000/feedback/visualizar_Avaliacao/Negativo'),
  //   getCount('http://localhost:3000/feedback/visualizar_Avaliacao/Muito negativo')
  // ]);

  // Soma positivas e negativas nas neutras, conforme solicitado
  const positivas = muitoPositivo ;
  const negativas = muitoNegativo ;
  const neutras = neutro + positivo + negativo;
  const respondidos = positivas + neutras + negativas;

  document.getElementById('indicadorRespondidos').textContent = respondidos;
  document.getElementById('indicadorPositivas').textContent = positivas;
  document.getElementById('indicadorNeutras').textContent = neutras;
  document.getElementById('indicadorNegativas').textContent = negativas;

  // Gráfico de barras
  const ctxBar = document.getElementById('graficoColunas').getContext('2d');
  new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['Positivas', 'Neutras', 'Negativas'],
      datasets: [{
        label: 'Respostas',
        data: [positivas, neutras, negativas],
        backgroundColor: [
          '#6A1B9A',
          '#8E24AA',
          '#BA68C8'
        ],
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#6A1B9A' }
        },
        x: {
          ticks: { color: '#6A1B9A' }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  // Gráfico de pizza
  const ctxPie = document.getElementById('graficoPizza').getContext('2d');
  new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: ['Positivas', 'Neutras', 'Negativas'],
      datasets: [{
        label: 'Respostas',
        data: [positivas, neutras, negativas],
        backgroundColor: [
          '#6A1B9A',
          '#8E24AA',
          '#BA68C8'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#6A1B9A' }
        }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("userMenuToggle");
  const userMenu = document.getElementById("userMenu");
  const logoutBtn = document.getElementById("logoutBtn");
  const userEmailSpan = document.getElementById("userEmail");

  // Exibe o e-mail do usuário
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

  // Fechar menu ao clicar fora
  document.addEventListener("click", function (e) {
    if (!document.querySelector(".user-menu-wrapper").contains(e.target)) {
      userMenu.classList.add("hidden");
    }
  });

  // Logout
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("authToken");
    window.location.href = "../Login/index.html";
  });

  carregarIndicadores();
});