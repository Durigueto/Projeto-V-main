const token = localStorage.getItem('authToken');
if (!token) {
  alert("Você precisa estar logado para acessar esta página.");
  window.location.href = "../login/index.html"; // ajuste o caminho conforme necessário
}

const dadosIndicadores = {
  respondidos: 150,
  positivas: 90,
  neutras: 40,
  negativas: 20
};

document.getElementById('indicadorRespondidos').textContent = dadosIndicadores.respondidos;
document.getElementById('indicadorPositivas').textContent = dadosIndicadores.positivas;
document.getElementById('indicadorNeutras').textContent = dadosIndicadores.neutras;
document.getElementById('indicadorNegativas').textContent = dadosIndicadores.negativas;

const ctxBar = document.getElementById('graficoColunas').getContext('2d');  // id correto do gráfico de barras
new Chart(ctxBar, {
  type: 'bar',
  data: {
    labels: ['Positivas', 'Neutras', 'Negativas'],
    datasets: [{
      label: 'Respostas',
      data: [dadosIndicadores.positivas, dadosIndicadores.neutras, dadosIndicadores.negativas],
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
        ticks: {
          color: '#6A1B9A'
        }
      },
      x: {
        ticks: {
          color: '#6A1B9A'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }
});

const ctxPie = document.getElementById('graficoPizza').getContext('2d');
new Chart(ctxPie, {
  type: 'pie',
  data: {
    labels: ['Positivas', 'Neutras', 'Negativas'],
    datasets: [{
      label: 'Respostas',
      data: [dadosIndicadores.positivas, dadosIndicadores.neutras, dadosIndicadores.negativas],
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
        labels: {
          color: '#6A1B9A'
        }
      }
    }
  }
});
