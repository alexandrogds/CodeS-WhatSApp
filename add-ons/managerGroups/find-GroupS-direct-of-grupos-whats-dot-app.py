
from bs4 import BeautifulSoup
from core.crawling import Crawler
import requests
from datetime import datetime
import asyncio
from playwright.async_api import async_playwright

async def find_GroupS(palavra, browser):
	pass

async def main():
	input("Pressione Enter para iniciar a busca por grupos do WhatsApp...")
	palavra = "crash royale"
	# browser = Crawler.connect()  # If you need this, adapt for async or remove
	p = await async_playwright().start()
	ws_url = 'ws://localhost:9333/devtools/browser/85c209c0-d281-4970-9dd6-15a481d6bb6e'
	browser = await p.chromium.connect_over_cdp(ws_url, timeout=2000000000)
	if browser == False:
		raise Exception('Crawler error. Verifique a implementação na lib.')
	await find_GroupS(palavra, browser)
	await browser.close()
	await p.stop()

if __name__ == "__main__":
	asyncio.run(main())
