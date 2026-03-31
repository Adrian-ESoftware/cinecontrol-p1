class Ingresso {
  constructor(sessaoIndex, nomeCliente, cpf, assento, tipoPagamento) {
    this.sessaoIndex = sessaoIndex;
    this.nomeCliente = nomeCliente;
    this.cpf = cpf;
    this.assento = assento;
    this.tipoPagamento = tipoPagamento;
  }
}

class VendaController {
  constructor() {
    this.ingressos = [];
    this.editIndex = null;
    this.init();
  }

  init() {
    this.carregarSelectSessoes();

    // Verificar parâmetro na URL para pré-selecionar sessão
    const params = new URLSearchParams(window.location.search);
    const sessaoIndex = params.get("sessaoIndex");
    if (sessaoIndex !== null) {
      const selectSessao = document.getElementById("selectSessao");
      selectSessao.value = sessaoIndex;
    }

    document.getElementById("btnConfirmarVenda").addEventListener("click", () => {
      this.salvar();
    });

    // Criar botão cancelar dinamicamente
    const btnSalvar = document.getElementById("btnConfirmarVenda");
    const btnCancelar = document.createElement("button");
    btnCancelar.type = "button";
    btnCancelar.id = "btnCancelarVenda";
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

  carregarSelectSessoes() {
    const sessoes = JSON.parse(localStorage.getItem("sessoes")) || [];
    const filmes = JSON.parse(localStorage.getItem("filmes")) || [];

    const selectSessao = document.getElementById("selectSessao");
    while (selectSessao.options.length > 1) {
      selectSessao.remove(1);
    }

    if (sessoes.length === 0) {
      const opt = document.createElement("option");
      opt.textContent = "Nenhum registro cadastrado";
      opt.disabled = true;
      selectSessao.appendChild(opt);
    } else {
      sessoes.forEach((sessao, index) => {
        const filme = filmes[sessao.filmeIndex];
        const nomeFilme = filme ? filme.titulo : "Filme removido";
        const dataFormatada = sessao.dataHora ? new Date(sessao.dataHora).toLocaleString("pt-BR") : "—";
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = `${nomeFilme} — ${dataFormatada}`;
        selectSessao.appendChild(opt);
      });
    }
  }

  salvar() {
    const sessaoIndex = document.getElementById("selectSessao").value;
    const nomeCliente = document.getElementById("nomeCliente").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const assento = document.getElementById("assento").value.trim();
    const tipoPagamento = document.getElementById("tipoPagamento").value;

    if (!sessaoIndex || !nomeCliente || !cpf || !assento) {
      this.mostrarMensagem("Preencha todos os campos obrigatórios.", "danger");
      return;
    }

    // Validação do CPF — deve ter exatamente 11 dígitos numéricos
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      this.mostrarMensagem("CPF inválido! Digite os 11 dígitos numéricos do CPF.", "danger");
      document.getElementById("cpf").focus();
      return;
    }

    const ingresso = new Ingresso(
      parseInt(sessaoIndex),
      nomeCliente,
      cpf,
      assento,
      tipoPagamento
    );

    const lista = JSON.parse(localStorage.getItem("ingressos")) || [];

    try {
      if (this.editIndex !== null) {
        lista[this.editIndex] = ingresso;
        localStorage.setItem("ingressos", JSON.stringify(lista));
        this.mostrarMensagem("Ingresso atualizado com sucesso!", "success");
        this.cancelarEdicao();
      } else {
        lista.push(ingresso);
        localStorage.setItem("ingressos", JSON.stringify(lista));
        this.mostrarMensagem("Ingresso vendido com sucesso!", "success");
      }
      document.getElementById("formVenda").reset();
      this.atualizarTabela();
    } catch (e) {
      this.mostrarMensagem("Erro ao salvar: armazenamento do navegador está cheio.", "danger");
    }
  }

  atualizarTabela() {
    const lista = JSON.parse(localStorage.getItem("ingressos")) || [];
    const sessoes = JSON.parse(localStorage.getItem("sessoes")) || [];
    const filmes = JSON.parse(localStorage.getItem("filmes")) || [];
    const tbody = document.getElementById("tabelaIngressos").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

    lista.forEach((ingresso, index) => {
      const sessao = sessoes[ingresso.sessaoIndex];
      let nomeSessao = "Sessão removida";
      if (sessao) {
        const filme = filmes[sessao.filmeIndex];
        const nomeFilme = filme ? filme.titulo : "Filme removido";
        const dataFormatada = sessao.dataHora ? new Date(sessao.dataHora).toLocaleString("pt-BR") : "—";
        nomeSessao = `${nomeFilme} — ${dataFormatada}`;
      }

      const tr = document.createElement("tr");
      if (this.editIndex === index) tr.classList.add("table-active");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${nomeSessao}</td>
        <td>${ingresso.nomeCliente}</td>
        <td>${ingresso.cpf}</td>
        <td>${ingresso.assento}</td>
        <td>${ingresso.tipoPagamento}</td>
        <td>
          <button class="btn btn-warning btn-sm me-1" onclick="controller.editar(${index})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="controller.excluir(${index})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  editar(index) {
    const lista = JSON.parse(localStorage.getItem("ingressos")) || [];
    const ingresso = lista[index];
    if (!ingresso) return;

    this.editIndex = index;

    // Recarregar select de sessões
    this.carregarSelectSessoes();

    // Preencher o formulário
    document.getElementById("selectSessao").value = ingresso.sessaoIndex;
    document.getElementById("nomeCliente").value = ingresso.nomeCliente;
    document.getElementById("cpf").value = ingresso.cpf;
    document.getElementById("assento").value = ingresso.assento;
    document.getElementById("tipoPagamento").value = ingresso.tipoPagamento;

    const btnSalvar = document.getElementById("btnConfirmarVenda");
    btnSalvar.textContent = "Atualizar Ingresso";
    btnSalvar.classList.remove("btn-success");
    btnSalvar.classList.add("btn-warning");

    document.getElementById("btnCancelarVenda").style.display = "block";

    this.atualizarTabela();

    document.getElementById("formVenda").scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("selectSessao").focus();
  }

  cancelarEdicao() {
    this.editIndex = null;
    document.getElementById("formVenda").reset();

    const btnSalvar = document.getElementById("btnConfirmarVenda");
    btnSalvar.textContent = "Confirmar Venda";
    btnSalvar.classList.remove("btn-warning");
    btnSalvar.classList.add("btn-success");

    document.getElementById("btnCancelarVenda").style.display = "none";
    this.atualizarTabela();
  }

  excluir(index) {
    if (this.editIndex !== null) {
      this.mostrarMensagem("Cancele a edição antes de excluir.", "danger");
      return;
    }

    const confirmado = confirm('Tem certeza que deseja excluir este ingresso? Esta ação não pode ser desfeita.');
    if (!confirmado) return;

    const lista = JSON.parse(localStorage.getItem("ingressos")) || [];
    lista.splice(index, 1);
    try {
      localStorage.setItem("ingressos", JSON.stringify(lista));
      this.mostrarMensagem("Ingresso excluído.", "warning");
      this.atualizarTabela();
    } catch (e) {
      this.mostrarMensagem("Erro ao salvar: armazenamento do navegador está cheio.", "danger");
    }
  }
}

const controller = new VendaController();
