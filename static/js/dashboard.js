// ===== RENDERIZAÇÃO DO DASHBOARD =====
function renderizarDashboard(dados) {
    console.log('Renderizando Dashboard');
    console.log('Dados recebidos:', dados);
    
    // Verifica se os elementos existem
    const leftContent = document.getElementById('left-content');
    const rightContent = document.getElementById('right-content');
    
    if (!leftContent) {
        console.error('left-content não encontrado!');
        return;
    }
    
    if (!rightContent) {
        console.error('right-content não encontrado!');
        return;
    }
    
    // Limpa o conteúdo anterior
    leftContent.innerHTML = '';
    rightContent.innerHTML = '';
    
    // Garante que dados existe
    if (!dados || !dados.conflitos) {
        console.error('Dados inválidos');
        leftContent.innerHTML = '<div style="color: white; padding: 20px;">Erro ao carregar dados</div>';
        return;
    }
    
    // Calcula os valores
    const pendentes = dados.conflitos.filter(c => c.status_atual !== 'RESOLVIDO').length;
    const resolvidos = dados.conflitos.filter(c => c.status_atual === 'RESOLVIDO').length;
    const totalCRCs = Object.keys(dados.crcs || {}).length;
    const topCRC = calcularTopCRC(dados);
    
    // LEFT CONTENT - Cards e lista de conflitos
    leftContent.innerHTML = `
        <!-- CARDS DE ESTATÍSTICA -->
        <div class="stats-grid">
            <div class="stats-card">
                <div class="stats-icon pendente">
                    <i class="fa fa-exclamation-triangle"></i>
                </div>
                <div class="stats-info">
                    <h3>Conflitos Pendentes</h3>
                    <div class="stats-value">${pendentes}</div>
                </div>
            </div>
            
            <div class="stats-card">
                <div class="stats-icon resolvido">
                    <i class="fa fa-check-circle"></i>
                </div>
                <div class="stats-info">
                    <h3>Resolvidos</h3>
                    <div class="stats-value">${resolvidos}</div>
                </div>
            </div>
            
            <div class="stats-card">
                <div class="stats-icon crcs">
                    <i class="fa fa-building"></i>
                </div>
                <div class="stats-info">
                    <h3>CRCs Ativos</h3>
                    <div class="stats-value">${totalCRCs}</div>
                </div>
            </div>
            
            <div class="stats-card">
                <div class="stats-icon trophy">
                    <i class="fa fa-trophy"></i>
                </div>
                <div class="stats-info">
                    <h3>Mais Vitórias</h3>
                    <div class="stats-value">${topCRC}</div>
                </div>
            </div>
        </div>

        <!-- FILTROS RÁPIDOS -->
        <div class="section-header">
            <i class="fa fa-filter"></i>
            <h2>Filtros Rápidos</h2>
        </div>
        <div class="filtros-container" id="filtrosCRC"></div>

        <!-- LISTA DE CONFLITOS -->
        <div class="section-header">
            <i class="fa fa-list"></i>
            <h2>Conflitos Pendentes</h2>
        </div>
        <div class="conflitos-grid" id="listaConflitos"></div>
    `;
    
    // RIGHT CONTENT - Ranking (SÓ NO DASHBOARD)
    rightContent.innerHTML = `
        <div class="ranking-sidebar">
            <div class="section-header">
                <i class="fa fa-trophy"></i>
                <h2>Ranking CRCs</h2>
            </div>
            <div class="ranking-list" id="rankingCRCs"></div>
            
            <div class="quick-actions">
                <button class="btn btn-success" onclick="carregarDados()">
                    <i class="fa fa-refresh"></i> Atualizar Dados
                </button>
                <button class="btn btn-warning" onclick="resolverTodos()">
                    <i class="fa fa-magic"></i> Resolver Todos
                </button>
            </div>
        </div>
    `;
    
    // Renderiza componentes
    renderizarFiltrosCRC(dados);
    renderizarConflitos(dados);
    renderizarRankingSidebar(dados);
}

