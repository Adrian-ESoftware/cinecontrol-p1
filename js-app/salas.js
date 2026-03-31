class Sala {
  constructor(nome, capacidade, tipo) {
    this.nome = nome;
    this.capacidade = capacidade;
    this.tipo = tipo;
  }
}

class SalaController {
  constructor() {
    this.salas = [];
    this.editIndex = null;
    this.init();
  }

  init() {
    document.getElementById("btnSalvarSala").addEventListener("click", () => {
      this.salvar();
    });

    // Criar botão cancelar dinamicamente
    const btnSalvar = document.getElementById("btnSalvarSala");
    const btnCancelar = document.createElement("button");
    btnCancelar.type = "button";
    btnCancelar.id = "btnCancelarSala";
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
    const nome = document.getElementById("nomeSala").value.trim();
    const capacidade = document.getElementById("capacidade").value;
    const tipo = document.getElementById("tipoSala").value;

    if (!nome || !capacidade || !tipo) {
      this.mostrarMensagem("Preencha todos os campos obrigatórios.", "danger");
      return;
    }

    const sala = new Sala(nome, capacidade, tipo);
    const lista = JSON.parse(localStorage.getItem("salas")) || [];

    try {
      if (this.editIndex !== null) {
        lista[this.editIndex] = sala;
        localStorage.setItem("salas", JSON.stringify(lista));
        this.mostrarMensagem("Sala atualizada com sucesso!", "success");
        this.cancelarEdicao();
      } else {
        lista.push(sala);
        localStorage.setItem("salas", JSON.stringify(lista));
        this.mostrarMensagem("Sala cadastrada com sucesso!", "success");
      }
      document.getElementById("formSala").reset();
      this.atualizarTabela();
    } catch (e) {
      this.mostrarMensagem("Erro ao salvar: armazenamento do navegador está cheio.", "danger");
    }
  }

  atualizarTabela() {
    const lista = JSON.parse(localStorage.getItem("salas")) || [];
    const tbody = document.getElementById("tabelaSalas").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

    lista.forEach((sala, index) => {
      const tr = document.createElement("tr");
      if (this.editIndex === index) tr.classList.add("table-active");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${sala.nome}</td>
        <td>${sala.capacidade}</td>
        <td>${sala.tipo}</td>
        <td>
          <button class="btn btn-warning btn-sm me-1" onclick="controller.editar(${index})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="controller.excluir(${index})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  editar(index) {
    const lista = JSON.parse(localStorage.getItem("salas")) || [];
    const sala = lista[index];
    if (!sala) return;

    this.editIndex = index;

    document.getElementById("nomeSala").value = sala.nome;
    document.getElementById("capacidade").value = sala.capacidade;
    document.getElementById("tipoSala").value = sala.tipo;

    const btnSalvar = document.getElementById("btnSalvarSala");
    btnSalvar.textContent = "Atualizar Sala";
    btnSalvar.classList.remove("btn-success");
    btnSalvar.classList.add("btn-warning");

    document.getElementById("btnCancelarSala").style.display = "block";

    this.atualizarTabela();

    document.getElementById("formSala").scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("nomeSala").focus();
  }

  cancelarEdicao() {
    this.editIndex = null;
    document.getElementById("formSala").reset();

    const btnSalvar = document.getElementById("btnSalvarSala");
    btnSalvar.textContent = "Salvar Sala";
    btnSalvar.classList.remove("btn-warning");
    btnSalvar.classList.add("btn-success");

    document.getElementById("btnCancelarSala").style.display = "none";
    this.atualizarTabela();
  }

  excluir(index) {
    if (this.editIndex !== null) {
      this.mostrarMensagem("Cancele a edição antes de excluir.", "danger");
      return;
    }

    const sessoes = JSON.parse(localStorage.getItem("sessoes")) || [];
    const ingressos = JSON.parse(localStorage.getItem("ingressos")) || [];

    const sessoesRelacionadas = [];
    sessoes.forEach((sessao, i) => {
      if (sessao.salaIndex === index) {
        sessoesRelacionadas.push(i);
      }
    });

    let ingressosRelacionados = 0;
    ingressos.forEach((ingresso) => {
      if (sessoesRelacionadas.includes(ingresso.sessaoIndex)) {
        ingressosRelacionados++;
      }
    });

    let msgConfirm = 'Tem certeza que deseja excluir esta sala?';
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
        return sessao.salaIndex !== index;
      });

      novaListaSessoes.forEach((sessao) => {
        if (sessao.salaIndex > index) {
          sessao.salaIndex--;
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

      const salas = JSON.parse(localStorage.getItem("salas")) || [];
      salas.splice(index, 1);

      localStorage.setItem("salas", JSON.stringify(salas));
      localStorage.setItem("sessoes", JSON.stringify(novaListaSessoes));
      localStorage.setItem("ingressos", JSON.stringify(novaListaIngressos));

      let msgSucesso = "Sala excluída com sucesso.";
      if (sessoesRelacionadas.length > 0 || ingressosRelacionados > 0) {
        msgSucesso = `Sala excluída junto com ${sessoesRelacionadas.length} sessão(ões) e ${ingressosRelacionados} ingresso(s) relacionado(s).`;
      }
      this.mostrarMensagem(msgSucesso, "warning");
      this.atualizarTabela();
    } catch (e) {
      this.mostrarMensagem("Erro ao excluir: " + e.message, "danger");
    }
  }
}

const controller = new SalaController();
