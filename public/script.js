// Formulário de agendamento
document.getElementById("form-agendamento").addEventListener("submit", async (e) => {
  e.preventDefault();
  const dados = Object.fromEntries(new FormData(e.target).entries());

  // Validação simples
  if(!dados.nome || !dados.telefone || !dados.data || !dados.hora){
    alert("Por favor, preencha todos os campos!");
    return;
  }

  try {
    const res = await fetch("/api/agendar", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(dados)
    });

    if(res.ok){
      alert("✅ Agendamento realizado com sucesso!");
      e.target.reset();
    } else {
      alert("❌ Ocorreu um erro ao agendar. Tente novamente.");
    }
  } catch(err){
    console.error(err);
    alert("❌ Falha na conexão com o servidor.");
  }
});
