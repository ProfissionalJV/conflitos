// ===== RENDERIZAÇÃO DA ABA UPLOAD =====
function renderizarUpload(dados) {
    console.log('Renderizando Upload');
    
    const leftContent = document.getElementById('left-content');
    const rightContent = document.getElementById('right-content');
    
    if (!leftContent) return;
    
    // Limpa o conteúdo
    leftContent.innerHTML = '';
    if (rightContent) rightContent.innerHTML = '';
    
    leftContent.innerHTML = `
        <div class="section-header">
            <i class="fa fa-upload"></i>
            <h2>Upload de Planilha</h2>
        </div>

        <div style="background: rgba(0,0,0,0.2); backdrop-filter: blur(15px); border-radius: 15px; padding: 30px; max-width: 800px;">
            <!-- Área de Upload -->
            <div style="margin-bottom: 40px;">
                <h3 style="color: white; margin-bottom: 20px;">
                    <i class="fa fa-cloud-upload-alt" style="color: #81c784; margin-right: 10px;"></i>
                    Enviar Nova Planilha
                </h3>
                
                <div style="border: 3px dashed rgba(255,255,255,0.3); border-radius: 20px; padding: 50px; text-align: center; 
                            background: rgba(255,255,255,0.05); cursor: pointer; transition: 0.3s ease;"
                     id="dropZone"
                     ondragover="event.preventDefault()"
                     ondrop="handleDrop(event)"
                     onclick="document.getElementById('fileInput').click()">
                    
                    <i class="fa fa-cloud-upload-alt" style="font-size: 5rem; color: #81c784; margin-bottom: 20px;"></i>
                    
                    <h4 style="color: white; margin-bottom: 10px;">Arraste sua planilha aqui</h4>
                    <p style="color: rgba(255,255,255,0.5); margin-bottom: 20px;">ou clique para selecionar</p>
                    
                    <input type="file" id="fileInput" accept=".xlsx,.xls" style="display: none;" onchange="handleFileSelect(this)">
                    
                    <button class="btn btn-success" style="width: auto; padding: 12px 30px;">
                        <i class="fa fa-folder-open"></i> Selecionar Arquivo
                    </button>
                </div>
                
                <!-- Barra de progresso -->
                <div id="uploadStatus" style="display: none; margin-top: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="color: white;">Enviando...</span>
                        <span style="color: white;" id="uploadPercent">0%</span>
                    </div>
                    <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden;">
                        <div id="uploadProgress" style="width: 0%; height: 100%; background: #4caf50; transition: 0.3s ease;"></div>
                    </div>
                </div>
            </div>

            <!-- Lista de Planilhas -->
            <div>
                <h3 style="color: white; margin-bottom: 20px;">
                    <i class="fa fa-list" style="color: #81c784; margin-right: 10px;"></i>
                    Planilhas Disponíveis
                </h3>
                
                <div id="listaPlanilhas" style="background: rgba(0,0,0,0.2); border-radius: 10px; padding: 20px;">
                    <div style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">
                        <i class="fa fa-spinner fa-spin" style="font-size: 2rem;"></i>
                        <p>Carregando...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (rightContent) {
        rightContent.innerHTML = `
            <div class="ranking-sidebar">
                <div class="section-header">
                    <i class="fa fa-info-circle"></i>
                    <h2>Informações</h2>
                </div>
                <div style="color: white; padding: 15px;">
                    <p><i class="fa fa-file-excel" style="color: #81c784;"></i> <strong>Formatos:</strong> .xlsx, .xls</p>
                    <p><i class="fa fa-weight-hanging" style="color: #81c784;"></i> <strong>Tamanho max:</strong> 16MB</p>
                    <p><i class="fa fa-clock" style="color: #81c784;"></i> <strong>Atualização:</strong> Imediata</p>
                </div>
                <div id="planilhaAtualInfo" style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                    <p style="color: white; margin-bottom: 5px;">Planilha atual:</p>
                    <p style="color: #81c784; font-weight: 600;" id="planilhaAtualNome">Carregando...</p>
                </div>
            </div>
        `;
    }
    
    // Carrega a lista de planilhas
    carregarListaPlanilhas();
    carregarPlanilhaAtual();
}

async function carregarListaPlanilhas() {
    try {
        const response = await fetch('/api/planilhas');
        const data = await response.json();
        
        const container = document.getElementById('listaPlanilhas');
        if (!container) return;
        
        if (data.planilhas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: rgba(255,255,255,0.5); padding: 40px;">
                    <i class="fa fa-folder-open" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>Nenhuma planilha encontrada</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        for (const planilha of data.planilhas) {
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; 
                            background: ${planilha.ativa ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.05)'}; 
                            border-radius: 10px; margin-bottom: 10px; border: ${planilha.ativa ? '1px solid #4caf50' : '1px solid rgba(255,255,255,0.1)'};">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <i class="fa fa-file-excel" style="font-size: 2rem; color: ${planilha.ativa ? '#4caf50' : '#81c784'};"></i>
                        <div>
                            <div style="color: white; font-weight: 500;">${planilha.nome}</div>
                            <div style="color: rgba(255,255,255,0.5); font-size: 0.9rem;">
                                <span>${planilha.data}</span> • <span>${planilha.tamanho}</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        ${!planilha.ativa ? `
                            <button class="btn btn-success btn-sm" onclick="selecionarPlanilha('${planilha.nome}')">
                                <i class="fa fa-check"></i> Usar
                            </button>
                        ` : `
                            <span style="background: #4caf50; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem;">
                                <i class="fa fa-check"></i> Ativa
                            </span>
                        `}
                        <button class="btn btn-danger btn-sm" onclick="apagarPlanilha('${planilha.nome}')">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function carregarPlanilhaAtual() {
    try {
        const response = await fetch('/api/planilha-atual');
        const data = await response.json();
        
        const elemento = document.getElementById('planilhaAtualNome');
        if (elemento) {
            elemento.textContent = data.planilha || 'Nenhuma';
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function handleFileSelect(input) {
    if (input.files && input.files[0]) {
        await uploadArquivo(input.files[0]);
    }
}

async function handleDrop(event) {
    event.preventDefault();
    const dropZone = document.getElementById('dropZone');
    dropZone.style.background = 'rgba(255,255,255,0.05)';
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        await uploadArquivo(event.dataTransfer.files[0]);
    }
}

async function uploadArquivo(file) {
    // Valida extensão
    const extensao = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(extensao)) {
        alert('Apenas arquivos .xlsx ou .xls são permitidos!');
        return;
    }
    
    // Mostra barra de progresso
    const uploadStatus = document.getElementById('uploadStatus');
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadPercent = document.getElementById('uploadPercent');
    
    uploadStatus.style.display = 'block';
    uploadProgress.style.width = '0%';
    uploadPercent.textContent = '0%';
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            uploadProgress.style.width = '100%';
            uploadPercent.textContent = '100%';
            
            setTimeout(() => {
                uploadStatus.style.display = 'none';
                alert('✅ Planilha carregada com sucesso!');
                carregarListaPlanilhas();
                carregarPlanilhaAtual();
                carregarDados(); // Recarrega os dados do sistema
            }, 500);
        } else {
            alert('❌ Erro: ' + result.erro);
            uploadStatus.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao enviar arquivo: ' + error.message);
        uploadStatus.style.display = 'none';
    }
}

async function selecionarPlanilha(nome) {
    if (!confirm(`Deseja usar a planilha ${nome}?`)) return;
    
    try {
        const response = await fetch('/api/selecionar-planilha', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({arquivo: nome})
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            alert('✅ ' + result.mensagem);
            carregarListaPlanilhas();
            carregarPlanilhaAtual();
            carregarDados(); // Recarrega os dados
        } else {
            alert('❌ Erro: ' + result.erro);
        }
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro: ' + error.message);
    }
}

async function apagarPlanilha(nome) {
    if (!confirm(`Tem certeza que deseja apagar a planilha ${nome}?`)) return;
    
    try {
        const response = await fetch('/api/apagar-planilha', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({arquivo: nome})
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            alert('✅ Planilha apagada com sucesso!');
            
            // Verifica se a planilha apagada era a ativa
            const planilhaAtualElement = document.getElementById('planilhaAtualNome');
            if (planilhaAtualElement && planilhaAtualElement.textContent === nome) {
                // Se era a ativa, limpa os dados do dashboard
                planilhaAtualElement.textContent = 'Nenhuma';
            }
            
            carregarListaPlanilhas(); // Recarrega a lista
            
            // FORÇA O RECARREGAMENTO DOS DADOS
            await carregarDados();
            
            // Volta para o dashboard automaticamente
            setTimeout(() => {
                const botoes = document.querySelectorAll('#sidebar-btn');
                for (let btn of botoes) {
                    if (btn.textContent.includes('Dashboard')) {
                        mudarAba('dashboard', btn);
                        break;
                    }
                }
            }, 500);
            
        } else {
            alert('❌ Erro: ' + result.erro);
        }
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao apagar planilha: ' + error.message);
    }
}

// Adiciona evento de drag & drop
document.addEventListener('dragover', function(e) {
    e.preventDefault();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.style.background = 'rgba(76, 175, 80, 0.1)';
        dropZone.style.borderColor = '#4caf50';
    }
});

document.addEventListener('dragleave', function(e) {
    e.preventDefault();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.style.background = 'rgba(255,255,255,0.05)';
        dropZone.style.borderColor = 'rgba(255,255,255,0.3)';
    }
});

// Expõe funções globalmente
window.renderizarUpload = renderizarUpload;
window.handleFileSelect = handleFileSelect;
window.handleDrop = handleDrop;
window.selecionarPlanilha = selecionarPlanilha;
window.apagarPlanilha = apagarPlanilha;