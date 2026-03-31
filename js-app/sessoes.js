class Sessao {
  constructor(filmeIndex, salaIndex, dataHora, preco, idioma, formato) {
    this.filmeIndex = filmeIndex;
    this.salaIndex = salaIndex;
    this.dataHora = dataHora;
    this.preco = preco;
    this.idioma = idioma;
    this.formato = formato;
  }
}

class SessaoController {
  constructor() {
    this.sessoes = [];
    this.init();
  }

  init() {
    this.carregarSelects();
    document.getElementById("btnSalvarSessao").addEventListener("click", () => {
      this.salvar();
    });
    this.atualizarTabela();
  }

  mostrarMensagem(texto, tipo) {
    const msgDiv = document.getElementById("mensagem");
    msgDiv.innerHTML = `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">${texto}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    setTimeout(() => {
      msgDiv.innerHTML = "";
    }, 3000);
  }

  carregarSelects() {
    const filmes = JSON.parse(localStorage.getItem("filmes")) || [];
    const salas = JSON.parse(localStorage.getItem("salas")) || [];

    const selectFilme = document.getElementById("selectFilme");
    // Limpar options existentes exceto a primeira (placeholder)
    while (selectFilme.options.length > 1) {
      selectFilme.remove(1);
    }

    if (filmes.length === 0) {
      const opt = document.createElement("option");
      opt.textContent = "Nenhum registro cadastrado";
      opt.disabled = true;
      selectFilme.appendChild(opt);
    } else {
      filmes.forEach((filme, index) => {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = filme.titulo;
        selectFilme.appendChild(opt);
      });
    }

    const selectSala = document.getElementById("selectSala");
    while (selectSala.options.length > 1) {
      selectSala.remove(1);
    }

    if (salas.length === 0) {
      const opt = document.createElement("option");
      opt.textContent = "Nenhum registro cadastrado";
      opt.disabled = true;
      selectSala.appendChild(opt);
    } else {
      salas.forEach((sala, index) => {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = sala.nome;
        selectSala.appendChild(opt);
      });
    }
  }

  salvar() {
    const filmeIndex = document.getElementById("selectFilme").value;
    const salaIndex = document.getElementById("selectSala").value;
    const dataHora = document.getElementById("dataHora").value;
    const preco = document.getElementById("preco").value;
    const idioma = document.getElementById("idioma").value;
    const formato = document.getElementById("formato").value;

    if (!filmeIndex || !salaIndex || !dataHora || !preco) {
      this.mostrarMensagem("Preencha todos os campos obrigatórios.", "danger");
      return;
    }

    const sessao = new Sessao(
      parseInt(filmeIndex),
      parseInt(salaIndex),
      dataHora,
      parseFloat(preco),
      idioma,
      formato
    );

    const lista = JSON.parse(localStorage.getItem("sessoes")) || [];
    lista.push(sessao);
    try {
      localStorage.setItem("sessoes", JSON.stringify(lista));
      this.mostrarMensagem("Sessão cadastrada com sucesso!", "success");
      document.getElementById("formSessao").reset();
      this.atualizarTabela();
    } catch (e) {
      this.mostrarMensagem("Erro ao salvar: armazenamento do navegador está cheio.", "danger");
    }
  }

  atualizarTabela() {
    const lista = JSON.parse(localStorage.getItem("sessoes")) || [];
    const filmes = JSON.parse(localStorage.getItem("filmes")) || [];
    const salas = JSON.parse(localStorage.getItem("salas")) || [];
    const tbody = document.getElementById("tabelaSessoes").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

    lista.forEach((sessao, index) => {
      const filme = filmes[sessao.filmeIndex];
      const sala = salas[sessao.salaIndex];
      const nomeFilme = filme ? filme.titulo : "Filme removido";
      const nomeSala = sala ? sala.nome : "Sala removida";
      const dataFormatada = sessao.dataHora ? new Date(sessao.dataHora).toLocaleString("pt-BR") : "—";
      const precoFormatado = parseFloat(sessao.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${nomeFilme}</td>
        <td>${nomeSala}</td>
        <td>${dataFormatada}</td>
        <td>${precoFormatado}</td>
        <td>${sessao.idioma}</td>
        <td>${sessao.formato}</td>
        <td><button class="btn btn-danger btn-sm" onclick="controller.excluir(${index})">Excluir</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  excluir(index) {
    const confirmado = confirm('Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.');
    if (!confirmado) return;

    const lista = JSON.parse(localStorage.getItem("sessoes")) || [];
    lista.splice(index, 1);
    try {
      localStorage.setItem("sessoes", JSON.stringify(lista));
      this.mostrarMensagem("Sessão excluída.", "warning");
      this.atualizarTabela();
    } catch (e) {
      this.mostrarMensagem("Erro ao salvar: armazenamento do navegador está cheio.", "danger");
    }
  }
}

const controller = new SessaoController();
