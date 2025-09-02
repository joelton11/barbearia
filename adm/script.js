// ============================
// Verificar login ADM
// ============================
if (window.location.pathname.includes("dashboard.html")) {
  if (localStorage.getItem("admLogado") !== "true") {
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
    const usuario = e.target.usuario.value;
    const senha = e.target.senha.value;

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
    const agendamentos = await res.json();

    const tbodyPendentes = document.querySelector("#tabela-pendentes tbody");
    const tbodyConcluidos = document.querySelector("#tabela-concluidos tbody"); // pode não existir
    const concluidosList = document.getElementById("concluidos-list");

    if (tbodyPendentes) tbodyPendentes.innerHTML = "";
    if (tbodyConcluidos) tbodyConcluidos.innerHTML = ""; // safe se existir

    let total = 0, concluidos = 0, pendentes = 0;
    const idsConcluidos = [];

    agendamentos.forEach(a => {
      total++;

      // Cria a linha da tabela (usamos sempre a estrutura; só inserimos em Pendentes)
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
        // Se houver uma tabela de concluídos no HTML, também joga lá (opcional)
        if (tbodyConcluidos) tbodyConcluidos.appendChild(tr);
      } else {
        pendentes++;
        if (tbodyPendentes) tbodyPendentes.appendChild(tr);
      }

      // ============================
      // Botão concluir/reabrir
      // ============================
      const btnConcluir = tr.querySelector(".btn-concluir");
      btnConcluir.addEventListener("click", () => {
        if (a.concluido) {
          if (confirm("Deseja reabrir este agendamento?")) {
            atualizarConcluido(a.id, false);
          }
        } else {
          if (confirm("Deseja marcar este agendamento como concluído?")) {
            atualizarConcluido(a.id, true);
          }
        }
      });

      // ============================
      // Botão editar
      // ============================
      const btnEditar = tr.querySelector(".btn-editar");
      btnEditar.addEventListener("click", () => editarAgendamento(a));

      // ============================
      // Botão excluir
      // ============================
      const btnExcluir = tr.querySelector(".btn-excluir");
      btnExcluir.addEventListener("click", () => excluirAgendamento(a.id));
    });

    // Atualizar cards de números
    const elTotal = document.getElementById("total-agendamentos");
    const elConcl = document.getElementById("agendamentos-concluidos");
    const elPend = document.getElementById("agendamentos-pendentes");
    if (elTotal) elTotal.textContent = total;
    if (elConcl) elConcl.textContent = concluidos;
    if (elPend) elPend.textContent = pendentes;

    // Atualizar lista de IDs concluídos dentro do card
    if (concluidosList) {
      if (idsConcluidos.length === 0) {
        concluidosList.innerHTML = `<span class="placeholder">Nenhum</span>`;
      } else {
        concluidosList.innerHTML = idsConcluidos
          .map(id => `<span class="chip" data-id="${id}">${id}</span>`)
          .join("");
      }
    }

    // Clique em chip para reabrir
    if (concluidosList && !concluidosList.dataset.bound) {
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

  } catch (err) {
    console.error("Erro ao carregar agendamentos:", err);
  }
}

// ============================
// Atualizar concluído
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
    console.error(err);
  }
}

// ============================
// Excluir agendamento
// ============================
async function excluirAgendamento(id) {
  if (confirm("Deseja realmente excluir este agendamento?")) {
    try {
      await fetch(`/api/agendamento/${id}`, { method: "DELETE" });
      carregarAgendamentos();
    } catch (err) {
      console.error(err);
    }
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
  }).then(() => carregarAgendamentos());
}

// ============================
// Inicializar
// ============================
if (window.location.pathname.includes("dashboard.html")) {
  carregarAgendamentos();
}
