const dados = [
    {
        pergunta: "O que você achou do atendimento?",
        respostas: ["Muito bom", "Poderia ser mais rápido", "Excelente"]
    },
    {
        pergunta: "Recomendaria nossos serviços?",
        respostas: ["Sim", "Com certeza", "Talvez"]
    },
    {
        pergunta: "Sugestões de melhoria?",
        respostas: ["Mais opções no menu", "Atendimento 24h"]
    }
];

// Função para gerar as perguntas e respostas dinamicamente
const container = document.getElementById('respostas-container');

dados.forEach(item => {
    const perguntaDiv = document.createElement('div');
    perguntaDiv.classList.add('pergunta');

    const perguntaTitulo = document.createElement('h2');
    perguntaTitulo.textContent = `Pergunta: ${item.pergunta}`;
    perguntaDiv.appendChild(perguntaTitulo);

    item.respostas.forEach(resposta => {
        const respostaDiv = document.createElement('div');
        respostaDiv.classList.add('resposta');
        respostaDiv.textContent = `Resposta: ${resposta}`;
        perguntaDiv.appendChild(respostaDiv);
    });

    container.appendChild(perguntaDiv);
});
