<!-- README.md -->
# machin

## Powershell
```ps1
 Get-ChildItem -Path ".\js\" -Recurse -File -Include "*.js", "*.d.ts", "*.json", "*.html", "*.md" | Sort-Object FullName | ForEach-Object{"d"
>> Get-Content $_.FullName -Encoding UTF8
>> "f"
>> ""} | Set-Content -Encoding UTF8 ".\js.txt"
```
