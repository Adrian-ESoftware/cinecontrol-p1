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
    // Contar dependentes para informar o usuário
    const sessoes = JSON.parse(localStorage.getItem("sessoes")) || [];
    const ingressos = JSON.parse(localStorage.getItem("ingressos")) || [];

    // Sessões que referenciam este filme
    const sessoesRelacionadas = [];
    sessoes.forEach((sessao, i) => {
      if (sessao.filmeIndex === index) {
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
      // 1. Remover ingressos das sessões relacionadas e reajustar índices
      let novaListaIngressos = ingressos.filter((ingresso) => {
        return !sessoesRelacionadas.includes(ingresso.sessaoIndex);
      });

      // 2. Remover sessões relacionadas e reajustar índices
      let novaListaSessoes = sessoes.filter((sessao) => {
        return sessao.filmeIndex !== index;
      });

      // 3. Reajustar filmeIndex nas sessões restantes (índices acima do removido diminuem em 1)
      novaListaSessoes.forEach((sessao) => {
        if (sessao.filmeIndex > index) {
          sessao.filmeIndex--;
        }
      });

      // 4. Reajustar sessaoIndex nos ingressos restantes
      // Criar mapa: índice antigo da sessão → índice novo
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

      // 5. Remover o filme
      const filmes = JSON.parse(localStorage.getItem("filmes")) || [];
      filmes.splice(index, 1);

      // 6. Salvar tudo no localStorage
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
