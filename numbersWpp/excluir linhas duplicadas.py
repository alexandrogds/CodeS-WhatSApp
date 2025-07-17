import os

anime_dir = os.path.join(os.path.dirname(__file__), "anime")

for filename in os.listdir(anime_dir):
    file_path = os.path.join(anime_dir, filename)
    if os.path.isfile(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        # Remove duplicatas preservando a ordem
        seen = set()
        unique_lines = []
        for line in lines:
            if line not in seen:
                unique_lines.append(line)
                seen.add(line)
        with open(file_path, "w", encoding="utf-8") as f:
            f.writelines(unique_lines)
