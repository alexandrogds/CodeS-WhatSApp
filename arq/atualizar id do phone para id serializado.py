import os

folder_path = os.path.join(os.path.dirname(__file__), '..', 'numbersWpp')

for root, dirs, files in os.walk(folder_path):
    for file in files:
        file_path = os.path.join(root, file)
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        # Adiciona '@c.us' ao final de cada linha (antes do \n)
        new_lines = []
        for line in lines:
            line = line.rstrip('\n')
            if not line.endswith('@c.us'):
                line += '@c.us'
            new_lines.append(line + '\n')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
