// ===== VARIÁVEIS GLOBAIS =====
let dadosAtuais = null;
let abaAtual = 'dashboard';
let modalResolver = null;
let modalConfig = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main iniciado');
    
    modalResolver = document.getElementById('modalResolver');
    modalConfig = document.getElementById('modalConfig');
    
    carregarDados();
    setInterval(carregarDados, 120000);
});

// ===== CARREGAMENTO DE DADOS =====
async function carregarDados() {
    mostrarLoading(true);
    
    try {
        const response = await fetch('/api/dados');
        dadosAtuais = await response.json();
        console.log('Dados carregados:', dadosAtuais.conflitos.length, 'conflitos');
        
        // Renderiza a aba atual
        if (abaAtual === 'dashboard') renderizarDashboard(dadosAtuais);
        else if (abaAtual === 'conflitos') renderizarConflitos(dadosAtuais);
        else if (abaAtual === 'historico') renderizarHistorico(dadosAtuais);
        else if (abaAtual === 'ranking') renderizarRanking(dadosAtuais);
        else if (abaAtual === 'config') renderizarConfig(dadosAtuais);
        else if (abaAtual === 'perfil') renderizarPerfil(dadosAtuais);
        else if (abaAtual === 'sistema') renderizarSistema(dadosAtuais);
        // NOVA ABA UPLOAD
        else if (abaAtual === 'upload') renderizarUpload(dadosAtuais);
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados: ' + error.message);
    }
    
    mostrarLoading(false);
}

// ===== NAVEGAÇÃO =====
function mudarAba(aba, elemento) {
    console.log('Mudando para aba:', aba);
    abaAtual = aba;
    
    // Remove active de todos os botões
    document.querySelectorAll('#sidebar-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Adiciona active no botão clicado
    if (elemento) elemento.classList.add('active');
    
    // Recarrega dados e renderiza
    if (dadosAtuais) {
        if (aba === 'dashboard') renderizarDashboard(dadosAtuais);
        else if (aba === 'conflitos') renderizarConflitos(dadosAtuais);
        else if (aba === 'historico') renderizarHistorico(dadosAtuais);
        else if (aba === 'ranking') renderizarRanking(dadosAtuais);
        else if (aba === 'config') renderizarConfig(dadosAtuais);
        else if (aba === 'perfil') renderizarPerfil(dadosAtuais);
        else if (aba === 'sistema') renderizarSistema(dadosAtuais);
        // NOVA ABA UPLOAD
        else if (aba === 'upload') renderizarUpload(dadosAtuais);
    }
}

// ===== FILTRO DE BUSCA =====
function filtrarBusca() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    // Implementar se necessário
}

// ===== UTILITÁRIOS =====
function mostrarLoading(mostrar) {
    const loading = document.getElementById('loading');
    if (loading) {
        if (mostrar) loading.classList.add('show');
        else loading.classList.remove('show');
    }
}

function fecharModal(modal) {
    if (modal === 'resolver' && modalResolver) {
        modalResolver.classList.remove('show');
    } else if (modal === 'config' && modalConfig) {
        modalConfig.classList.remove('show');
    }
}

// ===== EXPORTA FUNÇÕES GLOBAIS =====
window.mudarAba = mudarAba;
window.filtrarBusca = filtrarBusca;
window.fecharModal = fecharModal;
window.mostrarLoading = mostrarLoading;
window.carregarDados = carregarDados;