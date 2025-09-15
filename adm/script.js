// ============================
// Verificar login ADM
// ============================
if (window.location.pathname.includes("dashboard.html")) {
  const admLogado = localStorage.getItem("admLogado");
  if (admLogado !== "true") {
    alert("Você precisa estar logado como administrador!");
    window.location.href = "login.html";
  }
}

// ============================
// Logout
// ============================
const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("admLogado");
    window.location.href = "login.html";
  });
}

// ============================
// Login
// ============================
const form = document.getElementById("form-login");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const usuario = e.target.usuario.value.trim();
    const senha = e.target.senha.value.trim();

    // Simples validação de login estático (pode ser substituído por backend)
    if (usuario === "adm" && senha === "senha123") {
      localStorage.setItem("admLogado", "true");
      window.location.href = "dashboard.html";
    } else {
      alert("Usuário ou senha incorretos!");
    }
  });
}

// ============================
// Carregar agendamentos
// ============================
async function carregarAgendamentos() {
  try {
    const res = await fetch("/api/agendamentos");
    if (!res.ok) throw new Error("Erro na resposta da API");

    const agendamentos = await res.json();
    const tbodyPendentes = document.querySelector("#tabela-pendentes tbody");
    const tbodyConcluidos = document.querySelector("#tabela-concluidos tbody");
    const concluidosList = document.getElementById("concluidos-list");

    if (tbodyPendentes) tbodyPendentes.innerHTML = "";
    if (tbodyConcluidos) tbodyConcluidos.innerHTML = "";

    let total = 0, concluidos = 0, pendentes = 0;
    const idsConcluidos = [];

    agendamentos.forEach(a => {
      total++;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${a.id}</td>
        <td>${a.nome}</td>
        <td>${a.telefone}</td>
        <td>${a.corte}</td>
        <td>${a.data}</td>
        <td>${a.hora}</td>
        <td>
          <button class="btn-acao btn-concluir">${a.concluido ? "Reabrir" : "Concluir"}</button>
          <button class="btn-acao btn-editar">Editar</button>
          <button class="btn-acao btn-excluir">Excluir</button>
        </td>
      `;

      if (a.concluido) {
        concluidos++;
        idsConcluidos.push(a.id);
        if (tbodyConcluidos) tbodyConcluidos.appendChild(tr);
      } else {
        pendentes++;
        if (tbodyPendentes) tbodyPendentes.appendChild(tr);
      }

      // ============================
      // Botões de ação por agendamento
      // ============================
      tr.querySelector(".btn-concluir").addEventListener("click", () => {
        const confirmar = a.concluido
          ? confirm("Deseja reabrir este agendamento?")
          : confirm("Deseja marcar este agendamento como concluído?");
        if (confirmar) atualizarConcluido(a.id, !a.concluido);
      });

      tr.querySelector(".btn-editar").addEventListener("click", () => editarAgendamento(a));
      tr.querySelector(".btn-excluir").addEventListener("click", () => excluirAgendamento(a.id));
    });

    // Atualizar contadores
    const elTotal = document.getElementById("total-agendamentos");
    const elConcl = document.getElementById("agendamentos-concluidos");
    const elPend = document.getElementById("agendamentos-pendentes");

    if (elTotal) elTotal.textContent = total;
    if (elConcl) elConcl.textContent = concluidos;
    if (elPend) elPend.textContent = pendentes;

    // Chips de concluídos
    if (concluidosList) {
      concluidosList.innerHTML = idsConcluidos.length
        ? idsConcluidos.map(id => `<span class="chip" data-id="${id}">${id}</span>`).join("")
        : `<span class="placeholder">Nenhum</span>`;

      // Evita múltiplos binds no mesmo listener
      if (!concluidosList.dataset.bound) {
        concluidosList.addEventListener("click", (e) => {
          const chip = e.target.closest(".chip");
          if (!chip) return;
          const id = Number(chip.dataset.id);
          if (Number.isFinite(id) && confirm(`Reabrir agendamento #${id}?`)) {
            atualizarConcluido(id, false);
          }
        });
        concluidosList.dataset.bound = "1";
      }
    }

  } catch (err) {
    console.error("Erro ao carregar agendamentos:", err);
    alert("Erro ao carregar agendamentos. Tente novamente mais tarde.");
  }
}

// ============================
// Atualizar status "concluído"
// ============================
async function atualizarConcluido(id, valor) {
  try {
    await fetch(`/api/agendamento/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concluido: valor })
    });
    carregarAgendamentos();
  } catch (err) {
    console.error("Erro ao atualizar agendamento:", err);
    alert("Erro ao atualizar agendamento.");
  }
}

// ============================
// Excluir agendamento
// ============================
async function excluirAgendamento(id) {
  const confirmar = confirm("Deseja realmente excluir este agendamento?");
  if (!confirmar) return;

  try {
    await fetch(`/api/agendamento/${id}`, { method: "DELETE" });
    carregarAgendamentos();
  } catch (err) {
    console.error("Erro ao excluir agendamento:", err);
    alert("Erro ao excluir agendamento.");
  }
}

// ============================
// Editar agendamento
// ============================
function editarAgendamento(ag) {
  const novoNome = prompt("Nome:", ag.nome) || ag.nome;
  const novoTelefone = prompt("Telefone:", ag.telefone) || ag.telefone;
  const novoCorte = prompt("Corte:", ag.corte) || ag.corte;
  const novaData = prompt("Data (AAAA-MM-DD):", ag.data) || ag.data;
  const novaHora = prompt("Hora (HH:MM):", ag.hora) || ag.hora;

  fetch(`/api/agendamento/${ag.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: novoNome,
      telefone: novoTelefone,
      corte: novoCorte,
      data: novaData,
      hora: novaHora
    })
  }).then(() => carregarAgendamentos())
    .catch((err) => {
      console.error("Erro ao editar agendamento:", err);
      alert("Erro ao editar agendamento.");
    });
}

// ============================
// Inicializar se estiver no dashboard
// ============================
if (window.location.pathname.includes("dashboard.html")) {
  carregarAgendamentos();
}
