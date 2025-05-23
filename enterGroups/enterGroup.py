"""
em 'animes' o primeiro grupo add os numbers na mao
pois foi usado para development

tratar os 'Enviar pedido' para salvar esses em um
novo arquivo para rodar o codigo depois para pegar os numeros
"""

from playwright.sync_api import sync_playwright
import time
import os
import pyperclip

def entrar_no_grupo_whatsapp(url_convite, page, pasta_grupos):
		try:
			# Clica no span com title 'Space'
			space_span = page.query_selector("span[title='Space']")
			if space_span:
				space_span.click()
				time.sleep(10)  # Aguarda o carregamento da conversa
				print("Clicou no contato/grupo 'Space'.")

				# Usa pyperclip para copiar o link e simula Ctrl+V e Enter
				pyperclip.copy(url_convite)
				page.keyboard.press("Control+V")
				page.keyboard.press("Enter")
				time.sleep(7)
				print("Link enviado para o grupo/contato 'Space'.")

				# Clica no link enviado (href igual ao link do grupo)
				page.wait_for_timeout(1000)  # Aguarda mensagem aparecer
				link_element = page.query_selector(f"a[href='{url_convite}']")
				if link_element:
					link_element.click()
					time.sleep(15)  # Aguarda o carregamento do grupo
					print("Clicou no link do grupo enviado.")
					# input()

					# Clica na div com texto 'Entrar no grupo'
					entrar_div = page.query_selector("div:has-text('Entrar no grupo')")
					if not entrar_div:
						entrar_div = page.query_selector("div:has-text('Enviar pedido')")
						if entrar_div:
							entrar_div.click()
							time.sleep(10)
							print("Clicou em 'Enviar pedido'.")
							return
							# Salva o link no arquivo groupsNeedAccess.db
							arquivo_groups_need_access = os.path.join(pasta_grupos, 'groupsNeedAccess.db')
							with open(arquivo_groups_need_access, 'a', encoding='utf-8') as f:
								f.write(url_convite + '\n')
							print(f"Link salvo em {arquivo_groups_need_access} para posterior acesso.")
							# Clica na div com texto 'Cancelar' se existir
							cancelar_div = page.query_selector("div:has-text('Cancelar')")
							if not cancelar_div:
								print("Botão 'Cancelar' não encontrado. Tentando encontrar o botão 'Cancelar' em um botão.")
								cancelar_div = page.evaluate_handle("""
									() => {
										return Array.from(document.querySelectorAll('button')).find(
											el => el.textContent.trim() === 'Cancelar'
										) || null;
									}
								""")
								print("Botão 'Cancelar' encontrado.")
							if cancelar_div:
								print("Clicou em 'Cancelar'.")
								cancelar_div.click()
								time.sleep(10)
							print("Botão 'Enviar pedido' encontrado, mas não clicado.")
						return
					if entrar_div:
						entrar_div.click()
						time.sleep(25)
						print("Clicou em 'Entrar no grupo'.")

						# Coleta todos os spans que contêm '(' no texto
						spans = page.query_selector_all("span")
						numeros = []
						for span in spans:
							texto = span.inner_text()
							if '(' in texto:
								numeros.append(texto.strip())

						# Salva os números no arquivo .db
						if numeros:
							with open(arquivo_db, 'a', encoding='utf-8') as dbf:
								for numero in numeros:
									dbf.write(numero + '\n')
							print(f"{len(numeros)} números salvos em {arquivo_db}")
						else:
							print("Nenhum número encontrado para salvar.")
					else:
						print("Botão 'Entrar no grupo' não encontrado.")
				else:
					print("Link do grupo não encontrado na conversa.")
			else:
				print("Contato/grupo 'Space' não encontrado.")
		except Exception as e:
			print(f"Erro ao entrar no grupo: {e}")
if __name__ == "__main__":
	palavra = 'anime'
	pasta_grupos = os.path.join(os.path.dirname(__file__), '..', 'groupsWpp', palavra)
	arquivos = [f for f in os.listdir(pasta_grupos)]
	if not arquivos:
		print("Nenhum arquivo encontrado com o termo especificado.")
	else:
		# Usa Playwright para abrir o navegador e entrar no grupo
		p = sync_playwright().start()
		browser = p.chromium.launch_persistent_context(
			user_data_dir="./User_Data",
			headless=False
		)
		# Cria uma página para login
		page = browser.new_page()
		page.goto("https://web.whatsapp.com", timeout=60000)
		page.wait_for_load_state()
		time.sleep(30)
		# input("Faça login no WhatsApp Web e pressione Enter para continuar...")

		# Caminho para salvar os números
		pasta_numeros = os.path.join(os.path.dirname(__file__), '..', 'numbersWpp')
		os.makedirs(pasta_numeros, exist_ok=True)
		arquivo_db = os.path.join(pasta_numeros, f"{palavra}.db")

		for arquivo in arquivos:
			caminho_arquivo = os.path.join(pasta_grupos, arquivo)
			with open(caminho_arquivo, 'r', encoding='utf-8') as f:
				for linha in f:
					url = linha.strip()
					if url:
						print(f"Tentando entrar no grupo: {url}")
						# Cria uma nova página para cada grupo
						entrar_no_grupo_whatsapp(url, page, pasta_grupos)
	browser.close()
	p.stop()
	print("Processo concluído.")