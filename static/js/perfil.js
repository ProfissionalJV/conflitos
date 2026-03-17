function renderizarPerfil(dados) {
    console.log('Renderizando Perfil');
    
    const leftContent = document.getElementById('left-content');
    if (!leftContent) return;
    
    leftContent.innerHTML = `
        <div class="section-header">
            <i class="fa fa-user"></i>
            <h2>Perfil do Usuário</h2>
        </div>

        <div style="display: grid; grid-template-columns: 300px 1fr; gap: 30px;">
            <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; text-align: center;">
                <img src="https://ui-avatars.com/api/?name=Admin+CRC&background=2e7d32&color=fff&size=128" style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 20px;">
                <h3 style="color: white; margin-bottom: 5px;">Rique Careca</h3>
                <p style="color: rgba(255,255,255,0.7); margin-bottom: 20px;">Carequinha</p>
                <button class="btn btn-success" style="width: 100%;" onclick="alert('Funcionalidade em desenvolvimento')">
                    <i class="fa fa-edit"></i> Editar Perfil
                </button>
            </div>

            <div style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 30px;">
                <h3 style="color: white; margin-bottom: 20px;">Informações da Conta</h3>
                
                <div style="margin-bottom: 20px;">
                    <label style="color: rgba(255,255,255,0.7); display: block; margin-bottom: 5px;">Nome completo</label>
                    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; color: white;">
                        Henrique Careca
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="color: rgba(255,255,255,0.7); display: block; margin-bottom: 5px;">E-mail</label>
                    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; color: white;">
                        carequinha@desfazimento.com
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="color: rgba(255,255,255,0.7); display: block; margin-bottom: 5px;">Cargo</label>
                    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; color: white;">
                        Resolvedor de B.o
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="color: rgba(255,255,255,0.7); display: block; margin-bottom: 5px;">Último acesso</label>
                    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; color: white;">
                        ${new Date().toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.renderizarPerfil = renderizarPerfil;