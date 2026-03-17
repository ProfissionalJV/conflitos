function renderizarRanking(dados) {
    console.log('Renderizando Ranking');
    
    const leftContent = document.getElementById('left-content');
    if (!leftContent) return;
    
    const sorted = Object.entries(dados.crcs).sort((a, b) => b[1].vitorias - a[1].vitorias);
    
    leftContent.innerHTML = `
        <div class="section-header">
            <i class="fa fa-trophy"></i>
            <h2>Ranking Completo de CRCs</h2>
        </div>

        <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 30px;">
            ${sorted.slice(0, 3).map(([crc, info], index) => `
                <div class="stats-card" style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">${index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</div>
                    <h3 style="font-size: 1.5rem; margin-bottom: 5px;">${crc}</h3>
                    <div style="font-size: 1.2rem; color: #4caf50;">${info.vitorias} vitórias</div>
                </div>
            `).join('')}
        </div>

        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px;">
            <table style="width: 100%; border-collapse: collapse; color: white;">
                <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
                        <th style="text-align: left; padding: 12px;">Posição</th>
                        <th style="text-align: left; padding: 12px;">CRC</th>
                        <th style="text-align: left; padding: 12px;">Localidade</th>
                        <th style="text-align: left; padding: 12px;">Distância</th>
                        <th style="text-align: left; padding: 12px;">Vitórias</th>
                        <th style="text-align: left; padding: 12px;">Derrotas</th>
                        <th style="text-align: left; padding: 12px;">Aproveitamento</th>
                    </tr>
                </thead>
                <tbody>
                    ${sorted.map(([crc, info], index) => {
                        const total = info.vitorias + info.derrotas;
                        const aproveitamento = total > 0 ? ((info.vitorias / total) * 100).toFixed(1) : 0;
                        return `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                                <td style="padding: 12px;"><strong>#${index + 1}</strong></td>
                                <td style="padding: 12px;">${crc}</td>
                                <td style="padding: 12px;">${info.localidade}</td>
                                <td style="padding: 12px;">${info.distancia} km</td>
                                <td style="padding: 12px;"><span style="background: #4caf50; padding: 4px 12px; border-radius: 20px;">${info.vitorias}</span></td>
                                <td style="padding: 12px;"><span style="background: #f57c00; padding: 4px 12px; border-radius: 20px;">${info.derrotas}</span></td>
                                <td style="padding: 12px;">${aproveitamento}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

window.renderizarRanking = renderizarRanking;