// Login ADM
const form = document.getElementById("form-login");
if(form){
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const usuario = e.target.usuario.value;
    const senha = e.target.senha.value;

    if(usuario === "adm" && senha === "senha123"){
      localStorage.setItem("admLogado", "true");
      window.location.href = "dashboard.html";
    } else {
      alert("Usuário ou senha incorretos!");
    }
  });
}

// Verificar login ADM no dashboard
if(window.location.pathname.includes("dashboard.html")){
  if(localStorage.getItem("admLogado") !== "true"){
    alert("Você precisa estar logado como administrador!");
    window.location.href = "login.html";
  }
}

// Logout
const btnLogout = document.getElementById("btn-logout");
if(btnLogout){
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("admLogado");
    window.location.href = "login.html";
  });
}
