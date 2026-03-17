function renderizarSistema(dados) {
    console.log('Renderizando Sistema');
    
    const leftContent = document.getElementById('left-content');
    if (!leftContent) return;
    
    leftContent.innerHTML = `
        <div class="section-header">
            <i class="fa fa-gear"></i>
            <h2>Configurações do Sistema</h2>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 30px;">
                <h3 style="color: white; margin-bottom: 20px;">Critérios de Desempate</h3>
                
                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 15px; margin-bottom: 30px;">
                    <p style="color: white; margin-bottom: 10px;">1º - Menos vitórias em conflitos anteriores</p>
                    <p style="color: white;">2º - Menor distância (localidade)</p>
                </div>
                
                <h3 style="color: white; margin-bottom: 20px;">Estatísticas</h3>
                
                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 15px;">
                    <p style="color: white; margin-bottom: 10px;">Total de CRCs: <strong>${Object.keys(dados.crcs).length}</strong></p>
                    <p style="color: white; margin-bottom: 10px;">Total de conflitos: <strong>${dados.conflitos.length}</strong></p>
                    <p style="color: white;">Resolvidos: <strong>${dados.conflitos.filter(c => c.status_atual === 'RESOLVIDO').length}</strong></p>
                </div>
            </div>

            <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 30px;">
                <h3 style="color: white; margin-bottom: 20px;">Backup e Restauração</h3>
                
                <div style="margin-bottom: 30px;">
                    <button class="btn btn-success" style="width: 100%; margin-bottom: 10px;" onclick="exportarBackup()">
                        <i class="fa fa-download"></i> Baixar Backup
                    </button>
                    <button class="btn btn-warning" style="width: 100%;" onclick="alert('Funcionalidade em desenvolvimento')">
                        <i class="fa fa-upload"></i> Restaurar Backup
                    </button>
                </div>
                
                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 15px;">
                    <p style="color: white; margin-bottom: 5px;">Último backup:</p>
                    <p style="color: #4caf50; font-size: 1.2rem;">${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    `;
}

function exportarBackup() {
    if (!dadosAtuais) return;
    
    const dadosBackup = {
        data: new Date().toISOString(),
        versao: '1.0.0',
        crcs: dadosAtuais.crcs,
        conflitos: dadosAtuais.conflitos
    };
    
    const blob = new Blob([JSON.stringify(dadosBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-conflitos-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

window.renderizarSistema = renderizarSistema;
window.exportarBackup = exportarBackup;