class Filme {
  constructor(titulo, genero, descricao, classificacao, duracao, dataEstreia) {
    this.titulo = titulo;
    this.genero = genero;
    this.descricao = descricao;
    this.classificacao = classificacao;
    this.duracao = duracao;
    this.dataEstreia = dataEstreia;
  }
}

class FilmeController {
  constructor() {
    this.filmes = [];
    this.init();
  }

  init() {
    document.getElementById("btnSalvarFilme").addEventListener("click", () => {
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

  salvar() {
    const titulo = document.getElementById("titulo").value.trim();
    const genero = document.getElementById("genero").value;
    const descricao = document.getElementById("descricao").value.trim();
    const classificacao = document.getElementById("classificacao").value;
    const duracao = document.getElementById("duracao").value;
    const dataEstreia = document.getElementById("dataEstreia").value;

    if (!titulo || !genero || !classificacao || !duracao || !dataEstreia) {
      this.mostrarMensagem("Preencha os campos obrigatórios: Título, Gênero, Classificação Indicativa, Duração e Data de Estreia. A Descrição é opcional.", "danger");
      return;
    }

    const filme = new Filme(titulo, genero, descricao, classificacao, duracao, dataEstreia);

    const lista = JSON.parse(localStorage.getItem("filmes")) || [];
    lista.push(filme);
    try {
      localStorage.setItem("filmes", JSON.stringify(lista));
      this.mostrarMensagem("Filme cadastrado com sucesso!", "success");
      document.getElementById("formFilme").reset();
      this.atualizarTabela();
    } catch (e) {
      this.mostrarMensagem("Erro ao salvar: armazenamento do navegador está cheio.", "danger");
    }
  }

  atualizarTabela() {
    const lista = JSON.parse(localStorage.getItem("filmes")) || [];
    const tbody = document.getElementById("tabelaFilmes").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

    lista.forEach((filme, index) => {
      const tr = document.createElement("tr");
      const dataFormatada = filme.dataEstreia ? new Date(filme.dataEstreia + "T00:00:00").toLocaleDateString("pt-BR") : "—";
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${filme.titulo}</td>
        <td>${filme.genero}</td>
        <td>${filme.classificacao}</td>
        <td>${filme.duracao} min</td>
        <td>${dataFormatada}</td>
        <td><button class="btn btn-danger btn-sm" onclick="controller.excluir(${index})">Excluir</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  excluir(index) {
    const confirmado = confirm('Tem certeza que deseja excluir este filme? Esta ação não pode ser desfeita.');
    if (!confirmado) return;

    const lista = JSON.parse(localStorage.getItem("filmes")) || [];
    lista.splice(index, 1);
    try {
      localStorage.setItem("filmes", JSON.stringify(lista));
      this.mostrarMensagem("Filme excluído.", "warning");
      this.atualizarTabela();
    } catch (e) {
      this.mostrarMensagem("Erro ao salvar: armazenamento do navegador está cheio.", "danger");
    }
  }
}

const controller = new FilmeController();
