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
    this.editIndex = null;
    this.init();
  }

  init() {
    document.getElementById("btnSalvarFilme").addEventListener("click", () => {
      this.salvar();
    });

    // Criar botão cancelar dinamicamente
    const btnSalvar = document.getElementById("btnSalvarFilme");
    const btnCancelar = document.createElement("button");
    btnCancelar.type = "button";
    btnCancelar.id = "btnCancelarFilme";
    btnCancelar.className = "btn btn-outline-secondary";
    btnCancelar.textContent = "Cancelar Edição";
    btnCancelar.style.display = "none";
    btnCancelar.addEventListener("click", () => this.cancelarEdicao());
    btnSalvar.parentElement.appendChild(btnCancelar);

    this.atualizarTabela();
  }

  mostrarMensagem(texto, tipo) {
    const msgDiv = document.getElementById("mensagem");
    msgDiv.innerHTML = `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">${texto}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    setTimeout(() => {
      msgDiv.innerHTML = "";
    }, 4000);
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

    try {
      if (this.editIndex !== null) {
        // Modo edição — atualizar registro existente
        lista[this.editIndex] = filme;
        localStorage.setItem("filmes", JSON.stringify(lista));
        this.mostrarMensagem("Filme atualizado com sucesso!", "success");
        this.cancelarEdicao();
      } else {
        // Modo criação — adicionar novo
        lista.push(filme);
        localStorage.setItem("filmes", JSON.stringify(lista));
        this.mostrarMensagem("Filme cadastrado com sucesso!", "success");
      }
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
      if (this.editIndex === index) tr.classList.add("table-active");
      const dataFormatada = filme.dataEstreia ? new Date(filme.dataEstreia + "T00:00:00").toLocaleDateString("pt-BR") : "—";
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${filme.titulo}</td>
        <td>${filme.genero}</td>
        <td>${filme.classificacao}</td>
        <td>${filme.duracao} min</td>
        <td>${dataFormatada}</td>
        <td>
          <button class="btn btn-warning btn-sm me-1" onclick="controller.editar(${index})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="controller.excluir(${index})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  editar(index) {
    const lista = JSON.parse(localStorage.getItem("filmes")) || [];
    const filme = lista[index];
    if (!filme) return;

    this.editIndex = index;

    // Preencher o formulário com os dados
    document.getElementById("titulo").value = filme.titulo;
    document.getElementById("genero").value = filme.genero;
    document.getElementById("descricao").value = filme.descricao || "";
    document.getElementById("classificacao").value = filme.classificacao;
    document.getElementById("duracao").value = filme.duracao;
    document.getElementById("dataEstreia").value = filme.dataEstreia;

    // Alterar visual para modo edição
    const btnSalvar = document.getElementById("btnSalvarFilme");
    btnSalvar.textContent = "Atualizar Filme";
    btnSalvar.classList.remove("btn-primary");
    btnSalvar.classList.add("btn-warning");

    document.getElementById("btnCancelarFilme").style.display = "block";

    // Destacar a linha na tabela
    this.atualizarTabela();

    // Scroll para o formulário
    document.getElementById("formFilme").scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("titulo").focus();
  }

  cancelarEdicao() {
    this.editIndex = null;
    document.getElementById("formFilme").reset();

    const btnSalvar = document.getElementById("btnSalvarFilme");
    btnSalvar.textContent = "Salvar Filme";
    btnSalvar.classList.remove("btn-warning");
    btnSalvar.classList.add("btn-primary");

    document.getElementById("btnCancelarFilme").style.display = "none";
    this.atualizarTabela();
  }

  excluir(index) {
    // Não permitir excluir enquanto edita
    if (this.editIndex !== null) {
      this.mostrarMensagem("Cancele a edição antes de excluir.", "danger");
      return;
    }

    const sessoes = JSON.parse(localStorage.getItem("sessoes")) || [];
    const ingressos = JSON.parse(localStorage.getItem("ingressos")) || [];

    const sessoesRelacionadas = [];
    sessoes.forEach((sessao, i) => {
      if (sessao.filmeIndex === index) {
        sessoesRelacionadas.push(i);
      }
    });

    let ingressosRelacionados = 0;
    ingressos.forEach((ingresso) => {
      if (sessoesRelacionadas.includes(ingresso.sessaoIndex)) {
        ingressosRelacionados++;
      }
    });

    let msgConfirm = 'Tem certeza que deseja excluir este filme?';
    if (sessoesRelacionadas.length > 0 || ingressosRelacionados > 0) {
      msgConfirm += '\n\n⚠️ EXCLUSÃO ENCADEADA: Serão removidos também:';
      if (sessoesRelacionadas.length > 0) {
        msgConfirm += `\n  • ${sessoesRelacionadas.length} sessão(ões) vinculada(s)`;
      }
      if (ingressosRelacionados > 0) {
        msgConfirm += `\n  • ${ingressosRelacionados} ingresso(s) vendido(s)`;
      }
    }
    msgConfirm += '\n\nEsta ação não pode ser desfeita.';

    const confirmado = confirm(msgConfirm);
    if (!confirmado) return;

    try {
      let novaListaIngressos = ingressos.filter((ingresso) => {
        return !sessoesRelacionadas.includes(ingresso.sessaoIndex);
      });

      let novaListaSessoes = sessoes.filter((sessao) => {
        return sessao.filmeIndex !== index;
      });

      novaListaSessoes.forEach((sessao) => {
        if (sessao.filmeIndex > index) {
          sessao.filmeIndex--;
        }
      });

      const mapaIndicesSessoes = {};
      let novoIndiceSessao = 0;
      sessoes.forEach((sessao, i) => {
        if (!sessoesRelacionadas.includes(i)) {
          mapaIndicesSessoes[i] = novoIndiceSessao;
          novoIndiceSessao++;
        }
      });

      novaListaIngressos.forEach((ingresso) => {
        if (mapaIndicesSessoes[ingresso.sessaoIndex] !== undefined) {
          ingresso.sessaoIndex = mapaIndicesSessoes[ingresso.sessaoIndex];
        }
      });

      const filmes = JSON.parse(localStorage.getItem("filmes")) || [];
      filmes.splice(index, 1);

      localStorage.setItem("filmes", JSON.stringify(filmes));
      localStorage.setItem("sessoes", JSON.stringify(novaListaSessoes));
      localStorage.setItem("ingressos", JSON.stringify(novaListaIngressos));

      let msgSucesso = "Filme excluído com sucesso.";
      if (sessoesRelacionadas.length > 0 || ingressosRelacionados > 0) {
        msgSucesso = `Filme excluído junto com ${sessoesRelacionadas.length} sessão(ões) e ${ingressosRelacionados} ingresso(s) relacionado(s).`;
      }
      this.mostrarMensagem(msgSucesso, "warning");
      this.atualizarTabela();
    } catch (e) {
      this.mostrarMensagem("Erro ao excluir: " + e.message, "danger");
    }
  }
}

const controller = new FilmeController();
