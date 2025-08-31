// Verificar se estamos no dashboard
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

// Login (apenas se estivermos no login.html)
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

// Puxar agendamentos (somente no dashboard)
if(window.location.pathname.includes("dashboard.html")){
  async function carregarAgendamentos(){
    try {
      const res = await fetch("/api/agendamentos");
      const agendamentos = await res.json();
      const tbody = document.querySelector("#tabela-agendamentos tbody");
      tbody.innerHTML = "";
      agendamentos.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${a.id}</td>
          <td>${a.nome}</td>
          <td>${a.telefone}</td>
          <td>${a.corte}</td>
          <td>${a.data}</td>
          <td>${a.hora}</td>
          <td>${a.concluido ? "Sim" : "Não"}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch(err){
      console.error("Erro ao carregar agendamentos:", err);
    }
  }
  carregarAgendamentos();
}
