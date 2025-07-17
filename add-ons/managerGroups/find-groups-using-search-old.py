"""
falta implementar para pegar links de grupos
após ter "uma pagina sem links como esse"[var last found].
"""

from bs4 import BeautifulSoup
from core.crawling import Crawler
import requests
from datetime import datetime
import asyncio
from playwright.async_api import async_playwright

def get_synonyms(keyword):
	# Consulta múltiplas APIs de sinônimos
	api_syns = []

	# Datamuse API
	try:
		resp = requests.get(f"https://api.datamuse.com/words?rel_syn={keyword}")
		print(f"API response (Datamuse): {resp.status_code}")
		if resp.status_code == 200:
			api_syns += [item['word'] for item in resp.json()]
			print(f"API synonyms (Datamuse): {[item['word'] for item in resp.json()]}")
	except Exception:
		print("Erro ao acessar a API Datamuse.")

	# Merriam-Webster Thesaurus API (exemplo, requer chave de API)
	try:
		MW_API_KEY = "4bf3c907-7995-4240-9615-1e80b2632c5f"
		resp = requests.get(f"https://www.dictionaryapi.com/api/v3/references/thesaurus/json/{keyword}?key={MW_API_KEY}")
		print(f"API response (MW): {resp.status_code}")
		if resp.status_code == 200:
			data = resp.json()
			if isinstance(data, list) and data and isinstance(data[0], dict) and "meta" in data[0]:
				api_syns += data[0]["meta"].get("syns", [])[0]
				print(f"API synonyms (MW): {data[0]['meta'].get('syns', [])[0]}")
	except Exception:
		print("Erro ao acessar a API Merriam-Webster.")

	# Big Huge Thesaurus API (exemplo, requer chave de API)
	try:
		BHT_API_KEY = "7c9f0b7ba1bfd64354c14a7f8a62d58c"
		resp = requests.get(f"https://words.bighugelabs.com/api/2/{BHT_API_KEY}/{keyword}/json")
		print(f"API response (BHT): {resp.status_code}")
		if resp.status_code == 200:
			data = resp.json()
			for pos in data.values():
				if "syn" in pos:
					api_syns += pos["syn"]
					print(f"API synonyms (BHT): {pos['syn']}")
	except Exception:
		print("Erro ao acessar a API Big Huge Thesaurus.")

	# Fallback local
	synonyms_dict = {
		"anime": ["desenho japonês", "mangá", "otaku"],
		# ...adicione outros termos conforme necessário...
	}
	local_syns = synonyms_dict.get(keyword.lower(), [])
	# Junta e remove duplicatas mantendo a ordem
	all_syns = [keyword] + [s for s in api_syns + local_syns if s != keyword and s not in [keyword]]
	return list(dict.fromkeys(all_syns))

