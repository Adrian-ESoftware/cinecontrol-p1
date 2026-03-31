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
    this.init();
  }

  init() {
    document.getElementById("btnSalvarSala").addEventListener("click", () => {
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
    const nome = document.getElementById("nomeSala").value.trim();
    const capacidade = document.getElementById("capacidade").value;
    const tipo = document.getElementById("tipoSala").value;

    if (!nome || !capacidade || !tipo) {
      this.mostrarMensagem("Preencha todos os campos obrigatórios.", "danger");
      return;
    }

    const sala = new Sala(nome, capacidade, tipo);

    const lista = JSON.parse(localStorage.getItem("salas")) || [];
    lista.push(sala);
    try {
      localStorage.setItem("salas", JSON.stringify(lista));
      this.mostrarMensagem("Sala cadastrada com sucesso!", "success");
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
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${sala.nome}</td>
        <td>${sala.capacidade}</td>
        <td>${sala.tipo}</td>
        <td><button class="btn btn-danger btn-sm" onclick="controller.excluir(${index})">Excluir</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  excluir(index) {
    const confirmado = confirm('Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita.');
    if (!confirmado) return;

    const lista = JSON.parse(localStorage.getItem("salas")) || [];
    lista.splice(index, 1);
    try {
      localStorage.setItem("salas", JSON.stringify(lista));
      this.mostrarMensagem("Sala excluída.", "warning");
      this.atualizarTabela();
    } catch (e) {
      this.mostrarMensagem("Erro ao salvar: armazenamento do navegador está cheio.", "danger");
    }
  }
}

const controller = new SalaController();
