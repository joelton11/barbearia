// Login do barbeiro
document.getElementById("form-login")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const usuario = e.target.usuario.value;
  const senha = e.target.senha.value;

  if(usuario === "Samuel" && senha === "07112002"){
    localStorage.setItem("logado", "true");
    window.location.href = "dashboard.html";
  } else {
    alert("Usuário ou senha incorretos!");
  }
});

// Verificação de login
if(window.location.pathname.includes("dashboard.html")){
  if(localStorage.getItem("logado") !== "true"){
    alert("Você precisa estar logado!");
    window.location.href = "login.html";
  }

  const tbody = document.getElementById("tabela-agendamentos");
  const filtroData = document.getElementById("filtro-data");

  async function carregarAgendamentos(data=""){
    try {
      let url = "/api/agendamentos";
      if(data) url += `?data=${data}`;
      const res = await fetch(url);
      const agendamentos = await res.json();

      tbody.innerHTML = "";
      agendamentos.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${a.nome}</td>
          <td>${a.telefone}</td>
          <td>${a.corte}</td>
          <td>${a.data}</td>
          <td>${a.hora}</td>
          <td>${a.concluido ? "✅" : "❌"}</td>
          <td>
            <button class="concluir" data-id="${a.id}">Concluir</button>
            <button class="editar" data-id="${a.id}">Editar</button>
            <button class="excluir" data-id="${a.id}">Excluir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Botões de ação
      document.querySelectorAll(".concluir").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          await fetch(`/api/agendamento/${id}`, {
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({concluido:1})
          });
          carregarAgendamentos(filtroData.value);
        });
      });

      document.querySelectorAll(".excluir").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          if(confirm("Deseja realmente excluir este agendamento?")){
            await fetch(`/api/agendamento/${id}`, { method:"DELETE" });
            carregarAgendamentos(filtroData.value);
          }
        });
      });

      document.querySelectorAll(".editar").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          const nome = prompt("Novo nome:");
          const telefone = prompt("Novo telefone:");
          const corte = prompt("Novo corte:");
          const data = prompt("Nova data (YYYY-MM-DD):");
          const hora = prompt("Nova hora (HH:MM):");

          await fetch(`/api/agendamento/${id}`, {
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({nome, telefone, corte, data, hora})
          });

          carregarAgendamentos(filtroData.value);
        });
      });

    } catch(err){
      console.error(err);
      alert("Erro ao carregar agendamentos.");
    }
  }

  // Filtros
  document.getElementById("btn-filtrar").addEventListener("click", () => {
    carregarAgendamentos(filtroData.value);
  });
  document.getElementById("btn-limpar").addEventListener("click", () => {
    filtroData.value = "";
    carregarAgendamentos();
  });

  // Logout
  document.getElementById("btn-logout").addEventListener("click", () => {
    localStorage.removeItem("logado");
    window.location.href = "login.html";
  });

  // Carregar agendamentos iniciais
  carregarAgendamentos();
}
