<!-- README.md -->
# machin

## Powershell
```ps1
 Get-ChildItem -Path ".\js\" -Recurse -File -Include "*.js", "*.d.ts", "*.json", "*.html", "*.md" | Sort-Object FullName | ForEach-Object{"d"
>> Get-Content $_.FullName -Encoding UTF8
>> "f"
>> ""} | Set-Content -Encoding UTF8 ".\js.txt"
```

## fonctionnel
- garder les repository au plus haut niveau possible + grace aux ID on doit seulement faire un Repo.replace() sans modifier en profondeur les objets
-> pour les Value Object comme ils ne sont pas référencés on a juste à modifier l'objet directement
