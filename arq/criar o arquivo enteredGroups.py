import os
from datetime import datetime

def main(palavra):
	anime_dir = os.path.join(os.path.dirname(__file__), '..', 'numbersWpp', palavra)
	output_file = os.path.join(os.path.dirname(__file__), '..', 'groupsWpp', palavra, 'grouptsEntered.db')
	lines = []

	for filename in os.listdir(anime_dir):
		# Supondo que o nome do arquivo seja no formato: inviteCode_chatid.ext
		name, _ = os.path.splitext(filename)
		parts = name.split('_')
		if len(parts) >= 2:
			invite_code = parts[0]
			chat_id = parts[1]
			now = str(int(datetime.now().timestamp()))
			lines.append(f"{invite_code}\t{chat_id}\t{now}\n")

	with open(output_file, 'w', encoding='utf-8') as f:
		f.writelines(lines)

if __name__ == "__main__":
	palavra = 'anime'
	main(palavra)