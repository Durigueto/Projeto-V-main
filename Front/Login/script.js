localStorage.removeItem('authToken');

const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

if (!localStorage.getItem('reloaded')) {
    localStorage.setItem('reloaded', 'true');
    window.location.reload();
} else {
    localStorage.removeItem('reloaded');
}

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

/*Parte para recuperação de senha */

document.getElementById("recover-form").addEventListener("submit", function (e) {
    e.preventDefault();
    document.getElementById("message").style.display = "block";
});

/*Parte para redefinição de senha*/ 

document.getElementById("reset-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const senha = document.getElementById("senha").value;
    const confirmar = document.getElementById("confirmar").value;
    const msg = document.getElementById("message");
    const error = document.getElementById("error");

    if (senha.length < 6) {
        error.textContent = "A senha deve ter pelo menos 6 caracteres.";
        msg.style.display = "none";
        return;
    }

    if (senha !== confirmar) {
        error.textContent = "As senhas não coincidem.";
        msg.style.display = "none";
        return;
    }

    error.textContent = "";
    msg.style.display = "block";

    // Espaço para conectar com o back
});

function cadastrar() {
    event.preventDefault();
    let email = document.getElementById("Email").value;
    let nome = document.getElementById("nome").value;
    let senha = document.getElementById("Senha").value
    let confirSenha = document.getElementById("Conf_Senha").value;

    if (senha !== confirSenha) {
        alert("As senhas não coincidem")
        return;
    }

    if (!email || !senha || !nome) {
        alert("Preencha todos os campos")
    } else {
        axios.post("http://localhost:3000/publica/novo-user", {
            nome,
            senha,
            email
        }).then(res => {
            alert("Usuário cadastrado com sucesso")
            console.log(res)
            loginBtn.click();

        }).catch(err => {
            alert("Deu algum erro")
            console.log(err)
        })
    }

}

function login() {
    event.preventDefault();
    let email = document.getElementById("email").value;
    let senha = document.getElementById("senha").value;

    if (!email & !senha) {
        alert("Preencha todos os campos")
    } else {
        axios.post("http://localhost:3000/publica/login", {
            email,
            senha
        }).then(res => {
            const token = res.data.token;
            localStorage.setItem('authToken', token);


            console.log("Token:", token);

            window.location.href = `http://127.0.0.1:5500/Front/TelaPrincipal/main.html`;

        }).catch(err => {
            alert("Login inválido")
        })
    }
}
