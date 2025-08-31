// Verificar login ADM
if(localStorage.getItem("admLogado") !== "true"){
  alert("Você precisa estar logado como administrador!");
  window.location.href = "login.html";
}

// Logout
const btnLogout = document.getElementById("btn-logout");
if(btnLogout){
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("admLogado");
    window.location.href = "login.html";
  });
}

// Puxar agendamentos da API e mostrar na tabela
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

// Carregar agendamentos ao abrir o dashboard
carregarAgendamentos();
