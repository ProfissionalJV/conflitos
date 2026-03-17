function renderizarConflitos(dados) {
    console.log('Renderizando Conflitos');
    
    const leftContent = document.getElementById('left-content');
    if (!leftContent) return;
    
    const pendentes = dados.conflitos.filter(c => c.status_atual === 'PENDENTE').length;
    const resolvidos = dados.conflitos.filter(c => c.status_atual === 'RESOLVIDO').length;
    const ignorados = dados.conflitos.filter(c => c.status_atual === 'IGNORADO').length;
    
    leftContent.innerHTML = `
        <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="stats-card">
                <div class="stats-icon pendente">
                    <i class="fa fa-exclamation-triangle"></i>
                </div>
                <div class="stats-info">
                    <h3>Pendentes</h3>
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
                    <i class="fa fa-eye-slash"></i>
                </div>
                <div class="stats-info">
                    <h3>Ignorados</h3>
                    <div class="stats-value">${ignorados}</div>
                </div>
            </div>
        </div>

        <div class="section-header">
            <i class="fa fa-list"></i>
            <h2>Todos os Conflitos</h2>
        </div>

        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; color: white; min-width: 800px;">
                <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
                        <th style="text-align: left; padding: 12px;">ID</th>
                        <th style="text-align: left; padding: 12px;">Processo</th>
                        <th style="text-align: left; padding: 12px;">Documento</th>
                        <th style="text-align: left; padding: 12px;">CRCs</th>
                        <th style="text-align: left; padding: 12px;">Status</th>
                        <th style="text-align: left; padding: 12px;">Vencedor</th>
                        <th style="text-align: left; padding: 12px;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${dados.conflitos.map(c => `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <td style="padding: 12px;">${c.id + 1}</td>
                            <td style="padding: 12px;">${c.numero || '---'}</td>
                            <td style="padding: 12px;">${c.documento || '---'}</td>
                            <td style="padding: 12px;">${c.interessados.join(', ')}</td>
                            <td style="padding: 12px;">
                                <span style="background: ${getStatusColor(c.status_atual)}; padding: 4px 12px; border-radius: 20px; color: white; font-size: 0.8rem;">
                                    ${c.status_atual}
                                </span>
                            </td>
                            <td style="padding: 12px;">${c.vencedor_atual || '---'}</td>
                            <td style="padding: 12px;">
                                <button onclick="abrirResolver(${c.id}, ${c.linha})" style="background: #4caf50; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                                    <i class="fa fa-bolt"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function getStatusColor(status) {
    switch(status) {
        case 'RESOLVIDO': return '#4caf50';
        case 'IGNORADO': return '#9e9e9e';
        default: return '#f57c00';
    }
}

window.renderizarConflitos = renderizarConflitos;