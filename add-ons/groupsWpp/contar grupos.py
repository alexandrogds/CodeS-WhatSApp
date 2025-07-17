import os

def contar_linhas_nao_brancas(diretorio):
	total_linhas = 0
	for root, _, files in os.walk(diretorio):
		for file in files:
			caminho_arquivo = os.path.join(root, file)
			try:
				with open(caminho_arquivo, 'r', encoding='utf-8') as f:
					linhas = f.readlines()
					linhas_nao_brancas = [linha for linha in linhas if linha.strip()]
					print(f"{caminho_arquivo}: {len(linhas_nao_brancas)}")
					total_linhas += len(linhas_nao_brancas)
			except Exception as e:
				print(f"Erro ao ler {caminho_arquivo}: {e}")
	print(f"Total de linhas não brancas: {total_linhas}")
	return total_linhas

def contar_arquivos(diretorio):
	count = 0
	for root, _, files in os.walk(diretorio):
		count += len(files)
	print(f"Quantidade de arquivos em {diretorio}: {count}")
	return count

def contar_linhas_nao_brancas_arquivo(filepath):
	try:
		with open(filepath, 'r', encoding='utf-8') as f:
			linhas = f.readlines()
			linhas_nao_brancas = [linha for linha in linhas if linha.strip()]
			print(f"{filepath}: {len(linhas_nao_brancas)} linhas não brancas")
			return len(linhas_nao_brancas)
	except Exception as e:
		print(f"Erro ao ler {filepath}: {e}")
		return 0

if __name__ == "__main__":
	diretorio = os.path.join(os.path.dirname(__file__), "anime")
	total_linhas_anime = contar_linhas_nao_brancas(diretorio)
	numbers_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "numbersWpp", "anime"))
	total_arquivos_numbers = contar_arquivos(numbers_dir)
	group_db = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "enterGroups", "groupSWaitAccept.db"))
	linhas_group_db = contar_linhas_nao_brancas_arquivo(group_db)
	link_expired_db = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "arq", "linkExpired.db"))
	linhas_link_expired = contar_linhas_nao_brancas_arquivo(link_expired_db)
	invite_code_db = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "arq", "inviteCodeAndGroupId.db"))
	linhas_invite_code = contar_linhas_nao_brancas_arquivo(invite_code_db)
	print(total_arquivos_numbers + linhas_group_db + linhas_link_expired, total_linhas_anime)
	print(total_arquivos_numbers + linhas_group_db, linhas_invite_code)
	# Retorno dos valores
	resultados = {
		"total_linhas_anime": total_linhas_anime,
		"total_arquivos_numbers": total_arquivos_numbers,
		"linhas_group_db": linhas_group_db,
		"linhas_link_expired": linhas_link_expired,
		"linhas_invite_code": linhas_invite_code
	}