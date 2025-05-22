import requests
from bs4 import BeautifulSoup

def find_whatsapp_groups(keyword, max_results=10):
	"""
	Busca links de grupos do WhatsApp relacionados à palavra-chave.
	Retorna uma lista de URLs.
	"""
	query = f"{keyword} site:chat.whatsapp.com"
	filename = f"{palavra}.groups.db"
	headers = {
		"User-Agent": "Mozilla/5.0"
	}
	links = []
	start = 0
	while len(links) < max_results:
		url = f"https://www.google.com/search?q={requests.utils.quote(query)}&start={start}"
		response = requests.get(url, headers=headers)
		soup = BeautifulSoup(response.text, "html.parser")
		found = False
		for a in soup.find_all('a', href=True):
			href = a['href']
			if "chat.whatsapp.com" in href:
				# Extrai o link limpo
				s = href.find("https://chat.whatsapp.com/")
				if s != -1:
					e = href.find("&", s)
					link = href[s:e] if e != -1 else href[s:]
					if link not in links:
						links.append(link)
						found = True
						# Adiciona o link ao arquivo (append)
						with open(filename, "a", encoding="utf-8") as f:
							f.write(link + "\n")
			if len(links) >= max_results:
				break
		# Verifica se há próxima página
		next_page = soup.find('a', attrs={'aria-label': 'Próxima página'}) or soup.find('a', string="Próxima")
		if not found or not next_page:
			input('Não foram encontrados mais grupos ou não há próxima página. Pressione Enter para continuar...')
		start += 10
	return links

# Exemplo de uso:
if __name__ == "__main__":
	# palavra = input("Digite a palavra-chave: ")
	palavra = "anime"
	grupos = find_whatsapp_groups(palavra)
