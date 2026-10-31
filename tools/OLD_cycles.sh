#!/usr/bin/env bash
# tools/OLD_cycles.sh
# Affiche les .js du dossier (récursif) groupés par niveau de dépendance,
# calculé à partir des directives /// <reference path="..." />.
# Les cycles et références introuvables sont affichés après les niveaux.

ROOT="${1:-.}"
[[ -d $ROOT ]] || { echo "Dossier introuvable : $ROOT" >&2; exit 2; }

# On se place dans ROOT : tous les chemins ci-dessous (find, dépendances,
# affichage) sont donc relatifs à ce dossier.
cd "$ROOT" || exit 2

declare -A LEVEL STATE   # STATE : 1 = en cours de visite, 2 = terminé
declare -A SEEN_MSG      # pour ne pas afficher deux fois le même message
STACK=()
CYCLES=()                # cycles détectés
MISSING=()               # références vers des fichiers introuvables
RET=0
ERR=0

# Simplifie un chemin : a/b/../c/./d.js -> a/c/d.js
normalize() {
  local parts out=() part
  IFS=/ read -ra parts <<< "$1"
  for part in "${parts[@]}"; do
    case "$part" in
      ""|.) ;;
      ..) unset 'out[${#out[@]}-1]' ;;
      *) out+=("$part") ;;
    esac
  done
  local IFS=/
  echo "${out[*]}"
}

# Liste les dépendances (chemins normalisés) d'un fichier
deps() {
  local f="$1" p
  sed -n "s|^///[[:space:]]*<reference[[:space:]]\{1,\}path=[\"']\([^\"']*\)[\"'].*|\1|p" "$f" \
    | while IFS= read -r p; do
        normalize "$(dirname "$f")/$p"
      done
}

# Calcule le niveau de $1, résultat dans RET
compute() {
  local f="$1" dep max=-1

  if [[ ${STATE[$f]:-0} == 2 ]]; then RET=${LEVEL[$f]}; return; fi

  if [[ ${STATE[$f]:-0} == 1 ]]; then
    local i out="" msg
    for i in "${!STACK[@]}"; do
      [[ -n $out || ${STACK[$i]} == "$f" ]] && out+="${STACK[$i]} -> "
    done
    msg="${out}${f}"
    if [[ -z ${SEEN_MSG[$msg]:-} ]]; then
      SEEN_MSG[$msg]=1
      CYCLES+=("$msg")
    fi
    ERR=1; RET=-1; return
  fi

  STATE[$f]=1
  STACK+=("$f")

  while IFS= read -r dep; do
    [[ -z $dep ]] && continue
    if [[ ! -f $dep ]]; then
      MISSING+=("$dep (référencé par $f)")
      ERR=1; continue
    fi
    compute "$dep"
    (( RET > max )) && max=$RET
  done < <(deps "$f")

  unset 'STACK[${#STACK[@]}-1]'
  STATE[$f]=2
  LEVEL[$f]=$(( max + 1 ))
  RET=${LEVEL[$f]}
}

# Tous les .js, en ignorant les dossiers cachés (.git, .vscode...)
while IFS= read -r f; do
  compute "$f"
done < <(find . -name '.?*' -prune -o -name '*.js' -print | sed 's|^\./||' | sort)

# Affichage groupé par niveau
prev=-2
for f in "${!LEVEL[@]}"; do echo "${LEVEL[$f]} $f"; done \
  | sort -k1,1n -k2 \
  | while read -r l f; do
      if [[ $l != "$prev" ]]; then echo; echo "NIVEAU $l"; prev=$l; fi
      echo "  $f"
    done

# Problèmes, affichés après les niveaux
if (( ${#CYCLES[@]} )); then
  echo
  echo "CYCLES (${#CYCLES[@]})"
  for c in "${CYCLES[@]}"; do echo "  $c"; done
fi

if (( ${#MISSING[@]} )); then
  echo
  echo "RÉFÉRENCES INTROUVABLES (${#MISSING[@]})"
  for m in "${MISSING[@]}"; do echo "  $m"; done
fi

exit $ERR
