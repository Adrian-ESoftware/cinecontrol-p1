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
    this.editIndex = null;
    this.init();
  }

  init() {
    this.carregarSelects();
    document.getElementById("btnSalvarSessao").addEventListener("click", () => {
      this.salvar();
    });

    // Criar botão cancelar dinamicamente
    const btnSalvar = document.getElementById("btnSalvarSessao");
    const btnCancelar = document.createElement("button");
    btnCancelar.type = "button";
    btnCancelar.id = "btnCancelarSessao";
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

  carregarSelects() {
    const filmes = JSON.parse(localStorage.getItem("filmes")) || [];
    const salas = JSON.parse(localStorage.getItem("salas")) || [];

    const selectFilme = document.getElementById("selectFilme");
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

    try {
      if (this.editIndex !== null) {
        lista[this.editIndex] = sessao;
        localStorage.setItem("sessoes", JSON.stringify(lista));
        this.mostrarMensagem("Sessão atualizada com sucesso!", "success");
        this.cancelarEdicao();
      } else {
        lista.push(sessao);
        localStorage.setItem("sessoes", JSON.stringify(lista));
        this.mostrarMensagem("Sessão cadastrada com sucesso!", "success");
      }
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
      if (this.editIndex === index) tr.classList.add("table-active");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${nomeFilme}</td>
        <td>${nomeSala}</td>
        <td>${dataFormatada}</td>
        <td>${precoFormatado}</td>
        <td>${sessao.idioma}</td>
        <td>${sessao.formato}</td>
        <td>
          <button class="btn btn-warning btn-sm me-1" onclick="controller.editar(${index})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="controller.excluir(${index})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  editar(index) {
    const lista = JSON.parse(localStorage.getItem("sessoes")) || [];
    const sessao = lista[index];
    if (!sessao) return;

    this.editIndex = index;

    // Recarregar selects para garantir opções atualizadas
    this.carregarSelects();

    // Preencher o formulário com os dados da sessão
    document.getElementById("selectFilme").value = sessao.filmeIndex;
    document.getElementById("selectSala").value = sessao.salaIndex;
    document.getElementById("dataHora").value = sessao.dataHora;
    document.getElementById("preco").value = sessao.preco;
    document.getElementById("idioma").value = sessao.idioma;
    document.getElementById("formato").value = sessao.formato;

    const btnSalvar = document.getElementById("btnSalvarSessao");
    btnSalvar.textContent = "Atualizar Sessão";
    btnSalvar.classList.remove("btn-primary");
    btnSalvar.classList.add("btn-warning");

    document.getElementById("btnCancelarSessao").style.display = "block";

    this.atualizarTabela();

    document.getElementById("formSessao").scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("selectFilme").focus();
  }

  cancelarEdicao() {
    this.editIndex = null;
    document.getElementById("formSessao").reset();

    const btnSalvar = document.getElementById("btnSalvarSessao");
    btnSalvar.textContent = "Salvar Sessão";
    btnSalvar.classList.remove("btn-warning");
    btnSalvar.classList.add("btn-primary");

    document.getElementById("btnCancelarSessao").style.display = "none";
    this.atualizarTabela();
  }

  excluir(index) {
    if (this.editIndex !== null) {
      this.mostrarMensagem("Cancele a edição antes de excluir.", "danger");
      return;
    }

    const ingressos = JSON.parse(localStorage.getItem("ingressos")) || [];

    let ingressosRelacionados = 0;
    ingressos.forEach((ingresso) => {
      if (ingresso.sessaoIndex === index) {
        ingressosRelacionados++;
      }
    });

    let msgConfirm = 'Tem certeza que deseja excluir esta sessão?';
    if (ingressosRelacionados > 0) {
      msgConfirm += `\n\n⚠️ EXCLUSÃO ENCADEADA: Serão removidos também:\n  • ${ingressosRelacionados} ingresso(s) vendido(s) para esta sessão`;
    }
    msgConfirm += '\n\nEsta ação não pode ser desfeita.';

    const confirmado = confirm(msgConfirm);
    if (!confirmado) return;

    try {
      let novaListaIngressos = ingressos.filter((ingresso) => {
        return ingresso.sessaoIndex !== index;
      });

      novaListaIngressos.forEach((ingresso) => {
        if (ingresso.sessaoIndex > index) {
          ingresso.sessaoIndex--;
        }
      });

      const sessoes = JSON.parse(localStorage.getItem("sessoes")) || [];
      sessoes.splice(index, 1);

      localStorage.setItem("sessoes", JSON.stringify(sessoes));
      localStorage.setItem("ingressos", JSON.stringify(novaListaIngressos));

      let msgSucesso = "Sessão excluída com sucesso.";
      if (ingressosRelacionados > 0) {
        msgSucesso = `Sessão excluída junto com ${ingressosRelacionados} ingresso(s) relacionado(s).`;
      }
      this.mostrarMensagem(msgSucesso, "warning");
      this.atualizarTabela();
    } catch (e) {
      this.mostrarMensagem("Erro ao excluir: " + e.message, "danger");
    }
  }
}

const controller = new SessaoController();