function calcularTopCRC(dados) {
    if (!dados || !dados.crcs) return '---';
    
    let top = {nome: '---', vitorias: 0};
    for (let crc in dados.crcs) {
        if (dados.crcs[crc].vitorias > top.vitorias) {
            top = {nome: crc, vitorias: dados.crcs[crc].vitorias};
        }
    }
    return top.nome;
}

function renderizarFiltrosCRC(dados) {
    const container = document.getElementById('filtrosCRC');
    if (!container || !dados || !dados.crcs) return;
    
    let html = `
        <div class="filtro-item active" onclick="filtrarCRC('todos', this)">
            <div class="filtro-bolinha">
                <img src="https://ui-avatars.com/api/?name=Todos&background=2e7d32&color=fff&size=128" alt="Todos">
            </div>
            <span>Todos</span>
        </div>
    `;
    
    for (const crc in dados.crcs) {
        html += `
            <div class="filtro-item" onclick="filtrarCRC('${crc}', this)">
                <div class="filtro-bolinha">
                    <img src="https://ui-avatars.com/api/?name=${crc}&background=2e7d32&color=fff&size=128" alt="${crc}">
                </div>
                <span>${crc}</span>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function renderizarConflitos(dados) {
    const container = document.getElementById('listaConflitos');
    if (!container || !dados || !dados.conflitos) return;
    
    let conflitosFiltrados = dados.conflitos.filter(c => c.status_atual !== 'RESOLVIDO');
    
    if (window.filtroCRCatual && window.filtroCRCatual !== 'todos') {
        conflitosFiltrados = conflitosFiltrados.filter(c => 
            c.interessados && c.interessados.includes(window.filtroCRCatual)
        );
    }
    
    if (conflitosFiltrados.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">🎉 Nenhum conflito pendente!</div>';
        return;
    }
    
    let html = '';
    for (const c of conflitosFiltrados) {
        const crcsHtml = c.interessados ? c.interessados.map(crc => 
            `<span class="crc-badge S">${crc}</span>`
        ).join('') : '';
        
        html += `
            <div class="conflito-card">
                <div class="conflito-header">
                    <h3>${c.numero || '---'}</h3>
                    <span class="conflito-status">PENDENTE</span>
                </div>
                <div class="conflito-doc">
                    <i class="fa fa-file"></i> ${c.documento || '---'}
                </div>
                <div class="conflito-crcs">
                    ${crcsHtml}
                </div>
                <button class="btn-resolver" onclick="abrirResolver(${c.id}, ${c.linha})">
                    <i class="fa fa-bolt"></i> Resolver Conflito
                </button>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function renderizarRankingSidebar(dados) {
    const container = document.getElementById('rankingCRCs');
    if (!container || !dados || !dados.crcs) return;
    
    const sorted = Object.entries(dados.crcs).sort((a, b) => b[1].vitorias - a[1].vitorias);
    
    let html = '';
    for (let i = 0; i < Math.min(10, sorted.length); i++) {
        const [crc, info] = sorted[i];
        html += `
            <div class="ranking-item">
                <div class="ranking-left">
                    <span class="ranking-pos">${i + 1}</span>
                    <span class="crc">${crc}</span>
                </div>
                <span class="ranking-vitorias">${info.vitorias} vitórias</span>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// ===== FILTROS =====
window.filtroCRCatual = 'todos';

window.filtrarCRC = function(crc, elemento) {
    window.filtroCRCatual = crc;
    
    document.querySelectorAll('.filtro-item').forEach(item => {
        item.classList.remove('active');
    });
    if (elemento) elemento.classList.add('active');
    
    if (window.dadosAtuais) {
        renderizarConflitos(window.dadosAtuais);
    }
};

// Expõe funções globalmente
window.renderizarDashboard = renderizarDashboard;