function renderizarConfig(dados) {
    console.log('Renderizando Configurações');
    
    const leftContent = document.getElementById('left-content');
    if (!leftContent) return;
    
    leftContent.innerHTML = `
        <div class="section-header">
            <i class="fa fa-sliders"></i>
            <h2>Configurações dos CRCs</h2>
        </div>

        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; color: white; min-width: 800px;">
                <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
                        <th style="text-align: left; padding: 12px;">CRC</th>
                        <th style="text-align: left; padding: 12px;">Localidade</th>
                        <th style="text-align: left; padding: 12px;">Distância (km)</th>
                        <th style="text-align: left; padding: 12px;">Vitórias</th>
                        <th style="text-align: left; padding: 12px;">Derrotas</th>
                        <th style="text-align: left; padding: 12px;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(dados.crcs).map(([crc, info]) => `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <td style="padding: 12px;"><strong>${crc}</strong></td>
                            <td style="padding: 12px;">
                                <select id="localidade-${crc}" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 5px; border-radius: 5px;">
                                    <option value="Norte" ${info.localidade === 'Norte' ? 'selected' : ''}>Norte</option>
                                    <option value="Nordeste" ${info.localidade === 'Nordeste' ? 'selected' : ''}>Nordeste</option>
                                    <option value="Centro-Oeste" ${info.localidade === 'Centro-Oeste' ? 'selected' : ''}>Centro-Oeste</option>
                                    <option value="Sudeste" ${info.localidade === 'Sudeste' ? 'selected' : ''}>Sudeste</option>
                                    <option value="Sul" ${info.localidade === 'Sul' ? 'selected' : ''}>Sul</option>
                                </select>
                            </td>
                            <td style="padding: 12px;">
                                <input type="number" id="distancia-${crc}" value="${info.distancia}" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 5px; width: 80px; border-radius: 5px;">
                            </td>
                            <td style="padding: 12px;"><span style="background: #4caf50; padding: 4px 12px; border-radius: 20px;">${info.vitorias}</span></td>
                            <td style="padding: 12px;"><span style="background: #f57c00; padding: 4px 12px; border-radius: 20px;">${info.derrotas}</span></td>
                            <td style="padding: 12px;">
                                <button onclick="salvarConfigCRC('${crc}')" style="background: #4caf50; color: white; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer;">
                                    <i class="fa fa-save"></i> Salvar
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function salvarConfigCRC(crc) {
    const localidade = document.getElementById(`localidade-${crc}`)?.value;
    const distancia = document.getElementById(`distancia-${crc}`)?.value;
    
    if (!localidade || !distancia) return;
    
    mostrarLoading(true);
    
    try {
        const response = await fetch('/api/config/crcs', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                crc: crc,
                localidade: localidade,
                distancia: parseInt(distancia)
            })
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            alert('✅ Configurações salvas!');
            carregarDados();
        } else {
            alert('❌ Erro: ' + (result.erro || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro: ' + error.message);
    }
    
    mostrarLoading(false);
}

window.renderizarConfig = renderizarConfig;
window.salvarConfigCRC = salvarConfigCRC;