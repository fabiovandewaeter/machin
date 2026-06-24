<!-- README.md -->
# machin

## Powershell
```ps1
 Get-ChildItem -Path ".\js\" -Recurse -File -Include "*.js", "*.d.ts", "*.json", "*.html", "*.md" | Sort-Object FullName | ForEach-Object{"d"
>> Get-Content $_.FullName -Encoding UTF8
>> "f"
>> ""} | Set-Content -Encoding UTF8 ".\js.txt"
```

## js
- pas `in` sur une array ça ca regarde les keys donc les indices

## fonctionnel
- garder les repository au plus haut niveau possible + grace aux ID on doit seulement faire un Repo.replace() sans modifier en profondeur les objets
-> pour les Value Object comme ils ne sont pas référencés on a juste à modifier l'objet directement
- on ne peut pas retourner des D<> à chaque fois car pour D<Repo<T,TID>> il n'arrive pas à le transformer en Repo<T,TID> tout seul et il faut faire un cast pour pouvoir faire des spreads
