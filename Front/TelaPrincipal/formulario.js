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

window.addEventListener("DOMContentLoaded", function () {

  const btnVoltar = document.getElementById("btnVoltar");
  const menuToggle = document.getElementById("userMenuToggle");
  const userMenu = document.getElementById("userMenu");
  const logoutBtn = document.getElementById("logoutBtn");
  const userEmailSpan = document.getElementById("userEmail");
  const formsList = document.getElementById("forms");


  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      window.location.href = 'main.html';
    });
  }
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userEmailSpan.textContent = payload.email || "Usuário";
    } catch (e) {
      userEmailSpan.textContent = "Usuário";
    }
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


  axios.get("http://localhost:3000/user/home", {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(response => {
    const documentos = response.data.Formularios;
    formsList.innerHTML = ""; 

    documentos.forEach(doc => {
      const div = document.createElement('div');
      div.classList.add('formcriado');

      div.innerHTML = `
        <div>
          <strong>TÍTULO: ${doc.Titulo}</strong><br>
          STATUS: ${doc.Status}
        </div>
        <div class="codigo">ID: ${doc.IdForm}</div>
      `;

      div.style.cursor = 'pointer';
      div.addEventListener('click', () => {
        window.location.href = `listagemformulario.html?id=${doc.IdForm}`;
      });

      formsList.appendChild(div);
    });
  })
  .catch(error => {
    console.error('Erro ao carregar formulários do backend:', error);
    formsList.innerHTML = "<p>Ocorreu um erro ao carregar os formulários.</p>";
  });
});