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
    // Contar dependentes para informar o usuário
    const sessoes = JSON.parse(localStorage.getItem("sessoes")) || [];
    const ingressos = JSON.parse(localStorage.getItem("ingressos")) || [];

    // Sessões que referenciam esta sala
    const sessoesRelacionadas = [];
    sessoes.forEach((sessao, i) => {
      if (sessao.salaIndex === index) {
        sessoesRelacionadas.push(i);
      }
    });

    // Ingressos que referenciam as sessões relacionadas
    let ingressosRelacionados = 0;
    ingressos.forEach((ingresso) => {
      if (sessoesRelacionadas.includes(ingresso.sessaoIndex)) {
        ingressosRelacionados++;
      }
    });

    // Montar mensagem de confirmação
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
      // 1. Remover ingressos das sessões relacionadas
      let novaListaIngressos = ingressos.filter((ingresso) => {
        return !sessoesRelacionadas.includes(ingresso.sessaoIndex);
      });

      // 2. Remover sessões relacionadas
      let novaListaSessoes = sessoes.filter((sessao) => {
        return sessao.salaIndex !== index;
      });

      // 3. Reajustar salaIndex nas sessões restantes (índices acima do removido diminuem em 1)
      novaListaSessoes.forEach((sessao) => {
        if (sessao.salaIndex > index) {
          sessao.salaIndex--;
        }
      });

      // 4. Reajustar sessaoIndex nos ingressos restantes
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

      // 5. Remover a sala
      const salas = JSON.parse(localStorage.getItem("salas")) || [];
      salas.splice(index, 1);

      // 6. Salvar tudo no localStorage
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
