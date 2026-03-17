from flask import Flask, render_template, jsonify, request
import pandas as pd
from datetime import datetime
import os
import json
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configuração de upload
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

# Garante que a pasta de uploads existe
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Variável global para controlar a planilha atual
PLANILHA_ATUAL = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Configuração
CAMINHO_PLANILHA = 'conflitos.xlsx'

# LISTA COMPLETA DOS SEUS CRCs
CRCS = {
    'AMAZONAS': {'localidade': 'Norte', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'FUNPAPI': {'localidade': 'Nordeste', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'IA': {'localidade': 'Sudeste', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'IAPS': {'localidade': 'Sul', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'IBAV': {'localidade': 'Nordeste', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'IFS': {'localidade': 'Nordeste', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'IFMA': {'localidade': 'Nordeste', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'IFMS': {'localidade': 'Centro-Oeste', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'IGH': {'localidade': 'Sudeste', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'INAC': {'localidade': 'Norte', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'ITCD': {'localidade': 'Sudeste', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'NCC BELEM': {'localidade': 'Norte', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'PARANÁ': {'localidade': 'Sul', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'PRODABEL': {'localidade': 'Sudeste', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'PROGRAMANDO': {'localidade': 'Sudeste', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'RECIFE': {'localidade': 'Nordeste', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'UNIFAP': {'localidade': 'Norte', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
    'UNIVASF': {'localidade': 'Nordeste', 'distancia': 0, 'vitorias': 0, 'derrotas': 0},
}

def carregar_dados():
    """Carrega dados da planilha de conflitos"""
    if not os.path.exists(CAMINHO_PLANILHA):
        colunas = ['ID', 'Nº PROCESSO', 'DOCUMENTO'] + list(CRCS.keys()) + ['STATUS', 'VENCEDOR', 'OBSERVAÇÃO']
        df = pd.DataFrame(columns=colunas)
        
        for crc in CRCS.keys():
            df[crc] = df[crc].astype(str)
        
        dados_exemplo = [
            [1, '2024/001', 'DOC-001', 'S', 'S', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'PENDENTE', '', ''],
            [2, '2024/002', 'DOC-002', '', 'S', 'S', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'PENDENTE', '', ''],
        ]
        
        for exemplo in dados_exemplo:
            linha_completa = exemplo[:3] + [''] * len(CRCS) + exemplo[3:]
            df.loc[len(df)] = linha_completa[:len(colunas)]
        
        df.to_excel(CAMINHO_PLANILHA, index=False)
        return df
    
    df = pd.read_excel(CAMINHO_PLANILHA, dtype=str)
    
    for crc in CRCS.keys():
        if crc not in df.columns:
            df[crc] = ''
    
    return df

def salvar_dados(df):
    df.to_excel(CAMINHO_PLANILHA, index=False)

def identificar_conflitos():
    df = carregar_dados()
    colunas_crc = list(CRCS.keys())
    
    for crc in CRCS:
        vitorias = df[df['VENCEDOR'] == crc].shape[0]
        CRCS[crc]['vitorias'] = vitorias
        
        df_resolvidas = df[df['STATUS'] == 'RESOLVIDO']
        derrotas = 0
        for _, row in df_resolvidas.iterrows():
            if row.get(crc) == 'C':
                derrotas += 1
        CRCS[crc]['derrotas'] = derrotas
    
    conflitos = []
    for idx, row in df.iterrows():
        status = row.get('STATUS', '')
        if pd.isna(status):
            status = 'PENDENTE'
        
        if status != 'RESOLVIDO' and status != 'IGNORADO':
            interessados = []
            for crc in colunas_crc:
                valor = row.get(crc, '')
                if pd.isna(valor):
                    valor = ''
                else:
                    valor = str(valor).strip()
                
                if valor == 'S':
                    interessados.append(crc)
            
            if len(interessados) > 1:
                conflitos.append({
                    'id': idx,
                    'numero': str(row.get('Nº PROCESSO', '')),
                    'documento': str(row.get('DOCUMENTO', '')),
                    'interessados': interessados,
                    'linha': idx + 2,
                    'status_atual': status,
                    'vencedor_atual': str(row.get('VENCEDOR', '')) if pd.notna(row.get('VENCEDOR', '')) else ''
                })
    
    return conflitos, colunas_crc

@app.route('/')
def index():
    return render_template('dashboard.html')

@app.route('/api/dados')
def get_dados():
    conflitos, colunas_crc = identificar_conflitos()
    
    return jsonify({
        'conflitos': conflitos,
        'total_conflitos': len(conflitos),
        'crcs': CRCS,
        'colunas_crc': list(colunas_crc)
    })

@app.route('/api/analisar', methods=['POST'])
def analisar():
    dados = request.json
    interessados = dados.get('interessados', [])
    
    if not interessados:
        return jsonify({'erro': 'Lista de interessados vazia'}), 400
    
    sugestao = aplicar_criterios(interessados)
    
    analise = []
    for crc in interessados:
        if crc in CRCS:
            analise.append({
                'crc': crc,
                'distancia': CRCS[crc]['distancia'],
                'vitorias': CRCS[crc]['vitorias'],
                'derrotas': CRCS[crc]['derrotas'],
                'localidade': CRCS[crc]['localidade']
            })
    
    analise_ordenada = sorted(analise, key=lambda x: (x['vitorias'], x['distancia']))
    
    return jsonify({
        'sugestao': sugestao,
        'analise': analise_ordenada,
        'criterios': {
            '1º': 'Menos vitórias em conflitos anteriores',
            '2º': 'Menor distância (localidade)'
        }
    })

@app.route('/api/resolver', methods=['POST'])
def resolver():
    dados = request.json
    linha = dados.get('linha')
    vencedor = dados.get('vencedor')
    perdedores = dados.get('perdedores', [])
    
    try:
        df = carregar_dados()
        idx = linha - 2
        
        df.loc[idx, 'STATUS'] = 'RESOLVIDO'
        df.loc[idx, 'VENCEDOR'] = vencedor
        
        for crc in perdedores:
            if crc in df.columns:
                df.loc[idx, crc] = 'C'
        
        if vencedor in df.columns:
            df.loc[idx, vencedor] = 'S (Vencedor)'
        
        salvar_dados(df)
        
        return jsonify({
            'sucesso': True,
            'vencedor': vencedor,
            'mensagem': f'Conflito resolvido! Vencedor: {vencedor}'
        })
    except Exception as e:
        return jsonify({
            'sucesso': False,
            'erro': str(e)
        }), 500

@app.route('/api/resolver/todos', methods=['POST'])
def resolver_todos():
    try:
        df = carregar_dados()
        conflitos, colunas_crc = identificar_conflitos()
        resolvidos = 0
        
        for conflito in conflitos:
            vencedor = aplicar_criterios(conflito['interessados'])
            idx = conflito['linha'] - 2
            
            df.loc[idx, 'STATUS'] = 'RESOLVIDO'
            df.loc[idx, 'VENCEDOR'] = vencedor
            
            for crc in conflito['interessados']:
                if crc in df.columns:
                    if crc == vencedor:
                        df.loc[idx, crc] = 'S (Vencedor)'
                    else:
                        df.loc[idx, crc] = 'C'
            resolvidos += 1
        
        salvar_dados(df)
        
        return jsonify({
            'sucesso': True,
            'total': resolvidos,
            'mensagem': f'{resolvidos} conflitos resolvidos com sucesso!'
        })
    except Exception as e:
        return jsonify({
            'sucesso': False,
            'erro': str(e)
        }), 500

@app.route('/api/atualizar_interesse', methods=['POST'])
def atualizar_interesse():
    dados = request.json
    linha = dados.get('linha')
    crc = dados.get('crc')
    novo_valor = dados.get('valor')
    
    try:
        df = carregar_dados()
        idx = linha - 2
        
        if crc in df.columns:
            df.loc[idx, crc] = novo_valor
            df.loc[idx, 'STATUS'] = 'PENDENTE'
            df.loc[idx, 'VENCEDOR'] = ''
            
            salvar_dados(df)
            
            return jsonify({'sucesso': True})
        
        return jsonify({'sucesso': False, 'erro': 'CRC não encontrado'}), 404
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': str(e)}), 500

@app.route('/api/ignorar_conflito', methods=['POST'])
def ignorar_conflito():
    dados = request.json
    linha = dados.get('linha')
    
    try:
        df = carregar_dados()
        idx = linha - 2
        df.loc[idx, 'STATUS'] = 'IGNORADO'
        salvar_dados(df)
        
        return jsonify({'sucesso': True})
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': str(e)}), 500

@app.route('/api/reabrir_conflito', methods=['POST'])
def reabrir_conflito():
    dados = request.json
    linha = dados.get('linha')
    
    try:
        df = carregar_dados()
        idx = linha - 2
        df.loc[idx, 'STATUS'] = 'PENDENTE'
        df.loc[idx, 'VENCEDOR'] = ''
        salvar_dados(df)
        
        return jsonify({'sucesso': True})
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': str(e)}), 500

@app.route('/api/config/crcs', methods=['POST'])
def configurar_crc():
    dados = request.json
    crc = dados.get('crc')
    
    if crc in CRCS:
        CRCS[crc]['distancia'] = dados.get('distancia', CRCS[crc]['distancia'])
        CRCS[crc]['localidade'] = dados.get('localidade', CRCS[crc]['localidade'])
        
        with open('crc_config.json', 'w') as f:
            json.dump(CRCS, f, indent=2, ensure_ascii=False)
        
        return jsonify({'sucesso': True})
    
    return jsonify({'sucesso': False, 'erro': 'CRC não encontrado'}), 404

@app.route('/api/config/crcs', methods=['GET'])
def get_config_crcs():
    try:
        with open('crc_config.json', 'r', encoding='utf-8') as f:
            config = json.load(f)
            for crc in config:
                if crc in CRCS:
                    CRCS[crc]['distancia'] = config[crc]['distancia']
                    CRCS[crc]['localidade'] = config[crc]['localidade']
        return jsonify(CRCS)
    except FileNotFoundError:
        return jsonify(CRCS)

# ===== ROTA PARA HISTÓRICO =====
@app.route('/api/historico')
def get_historico():
    """Retorna todos os conflitos resolvidos para o histórico"""
    try:
        df = carregar_dados()
        colunas_crc = list(CRCS.keys())
        
        historico = []
        for idx, row in df.iterrows():
            status = row.get('STATUS', '')
            if pd.isna(status):
                status = 'PENDENTE'
            
            # Pega todos os conflitos resolvidos
            if status == 'RESOLVIDO':
                interessados = []
                for crc in colunas_crc:
                    valor = row.get(crc, '')
                    if pd.isna(valor):
                        valor = ''
                    else:
                        valor = str(valor).strip()
                    
                    if valor in ['S', 'S (Vencedor)', 'C']:
                        interessados.append(crc)
                
                historico.append({
                    'id': idx,
                    'numero': str(row.get('Nº PROCESSO', '')),
                    'documento': str(row.get('DOCUMENTO', '')),
                    'interessados': interessados,
                    'status_atual': status,
                    'vencedor_atual': str(row.get('VENCEDOR', '')) if pd.notna(row.get('VENCEDOR', '')) else ''
                })
        
        return jsonify({
            'conflitos': historico,
            'total': len(historico)
        })
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

def aplicar_criterios(interessados):
    if not interessados:
        return None
    
    por_vitorias = sorted(interessados, key=lambda x: CRCS[x]['vitorias'])
    menos_vitorias = CRCS[por_vitorias[0]]['vitorias']
    
    criterio1 = [c for c in interessados if CRCS[c]['vitorias'] == menos_vitorias]
    
    if len(criterio1) == 1:
        return criterio1[0]
    
    return sorted(criterio1, key=lambda x: CRCS[x]['distancia'])[0]

# ===== ROTAS DE UPLOAD =====
@app.route('/api/upload', methods=['POST'])
def upload_planilha():
    """Faz upload de uma nova planilha"""
    try:
        if 'file' not in request.files:
            return jsonify({'erro': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'erro': 'Nome de arquivo vazio'}), 400
        
        if file and allowed_file(file.filename):
            # Gera nome único com timestamp
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"planilha_{timestamp}.xlsx"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Salva o arquivo
            file.save(filepath)
            
            # Atualiza a planilha atual
            global PLANILHA_ATUAL, CAMINHO_PLANILHA
            PLANILHA_ATUAL = filename
            CAMINHO_PLANILHA = filepath
            
            # FORÇA O RECARREGAMENTO DOS DADOS - LINHA ADICIONADA
            carregar_dados()
            
            return jsonify({
                'sucesso': True,
                'mensagem': 'Planilha carregada com sucesso!',
                'arquivo': filename,
                'data': datetime.now().strftime('%d/%m/%Y %H:%M')
            })
        
        return jsonify({'erro': 'Tipo de arquivo não permitido. Use apenas .xlsx ou .xls'}), 400
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/planilhas')
def listar_planilhas():
    """Lista todas as planilhas disponíveis"""
    try:
        arquivos = []
        for f in os.listdir(UPLOAD_FOLDER):
            if f.endswith(('.xlsx', '.xls')):
                filepath = os.path.join(UPLOAD_FOLDER, f)
                stats = os.stat(filepath)
                arquivos.append({
                    'nome': f,
                    'data': datetime.fromtimestamp(stats.st_ctime).strftime('%d/%m/%Y %H:%M'),
                    'tamanho': f"{stats.st_size / 1024:.1f} KB",
                    'ativa': (PLANILHA_ATUAL == f)
                })
        
        # Ordena do mais novo para o mais velho
        arquivos.sort(key=lambda x: x['data'], reverse=True)
        
        return jsonify({'planilhas': arquivos})
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/selecionar-planilha', methods=['POST'])
def selecionar_planilha():
    """Seleciona uma planilha específica para usar"""
    try:
        dados = request.json
        nome_arquivo = dados.get('arquivo')
        
        filepath = os.path.join(UPLOAD_FOLDER, nome_arquivo)
        
        if not os.path.exists(filepath):
            return jsonify({'erro': 'Arquivo não encontrado'}), 404
        
        global PLANILHA_ATUAL, CAMINHO_PLANILHA
        PLANILHA_ATUAL = nome_arquivo
        CAMINHO_PLANILHA = filepath
        
        # FORÇA O RECARREGAMENTO DOS DADOS
        carregar_dados()
        
        return jsonify({
            'sucesso': True,
            'mensagem': f'Planilha {nome_arquivo} selecionada com sucesso!'
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/planilha-atual')
def planilha_atual():
    """Retorna a planilha atual em uso"""
    return jsonify({
        'planilha': PLANILHA_ATUAL if PLANILHA_ATUAL else 'Nenhuma',
        'caminho': CAMINHO_PLANILHA
    })

@app.route('/api/apagar-planilha', methods=['POST'])
def apagar_planilha():
    """Apaga uma planilha específica"""
    try:
        dados = request.json
        nome_arquivo = dados.get('arquivo')
        
        filepath = os.path.join(UPLOAD_FOLDER, nome_arquivo)
        
        if not os.path.exists(filepath):
            return jsonify({'erro': 'Arquivo não encontrado'}), 404
        
        global PLANILHA_ATUAL, CAMINHO_PLANILHA
        
        # Verifica se a planilha apagada era a ativa
        era_ativa = (nome_arquivo == PLANILHA_ATUAL)
        
        # Apaga o arquivo
        os.remove(filepath)
        
        # Se era a ativa, volta para a planilha padrão
        if era_ativa:
            PLANILHA_ATUAL = None
            CAMINHO_PLANILHA = 'conflitos.xlsx'
            # Garante que a planilha padrão existe
            if not os.path.exists(CAMINHO_PLANILHA):
                carregar_dados()  # Cria uma nova planilha padrão
        
        return jsonify({
            'sucesso': True,
            'mensagem': f'Planilha {nome_arquivo} apagada com sucesso!',
            'era_ativa': era_ativa
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

if __name__ == '__main__':
    # Carrega configurações salvas ao iniciar
    try:
        with open('crc_config.json', 'r', encoding='utf-8') as f:
            config = json.load(f)
            for crc in config:
                if crc in CRCS:
                    CRCS[crc]['distancia'] = config[crc]['distancia']
                    CRCS[crc]['localidade'] = config[crc]['localidade']
    except FileNotFoundError:
        pass
    
    # PARA PRODUÇÃO NO RENDER
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)