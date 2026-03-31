(function carregar() {
  const sessoes = JSON.parse(localStorage.getItem("sessoes")) || [];
  const filmes = JSON.parse(localStorage.getItem("filmes")) || [];
  const salas = JSON.parse(localStorage.getItem("salas")) || [];
  const container = document.getElementById("containerSessoes");
  container.innerHTML = "";

  if (sessoes.length === 0) {
    container.innerHTML = `<div class="col-12 empty-msg">🎬 Nenhuma sessão disponível.</div>`;
    return;
  }

  sessoes.forEach((sessao, index) => {
    const filme = filmes[sessao.filmeIndex];
    const sala = salas[sessao.salaIndex];
    const nomeFilme = filme ? filme.titulo : "Filme removido";
    const nomeSala = sala ? sala.nome : "Sala removida";
    const dataFormatada = sessao.dataHora ? new Date(sessao.dataHora).toLocaleString("pt-BR") : "—";
    const precoFormatado = parseFloat(sessao.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const col = document.createElement("div");
    col.className = "col-md-4";
    col.innerHTML = `
      <div class="card card-sessao h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-2">🎬 ${nomeFilme}</h5>
          <p class="card-text mb-1"><strong>🏛️ Sala:</strong> ${nomeSala}</p>
          <p class="card-text mb-1"><strong>📅 Data/Hora:</strong> ${dataFormatada}</p>
          <p class="card-text mb-1"><strong>🗣️ Idioma:</strong> ${sessao.idioma}</p>
          <p class="card-text mb-2"><strong>📽️ Formato:</strong> ${sessao.formato}</p>
          <div class="mt-auto">
            <p class="price-tag mb-3">${precoFormatado}</p>
            <button class="btn btn-comprar btn-sm w-100" onclick="window.location.href='venda-ingressos.html?sessaoIndex=${index}'">
              🎟️ Comprar Ingresso
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
})();