async def find_whatsapp_groups_async(keyword, browser):
	"""
	Busca links de grupos do WhatsApp relacionados à palavra-chave e seus sinônimos usando Playwright.
	Retorna uma lista de URLs.
	"""
	import os
	import traceback
	terms = get_synonyms(keyword)
	offset = 10
	groups_dir = "groupsWpp"
	# Cria subpasta para a palavra inicial
	main_term_dir = os.path.join(groups_dir, keyword)
	os.makedirs(main_term_dir, exist_ok=True)
	links = []
	page = await browser.new_page()
	# Lê metadata.db para saber o maior start de cada termo
	metadata_starts = {}
	metadata_file = "metadata.db"
	header_file = 'query\tstart\tdatetime\tlast_found'
	terms_with_last_found = set()
	# Adiciona header se o arquivo não existir ou está vazio
	try:
		with open(metadata_file, "r+", encoding="utf-8") as meta:
			lines = meta.readlines()
			if not lines or not lines[0].startswith(header_file):
				meta.seek(0)
				meta.write(header_file + "\n")
				meta.writelines(lines)
	except FileNotFoundError:
		with open(metadata_file, "w", encoding="utf-8") as meta:
			meta.write(header_file + "\n")
	with open(metadata_file, "r", encoding="utf-8") as meta:
		for line in meta:
			if line.startswith(header_file):
				continue
			parts = line.strip().split('\t')
			if len(parts) >= 4:
				term, start, _, last_found = parts[0], parts[1], parts[2], parts[3]
				try:
					start = int(start)
					last_found = int(last_found)
					if start > metadata_starts.get(term, -offset):
						metadata_starts[term] = start
					if int(last_found) == 1:
						terms_with_last_found.add(term)
				except ValueError:
					continue

	# Lista de sites para pesquisar
	search_sites = [
		"chat.whatsapp.com",
		"gruposwhats.app",
		# Adicione outros domínios/sites conforme necessário
	]

	for term in terms:
		print(f"Procurando grupos do WhatsApp para o termo: {term}")
		start = metadata_starts.get(term, -offset)
		if term in terms_with_last_found:
			continue  # já pesquisado e nunca teve resultados
		for site in search_sites:
			print(f"Procurando em {site} para o termo: {term}")
			query = f"{term} site:{site}"
			while True:
				print(f"Procurando por: {query} (start={start})")
				start += offset
				# url = f"https://www.google.com/search?q={query.replace(' ', '+')}&start={start}"
				url = f"https://www.bing.com/search?q={query.replace(' ', '+')}%3agruposwhats.app&first={start}"
				await page.goto(url, timeout=2000000000)
				input("Pressione Enter para continuar após carregar a página...")
				await page.wait_for_load_state()
				html = await page.content()
				soup = BeautifulSoup(html, "html.parser")
				found = False
				# Se for chat.whatsapp.com, pega direto os links do Google
				if site == "chat.whatsapp.com":
					for a in soup.find_all('a', href=True):
						href = a['href']
						if site in href:
							s = href.find(f"https://{site}/")
							if s != -1:
								found = True
								e = href.find("&", s)
								link = href[s:e] if e != -1 else href[s:]
								if link not in links:
									links.append(link)
									# Salva na subpasta da palavra inicial
									with open(os.path.join(main_term_dir, f"{term}-{site}.groups.db"), "a", encoding="utf-8") as f:
										f.write(link + "\n")
				else:
					# Para outros sites, entra no site e procura links do chat.whatsapp.com
					for a in soup.find_all('a', href=True):
						href = a['href']
						if site in href and 'group' in href:
							# Tenta abrir a página do resultado
							try:
								await page.goto(href, timeout=2000000000)
								await page.wait_for_load_state()
								inner_html = await page.content()
								inner_soup = BeautifulSoup(inner_html, "html.parser")
								for inner_a in inner_soup.find_all('a', href=True):
									inner_href = inner_a['href']
									if "join-group" in inner_href:
										await page.goto(inner_href, timeout=2000000000)
										await page.wait_for_load_state()
										# pegar a url da barra de endereços
										current_url = page.url
										if "chat.whatsapp.com" in current_url:
											s = current_url.find("https://chat.whatsapp.com/")
											if s != -1:
												found = True
												e = current_url.find("&", s)
												link = current_url[s:e] if e != -1 else current_url[s:]
												if link not in links:
													links.append(link)
													# Salva na subpasta da palavra inicial
													with open(os.path.join(main_term_dir, f"{term}-{site}.groups.db"), "a", encoding="utf-8") as f:
														f.write(link + "\n")
							except Exception as e:
								print(f"Erro ao acessar {href}:")
								traceback.print_exc()
								print(f"Continuando com o próximo link. Erro: {e}")
				if not found:
					now = datetime.now().strftime("%Y-%m-%dT%H.%M.%S")
					with open("metadata.db", "a", encoding="utf-8") as meta:
						meta.write(f"{query}\t{start}\t{now}\t{int(not found)}\n")
					break
				now = datetime.now().strftime("%Y-%m-%dT%H.%M.%S")
				with open("metadata.db", "a", encoding="utf-8") as meta:
					meta.write(f"{query}\t{start}\t{now}\t{int(not found)}\n")

@staticmethod
def get_websocket_url(port):
	"""Fetch the webSocketDebuggerUrl from the /json/version endpoint."""
	import requests
	try:
		response = requests.get(f"http://localhost:{port}/json/version")
		response.raise_for_status()
		web_socket_url = response.json().get("webSocketDebuggerUrl")
		print(f"WebSocket URL: {web_socket_url}")
		return web_socket_url
	except requests.RequestException as e:
		print(f"Failed to fetch webSocketDebuggerUrl: {e}")
		return None

async def main():
	port = 9333  # Porta do navegador remoto
	palavra = "crash royale"
	input(f'Inicie o navegador com o comando:\n start C:/Users/user/AppData/Local/Programs/Opera/opera.exe --remote-debugging-port={port}')
	input("Pressione Enter para iniciar a busca por grupos do WhatsApp...")
	# browser = Crawler.connect()  # If you need this, adapt for async or remove
	p = await async_playwright().start()
	ws_url = get_websocket_url(port)
	browser = await p.chromium.connect_over_cdp(ws_url, timeout=2000000000)
	if browser == False:
		raise Exception('Crawler error. Verifique a implementação na lib.')
	await find_whatsapp_groups_async(palavra, browser)
	await browser.close()
	await p.stop()

if __name__ == "__main__":
	asyncio.run(main())
