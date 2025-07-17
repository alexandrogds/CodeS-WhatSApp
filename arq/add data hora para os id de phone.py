import os
from datetime import datetime, timezone

base_dir = r"C:\Users\user\CodeS-WhatSApp\numbersWpp"

def add_datetime_to_lines(file_path):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S%z")
    # Ajusta o formato do UTC para +00:00
    now = now[:-2] + ":" + now[-2:]
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    with open(file_path, "w", encoding="utf-8") as f:
        for line in lines:
            line = line.rstrip("\n\r")
            if line.strip() == "":
                continue
            f.write(f"{line}\t{now}\n")

for root, dirs, files in os.walk(base_dir):
    for file in files:
        file_path = os.path.join(root, file)
        add_datetime_to_lines(file_path)
