/**
 * Proteção contra cópia de código e acesso a ferramentas de desenvolvimento
 * Golytics Pro - Algoritmo Proprietário
 */

export function initCodeProtection() {
  // Desabilitar right-click
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
  });

  // Desabilitar seleção de texto
  document.addEventListener("selectstart", (e) => {
    e.preventDefault();
    return false;
  });

  // Desabilitar copy
  document.addEventListener("copy", (e) => {
    e.preventDefault();
    return false;
  });

  // Desabilitar atalhos de teclado para dev tools
  document.addEventListener("keydown", (e) => {
    // F12 - Dev Tools
    if (e.key === "F12") {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I - Dev Tools
    if (e.ctrlKey && e.shiftKey && e.key === "I") {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+J - Console
    if (e.ctrlKey && e.shiftKey && e.key === "J") {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+C - Element Inspector
    if (e.ctrlKey && e.shiftKey && e.key === "C") {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+K - Console (Firefox)
    if (e.ctrlKey && e.shiftKey && e.key === "K") {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+M - Responsive Design Mode
    if (e.ctrlKey && e.shiftKey && e.key === "M") {
      e.preventDefault();
      return false;
    }
  });

  // Detectar abertura de dev tools
  let devToolsOpen = false;
  const threshold = 160;

  setInterval(() => {
    if (
      window.outerHeight - window.innerHeight > threshold ||
      window.outerWidth - window.innerWidth > threshold
    ) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        console.clear();
        console.log(
          "%c🔒 Golytics Pro",
          "color: #39D353; font-size: 20px; font-weight: bold;"
        );
        console.log(
          "%cEste site utiliza tecnologia proprietária Golytics Pro.",
          "color: #8B9BB4; font-size: 14px;"
        );
        console.log(
          "%cAcesso ao código-fonte é proibido. Violações serão reportadas.",
          "color: #FF6B6B; font-size: 14px; font-weight: bold;"
        );
      }
    } else {
      devToolsOpen = false;
    }
  }, 1000);

  // Mensagem no console
  console.clear();
  console.log(
    "%c🔒 GOLYTICS PRO - ALGORITMO PROPRIETÁRIO",
    "color: #39D353; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px #39D353;"
  );
  console.log(
    "%cEste site é protegido por tecnologia de segurança avançada.",
    "color: #8B9BB4; font-size: 12px;"
  );
  console.log(
    "%cTentativas de acesso ao código-fonte são monitoradas e reportadas.",
    "color: #FF6B6B; font-size: 12px; font-weight: bold;"
  );
  console.log(
    "%c© 2026 Golytics. Todos os direitos reservados.",
    "color: #8B9BB4; font-size: 11px;"
  );
}
