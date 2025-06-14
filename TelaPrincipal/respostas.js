// Função para buscar e mostrar perguntas e respostas do formulário
function carregarFormulario() {
    const params = new URLSearchParams(window.location.search);
    const idFormulario = params.get('id');
  
    if (!idFormulario) {
      console.error("ID do formulário não encontrado na URL");
      return;
    }
  
    // Fazer requisição para API (ajuste a URL conforme seu backend)
    fetch(`/api/formularios/${idFormulario}/perguntas`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        mostrarPerguntasERepostas(data);
      })
      .catch(error => {
        console.error('Erro ao carregar dados:', error);
      });
  }
  
  // Função para renderizar perguntas e respostas no HTML
  function mostrarPerguntasERepostas(dados) {
    const container = document.getElementById('container-perguntas');
    container.innerHTML = ''; // limpa conteúdo anterior
  
    dados.forEach(pergunta => {
      const divPergunta = document.createElement('div');
      divPergunta.classList.add('pergunta');
  
      // Título da pergunta
      const titulo = document.createElement('h3');
      titulo.textContent = pergunta.texto; // ou o campo correto do seu objeto pergunta
      divPergunta.appendChild(titulo);
  
      // Lista das respostas
      const listaRespostas = document.createElement('ul');
      pergunta.respostas.forEach(resposta => {
        const item = document.createElement('li');
        item.textContent = resposta.texto; // ajuste conforme sua estrutura
        listaRespostas.appendChild(item);
      });
      divPergunta.appendChild(listaRespostas);
  
      container.appendChild(divPergunta);
    });
  }
  
  // Executa a função quando o DOM estiver carregado
  document.addEventListener('DOMContentLoaded', carregarFormulario);
  