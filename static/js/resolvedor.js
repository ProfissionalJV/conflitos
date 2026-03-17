// ===== VARIÁVEIS DO RESOLVEDOR =====
let conflitoSelecionado = null;
let analiseAtual = null;

// ===== FUNÇÕES DE RESOLUÇÃO =====
async function abrirResolver(id, linha) {
    console.log('abrirResolver chamado', id, linha);
    mostrarLoading(true);
    
    try {
        const conflito = dadosAtuais.conflitos.find(c => c.id === id);
        if (!conflito) throw new Error('Conflito não encontrado');
        
        const response = await fetch('/api/analisar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({interessados: conflito.interessados})
        });
        
        analiseAtual = await response.json();
        
        document.getElementById('detalhesConflito').innerHTML = `
            <strong>Processo:</strong> ${conflito.numero}<br>
            <strong>Documento:</strong> ${conflito.documento}<br>
            <strong>Interessados:</strong> ${conflito.interessados.join(', ')}
        `;
        
        let analiseHtml = '<div style="max-height: 300px; overflow-y: auto;">';
        for (const item of analiseAtual.analise) {
            analiseHtml += `
                <div class="analise-item" onclick="selecionarVencedor('${item.crc}')" id="item-${item.crc}">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                        <div><strong>${item.crc}</strong></div>
                        <div>📍 ${item.distancia}km</div>
                        <div>🏆 ${item.vitorias}V / 😞 ${item.derrotas}D</div>
                    </div>
                </div>
            `;
        }
        analiseHtml += '</div>';
        
        document.getElementById('listaAnalise').innerHTML = analiseHtml;
        document.getElementById('sugestaoTexto').innerHTML = 
            `Baseado nos critérios, o CRC <strong>${analiseAtual.sugestao}</strong> deveria ganhar.`;
        
        let botoesHtml = '<div class="vencedor-buttons">';
        for (const crc of conflito.interessados) {
            botoesHtml += `<button onclick="selecionarVencedor('${crc}')">${crc}</button>`;
        }
        botoesHtml += '</div>';
        document.getElementById('botoesVencedor').innerHTML = botoesHtml;
        
        conflitoSelecionado = { id, linha, interessados: conflito.interessados };
        
        setTimeout(() => selecionarVencedor(analiseAtual.sugestao), 100);
        
        document.getElementById('modalResolver').classList.add('show');
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro: ' + error.message);
    }
    
    mostrarLoading(false);
}

function selecionarVencedor(crc) {
    document.querySelectorAll('.analise-item').forEach(el => el.classList.remove('selecionado'));
    const item = document.getElementById(`item-${crc}`);
    if (item) item.classList.add('selecionado');
    
    conflitoSelecionado.vencedor = crc;
    conflitoSelecionado.perdedores = conflitoSelecionado.interessados.filter(c => c !== crc);
}

function aplicarSugestao() {
    if (analiseAtual?.sugestao) selecionarVencedor(analiseAtual.sugestao);
}

async function confirmarResolucao() {
    if (!conflitoSelecionado?.vencedor) {
        alert('Selecione um vencedor!');
        return;
    }
    
    mostrarLoading(true);
    
    try {
        const response = await fetch('/api/resolver', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                linha: conflitoSelecionado.linha,
                vencedor: conflitoSelecionado.vencedor,
                perdedores: conflitoSelecionado.perdedores
            })
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            alert('✅ ' + result.mensagem);
            fecharModal('resolver');
            
            // ATUALIZA OS DADOS LOCAIS IMEDIATAMENTE
            const conflitoIndex = dadosAtuais.conflitos.findIndex(c => c.id === conflitoSelecionado.id);
            if (conflitoIndex !== -1) {
                dadosAtuais.conflitos[conflitoIndex].status_atual = 'RESOLVIDO';
                dadosAtuais.conflitos[conflitoIndex].vencedor_atual = conflitoSelecionado.vencedor;
                
                // Atualiza estatísticas dos CRCs
                dadosAtuais.crcs[conflitoSelecionado.vencedor].vitorias += 1;
                conflitoSelecionado.perdedores.forEach(crc => {
                    dadosAtuais.crcs[crc].derrotas += 1;
                });
            }
            
            // Recarrega os dados do servidor para garantir consistência
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

async function resolverTodos() {
    if (!confirm('Resolver todos os conflitos automaticamente?')) return;
    
    mostrarLoading(true);
    
    try {
        const response = await fetch('/api/resolver/todos', { method: 'POST' });
        const result = await response.json();
        
        if (result.sucesso) {
            alert(`✅ ${result.total} conflitos resolvidos!`);
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

// ===== CONFIGURAÇÕES DE CRC =====
function abrirConfigCRC(crc) {
    const info = dadosAtuais.crcs[crc];
    
    document.getElementById('configCRCBody').innerHTML = `
        <input type="hidden" id="configCRC" value="${crc}">
        <div style="margin-bottom: 15px;">
            <label style="color: white; display: block; margin-bottom: 5px;">Localidade:</label>
            <input type="text" class="form-control" id="modalLocalidade" value="${info.localidade}" style="width: 100%; padding: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 5px;">
        </div>
        <div style="margin-bottom: 15px;">
            <label style="color: white; display: block; margin-bottom: 5px;">Distância (km):</label>
            <input type="number" class="form-control" id="modalDistancia" value="${info.distancia}" style="width: 100%; padding: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 5px;">
        </div>
    `;
    
    document.getElementById('modalConfig').classList.add('show');
}

async function salvarConfigModal() {
    const crc = document.getElementById('configCRC').value;
    const localidade = document.getElementById('modalLocalidade').value;
    const distancia = document.getElementById('modalDistancia').value;
    
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
            fecharModal('config');
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

// Expõe funções globalmente
window.abrirResolver = abrirResolver;
window.selecionarVencedor = selecionarVencedor;
window.aplicarSugestao = aplicarSugestao;
window.confirmarResolucao = confirmarResolucao;
window.resolverTodos = resolverTodos;
window.abrirConfigCRC = abrirConfigCRC;
window.salvarConfigModal = salvarConfigModal;