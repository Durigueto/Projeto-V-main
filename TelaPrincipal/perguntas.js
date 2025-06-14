document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('perguntas-container');
  
    const atualizarBotoes = () => {
      const perguntas = container.querySelectorAll('.pergunta');
      perguntas.forEach((pergunta, index) => {
        const addBtn = pergunta.querySelector('.add-btn');
        const deleteBtn = pergunta.querySelector('.delete-btn');
        addBtn.style.display = (index === perguntas.length - 1) ? 'flex' : 'none';
  
        if (index < perguntas.length - 1) {
          if (!deleteBtn) {
            const newDeleteBtn = document.createElement('button');
            newDeleteBtn.classList.add('delete-btn');
            newDeleteBtn.innerHTML = '<span class="material-icons">delete</span>';
            pergunta.appendChild(newDeleteBtn);
          }
          // deleteBtn.style.display = 'flex';
        } else if (deleteBtn) {
          deleteBtn.style.display = 'none';
        }
      });
    };
  
    container.addEventListener('click', (e) => {
      const botaoAdd = e.target.closest('.add-btn');
      const botaoDelete = e.target.closest('.delete-btn');
  
      if (botaoAdd) {
        const perguntaAtual = botaoAdd.parentElement;
        const input = perguntaAtual.querySelector('input');
  
        if (!input || input.value.trim() === '') {
          alert('Por favor, preencha a pergunta antes de adicionar outra.');
          return;
        }
  
        const novaPergunta = document.createElement('div');
        novaPergunta.classList.add('pergunta');
        novaPergunta.innerHTML = `
          <input type="text" placeholder="Crie uma pergunta" />
          <button class="add-btn">
            <span class="material-icons">add</span>
          </button>
        `;
        container.appendChild(novaPergunta);
        atualizarBotoes();
      }
  
      if (botaoDelete) {
        const perguntaParaRemover = botaoDelete.parentElement;
        container.removeChild(perguntaParaRemover);
        atualizarBotoes();
      }
    });
  
    atualizarBotoes();
  });
  