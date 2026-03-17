function renderizarHistorico(dados) {
    console.log('Renderizando Histórico');
    
    const leftContent = document.getElementById('left-content');
    if (!leftContent) return;
    
    // PRECISAMOS ACESSAR OS DADOS COMPLETOS, NÃO SÓ OS CONFLITOS ATIVOS
    // Vamos fazer uma requisição específica para o histórico
    carregarHistoricoCompleto();
}

async function carregarHistoricoCompleto() {
    mostrarLoading(true);
    
    try {
        // Faz uma requisição especial para o backend buscar TODOS os conflitos
        const response = await fetch('/api/historico');
        const data = await response.json();
        
        renderizarTabelaHistorico(data);
        
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        alert('Erro ao carregar histórico: ' + error.message);
    }
    
    mostrarLoading(false);
}

function renderizarTabelaHistorico(dados) {
    const leftContent = document.getElementById('left-content');
    if (!leftContent) return;
    
    const resolvidos = dados.conflitos || [];
    
    leftContent.innerHTML = `
        <div class="section-header">
            <i class="fa fa-clock"></i>
            <h2>Histórico de Resoluções</h2>
        </div>

        <!-- Card de resumo -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">
            <div style="background: rgba(0,0,0,0.2); backdrop-filter: blur(10px); border-radius: 12px; padding: 15px; text-align: center;">
                <div style="font-size: 2rem; color: #81c784; margin-bottom: 5px;">${resolvidos.length}</div>
                <div style="color: rgba(255,255,255,0.7);">Total Resolvidos</div>
            </div>
            <div style="background: rgba(0,0,0,0.2); backdrop-filter: blur(10px); border-radius: 12px; padding: 15px; text-align: center;">
                <div style="font-size: 2rem; color: #81c784; margin-bottom: 5px;">${calcularTopVencedor(resolvidos)}</div>
                <div style="color: rgba(255,255,255,0.7);">Mais Vitórias</div>
            </div>
            <div style="background: rgba(0,0,0,0.2); backdrop-filter: blur(10px); border-radius: 12px; padding: 15px; text-align: center;">
                <div style="font-size: 2rem; color: #81c784; margin-bottom: 5px;">${resolvidos.length}</div>
                <div style="color: rgba(255,255,255,0.7);">Registros</div>
            </div>
        </div>

        <div style="background: rgba(0,0,0,0.2); backdrop-filter: blur(15px); border-radius: 15px; padding: 20px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; color: white; min-width: 800px;">
                <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
                        <th style="text-align: left; padding: 15px;">#</th>
                        <th style="text-align: left; padding: 15px;">Processo</th>
                        <th style="text-align: left; padding: 15px;">Documento</th>
                        <th style="text-align: left; padding: 15px;">Vencedor</th>
                        <th style="text-align: left; padding: 15px;">Perdedores</th>
                        <th style="text-align: left; padding: 15px;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${resolvidos.map((c, index) => `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); transition: 0.2s ease;">
                            <td style="padding: 15px;">${index + 1}</td>
                            <td style="padding: 15px;">${c.numero || '---'}</td>
                            <td style="padding: 15px;">${c.documento || '---'}</td>
                            <td style="padding: 15px;">
                                <span style="background: #2e7d32; padding: 5px 15px; border-radius: 20px; color: white; font-weight: 500;">
                                    <i class="fa fa-trophy" style="margin-right: 5px;"></i> ${c.vencedor_atual}
                                </span>
                            </td>
                            <td style="padding: 15px;">
                                ${c.interessados ? c.interessados.filter(i => i !== c.vencedor_atual).map(perdedor => 
                                    `<span style="background: rgba(255,255,255,0.1); padding: 3px 10px; border-radius: 15px; margin-right: 5px;">${perdedor}</span>`
                                ).join('') : '---'}
                            </td>
                            <td style="padding: 15px;">
                                <span style="background: #2e7d32; padding: 4px 12px; border-radius: 20px; color: white; font-size: 0.9rem;">
                                    Resolvido
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                    ${resolvidos.length === 0 ? `
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 60px; color: rgba(255,255,255,0.5);">
                                <i class="fa fa-clock" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                                Nenhum conflito resolvido ainda
                            </td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
    `;
}

function calcularTopVencedor(resolvidos) {
    const vitorias = {};
    resolvidos.forEach(c => {
        if (c.vencedor_atual) {
            vitorias[c.vencedor_atual] = (vitorias[c.vencedor_atual] || 0) + 1;
        }
    });
    
    let top = {crc: '---', count: 0};
    for (const [crc, count] of Object.entries(vitorias)) {
        if (count > top.count) top = {crc, count};
    }
    return top.crc;
}

window.renderizarHistorico = renderizarHistorico;