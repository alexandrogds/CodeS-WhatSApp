"""
falta implementar para pegar links de grupos
após ter "uma pagina sem links como esse"[var last found].
"""

from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from core.crawling import Crawler
import requests
from datetime import datetime

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

def find_whatsapp_groups(keyword, browser):
	"""
	Busca links de grupos do WhatsApp relacionados à palavra-chave e seus sinônimos usando Playwright.
	Retorna uma lista de URLs.
	"""
	import os
	terms = get_synonyms(keyword)
	offset = 10
	groups_dir = "groupsWpp"
	# Cria subpasta para a palavra inicial
	main_term_dir = os.path.join(groups_dir, keyword)
	os.makedirs(main_term_dir, exist_ok=True)
	links = []
	page = browser.new_page()
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
		start = metadata_starts.get(term, -offset)
		if term in terms_with_last_found:
			continue  # já pesquisado e nunca teve resultados
		for site in search_sites:
			query = f"{term} site:{site}"
			while True:
				start += offset
				url = f"https://www.google.com/search?q={query.replace(' ', '+')}&start={start}"
				page.goto(url, timeout=2000000000)
				page.wait_for_load_state()
				html = page.content()
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
									with open(os.path.join(main_term_dir, f"{term}.groups.db"), "a", encoding="utf-8") as f:
										f.write(link + "\n")
				else:
					# Para outros sites, entra no site e procura links do chat.whatsapp.com
					for a in soup.find_all('a', href=True):
						href = a['href']
						if site in href and 'group' in href:
							# Tenta abrir a página do resultado
							try:
								page.goto(href, timeout=2000000000)
								page.wait_for_load_state()
								inner_html = page.content()
								inner_soup = BeautifulSoup(inner_html, "html.parser")
								for inner_a in inner_soup.find_all('a', href=True):
									inner_href = inner_a['href']
									if "join-group" in inner_href:
										page.goto(inner_href, timeout=2000000000)
										page.wait_for_load_state()
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
													with open(os.path.join(main_term_dir, f"{term}.groups.db"), "a", encoding="utf-8") as f:
														f.write(link + "\n")
							except Exception:
								pass
				if not found:
					now = datetime.now().strftime("%Y-%m-%dT%H:%M.%S")
					with open("metadata.db", "a", encoding="utf-8") as meta:
						meta.write(f"{query}\t{start}\t{now}\t{int(not found)}\n")
					break
				now = datetime.now().strftime("%Y-%m-%dT%H:%M.%S")
				with open("metadata.db", "a", encoding="utf-8") as meta:
					meta.write(f"{query}\t{start}\t{now}\t{int(not found)}\n")

# Exemplo de uso:
if __name__ == "__main__":
	# palavra = input("Digite a palavra-chave: ")
	palavra = "anime"
	browser = Crawler.connect()
	if browser == False:
		raise Exception('Crawler error. Verifique a implementação na lib.')
	find_whatsapp_groups(palavra, browser)
	browser.close()
