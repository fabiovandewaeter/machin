#!/usr/bin/env bash
# tools/cycles.sh
#
# usage : bash tools/levels.sh [--types] [--deps] [dossier]
#
#   --types   les imports de types comptent aussi dans les niveaux et les cycles
#             (par défaut : seuls les imports d'exécution comptent)
#   --deps    affiche, sous chaque fichier, ce qu'il importe
#
# Ce qui est lu (commentaires, chaînes, templates et regex sont ignorés) :
#   exécution : import x from "./a.js"      import "./a.js"
#               export { x } from "./a.js"  export * from "./a.js"
#   dynamique : import("./a.js")            (ne compte pas dans les niveaux)
#   types     : /** @import { T } from "./a.js" */   et   {import("./a.js").T}
#   entrées   : <script type="module" src="..."> et imports des scripts inline des .html
#
# Code de sortie : 0 = rien à signaler, 1 = cycle d'exécution, import introuvable
#                  ou extension manquante, 2 = erreur d'usage.

usage() { sed -n '2,17p' "$0" | sed 's/^# \{0,1\}//'; }

TYPES=0; DEPS=0; ROOT="."
for arg in "$@"; do
  case "$arg" in
    --types) TYPES=1 ;;
    --deps)  DEPS=1 ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "Option inconnue : $arg" >&2; usage >&2; exit 2 ;;
    *)  ROOT="$arg" ;;
  esac
done

[[ -d $ROOT ]] || { echo "Dossier introuvable : $ROOT" >&2; exit 2; }
cd "$ROOT" || exit 2

# Tous les .js/.mjs/.html, dossiers cachés ignorés (.git, .vscode...)
FILES=()
while IFS= read -r f; do FILES+=("$f"); done < <(
  find . -name '.?*' -prune -o -type f \( -name '*.js' -o -name '*.mjs' -o -name '*.html' \) -print \
    | sed 's|^\./||' | LC_ALL=C sort
)
(( ${#FILES[@]} )) || { echo "Aucun fichier .js/.mjs/.html dans $ROOT" >&2; exit 0; }

IFS= read -r -d '' AWK_PROG <<'AWK'
# ============================================================ utilitaires
function dirname(f) {
  if (match(f, /\/[^\/]*$/)) return substr(f, 1, RSTART - 1)
  return "."
}

# a/b/../c/./d.js -> a/c/d.js ; les ".." qui sortent du dossier sont conservés
function normalize(p,    n, parts, i, m, out, r) {
  n = split(p, parts, "/"); m = 0
  for (i = 1; i <= n; i++) {
    if (parts[i] == "" || parts[i] == ".") continue
    if (parts[i] == "..") {
      if (m > 0 && out[m] != "..") { m--; continue }
      out[++m] = ".."; continue
    }
    out[++m] = parts[i]
  }
  r = ""
  for (i = 1; i <= m; i++) r = r (i > 1 ? "/" : "") out[i]
  return r
}

# ============================================================ lecture du code
function add(file, kind, spec) {
  nraw++; RAWF[nraw] = file; RAWK[nraw] = kind; RAWS[nraw] = spec
}

# texte de la chaîne dont le jeton "N" commence à la position q de code
function strtok(code, q,    j) {
  j = index(substr(code, q + 1), "\"")
  if (j < 2) return ""
  return STR[substr(code, q + 1, j - 1)]
}

function skipws(code, q) {
  while (substr(code, q, 1) ~ /[ \t\r\n]/) q++
  return q
}

# imports de types dans un commentaire /** ... */
function jsdoc(file, com,    s, t) {
  s = com
  while (match(s, /@import[^"'@]*["'][^"']+["']/)) {
    t = substr(s, RSTART, RLENGTH); s = substr(s, RSTART + RLENGTH)
    sub(/^[^"']*["']/, "", t); sub(/["']$/, "", t)
    add(file, "T", t)
  }
  s = com
  while (match(s, /(^|[^A-Za-z0-9_$.])import[ \t\r\n]*\([ \t\r\n]*["'][^"']+["']/)) {
    t = substr(s, RSTART, RLENGTH); s = substr(s, RSTART + RLENGTH)
    sub(/^[^"']*["']/, "", t); sub(/["']$/, "", t)
    add(file, "T", t)
  }
}

# imports/exports dans le code nettoyé (chaînes remplacées par des jetons "N")
function scan_code(file, code,    i, j, p, q, c, seg, k, r, sp) {
  i = 1
  while ((j = index(substr(code, i), "import")) > 0) {
    p = i + j - 1; i = p + 6
    if (p > 1 && substr(code, p - 1, 1) ~ /[A-Za-z0-9_$.]/) continue
    if (substr(code, p + 6, 1) ~ /[A-Za-z0-9_$]/) continue
    q = skipws(code, p + 6); c = substr(code, q, 1)
    if (c == "(") {                                   # import("...")
      q = skipws(code, q + 1)
      if (substr(code, q, 1) == "\"") { sp = strtok(code, q); if (sp != "") add(file, "L", sp) }
    } else if (c == "\"") {                           # import "..."
      sp = strtok(code, q); if (sp != "") add(file, "R", sp)
    } else if (c ~ /[A-Za-z_$*{]/) {                  # import ... from "..."
      seg = substr(code, q); k = index(seg, "\"")
      if (k == 0 || index(substr(seg, 1, k - 1), ";") > 0) continue
      sp = strtok(code, q + k - 1); if (sp != "") add(file, "R", sp)
    }
  }
  i = 1
  while ((j = index(substr(code, i), "export")) > 0) {
    p = i + j - 1; i = p + 6
    if (p > 1 && substr(code, p - 1, 1) ~ /[A-Za-z0-9_$.]/) continue
    if (substr(code, p + 6, 1) ~ /[A-Za-z0-9_$]/) continue
    q = skipws(code, p + 6); c = substr(code, q, 1)
    if (c == "*") {                                   # export * from "..."
      seg = substr(code, q); k = index(seg, "\"")
      if (k == 0 || index(substr(seg, 1, k - 1), ";") > 0) continue
      sp = strtok(code, q + k - 1); if (sp != "") add(file, "R", sp)
    } else if (c == "{") {                            # export { a } from "..."
      k = index(substr(code, q), "}"); if (k == 0) continue
      r = skipws(code, q + k)
      if (substr(code, r, 4) == "from" && substr(code, r + 4, 1) !~ /[A-Za-z0-9_$]/) {
        r = skipws(code, r + 4)
        if (substr(code, r, 1) == "\"") { sp = strtok(code, r); if (sp != "") add(file, "R", sp) }
      }
    }
  }
}

# Nettoie le JS : commentaires, regex et templates disparaissent, chaque chaîne
# devient un jeton "N" (STR[N] = contenu). Les @import des /** */ sont extraits.
function lex(file, s,    n, i, c, c2, d, j, q, buf, out, last, lw, depth, ts, mode, incls, ok, com) {
  n = length(s); out = ""; last = ""; lw = ""; depth = 0; ts = 0; mode = 0; i = 1
  split("", TST)
  while (i <= n) {
    c = substr(s, i, 1)
    if (mode == 1) {                                  # texte d'un template literal
      if (c == "\\") { i += 2; continue }
      if (c == "`") { mode = 0; last = "s"; i++; continue }
      if (c == "$" && substr(s, i + 1, 1) == "{") {
        TST[++ts] = depth; mode = 0; out = out " "; last = "("; i += 2; continue
      }
      i++; continue
    }
    c2 = substr(s, i + 1, 1)
    if (c == "/" && c2 == "/") {                      # commentaire de ligne
      j = index(substr(s, i), "\n")
      if (j == 0) break
      i += j - 1; out = out " "; continue
    }
    if (c == "/" && c2 == "*") {                      # commentaire de bloc
      j = index(substr(s, i + 2), "*/")
      if (j == 0) { com = substr(s, i); i = n + 1 }
      else        { com = substr(s, i, j + 3); i += j + 3 }
      if (substr(com, 3, 1) == "*") jsdoc(file, com)
      out = out " "; continue
    }
    if (c == "\"" || c == "'") {                      # chaîne
      q = c; j = i + 1; buf = ""
      while (j <= n) {
        d = substr(s, j, 1)
        if (d == "\\") { buf = buf substr(s, j, 2); j += 2; continue }
        if (d == q || d == "\n") break
        buf = buf d; j++
      }
      nstr++; STR[nstr] = buf
      out = out "\"" nstr "\""; i = j + 1; last = "s"; continue
    }
    if (c == "`") { mode = 1; out = out " "; i++; continue }
    if (c == " " || c == "\t" || c == "\n" || c == "\r") { out = out c; i++; continue }
    if (c ~ /[A-Za-z_$0-9]/) {                        # identifiant / nombre
      j = i + 1
      while (j <= n && substr(s, j, 1) ~ /[A-Za-z0-9_$]/) j++
      lw = substr(s, i, j - i); out = out lw; i = j; last = "a"; continue
    }
    if (c == "/") {                                   # regex ou division ?
      if (last == "" || index("(,=:[!&|?{};+-*%<>~^", last) > 0 \
          || (last == "a" && lw ~ /^(return|typeof|case|do|else|in|of|void|delete|throw|yield|await)$/)) {
        j = i + 1; incls = 0; ok = 0
        while (j <= n) {
          d = substr(s, j, 1)
          if (d == "\n") break
          if (d == "\\") { j += 2; continue }
          if (d == "[") incls = 1
          else if (d == "]") incls = 0
          else if (d == "/" && !incls) { ok = 1; break }
          j++
        }
        if (ok) { out = out " "; i = j + 1; last = "s"; continue }
      }
      out = out c; last = "/"; i++; continue
    }
    if (c == "{") { depth++; out = out c; last = "{"; i++; continue }
    if (c == "}") {
      if (ts > 0 && depth == TST[ts]) { ts--; mode = 1; out = out " "; i++; continue }
      depth--; out = out c; last = "}"; i++; continue
    }
    out = out c; last = c; i++
  }
  scan_code(file, out)
}

function strip_html_comments(s,    a, b) {
  while ((a = index(s, "<!--")) > 0) {
    b = index(substr(s, a + 4), "-->")
    if (b == 0) return substr(s, 1, a - 1)
    s = substr(s, 1, a - 1) " " substr(s, a + b + 6)
  }
  return s
}

function process_html(file, s,    tag, src, k) {
  s = strip_html_comments(s)
  while (match(s, /<script[^>]*>/)) {
    tag = substr(s, RSTART, RLENGTH); s = substr(s, RSTART + RLENGTH)
    if (tag !~ /type[ \t]*=[ \t]*["']?module/) continue
    if (match(tag, /src[ \t]*=[ \t]*["'][^"']+["']/)) {
      src = substr(tag, RSTART, RLENGTH)
      sub(/^[^"']*["']/, "", src); sub(/["']$/, "", src)
      add(file, "R", src)
    } else {
      k = index(s, "</script>")
      if (k > 0) { lex(file, substr(s, 1, k - 1)); s = substr(s, k) }
    }
  }
}

function process(file, text) {
  if (file in ISHTML) process_html(file, text)
  else lex(file, text)
}

# ============================================================ résolution
# Résultat dans RES (chemin) et RST : ok | noext | missing | external | bare | asset
function resolve(from, spec,    p) {
  RES = ""; RST = ""
  if (spec ~ /^[A-Za-z][A-Za-z0-9+.-]*:/) { RST = "external"; return }
  if (spec ~ /^\.\.?(\/|$)/) p = normalize(dirname(from) "/" spec)
  else if (spec ~ /^\//)     p = normalize(substr(spec, 2))
  else { RST = "bare"; return }
  if (p in FSET)               { RES = p; RST = "ok"; return }
  if ((p ".js") in FSET)       { RES = p ".js"; RST = "noext"; return }
  if ((p "/index.js") in FSET) { RES = p "/index.js"; RST = "noext"; return }
  if (p ~ /\.(json|css|wasm|svg|png|jpe?g|gif|webp|txt|csv|html)$/) { RST = "asset"; return }
  RES = p; RST = "missing"
}

function kindlabel(k) {
  return (k == "T") ? " (type)" : (k == "L") ? " (import dynamique)" : ""
}

function resolve_all(    r, f, k, s, key) {
  for (r = 1; r <= nraw; r++) {
    f = RAWF[r]; k = RAWK[r]; s = RAWS[r]
    sub(/[?#].*$/, "", s)
    resolve(f, s)
    if (RST == "external" || RST == "asset") continue
    if (RST == "bare")    { BARE[++nbare] = f " : \"" s "\"" kindlabel(k); continue }
    if (RST == "missing") { MISS[++nmiss] = f " : \"" s "\" -> " RES kindlabel(k); continue }
    if (RST == "noext" && k != "T") NOEXT[++nnoext] = f " : \"" s "\" -> " RES
    if (f in ISHTML) {
      if (k != "T" && !(RES in ENTSET)) { ENTSET[RES] = 1; ENT[++ne] = RES }
      continue
    }
    key = f SUBSEP RES
    if (!(key in KIND)) { NA[f]++; A[f, NA[f]] = RES; KIND[key] = "" }
    if (index(KIND[key], k) == 0) KIND[key] = KIND[key] k
  }
}

# ============================================================ graphe
# MODE 1 : arêtes d'exécution (R) ; MODE 2 : exécution + types (R, T). L jamais.
function usable(u, v,    k) {
  if (!((u SUBSEP v) in KIND)) return 0
  k = KIND[u SUBSEP v]
  if (MODE == 1) return index(k, "R") > 0
  return index(k, "R") > 0 || index(k, "T") > 0
}

function strong(v,    i, w) {
  TI[v] = LOW[v] = ++tcount; ST[++sp] = v; ONS[v] = 1
  for (i = 1; i <= NA[v]; i++) {
    w = A[v, i]
    if (!usable(v, w)) continue
    if (!(w in TI)) { strong(w); if (LOW[w] < LOW[v]) LOW[v] = LOW[w] }
    else if (ONS[w] && TI[w] < LOW[v]) LOW[v] = TI[w]
  }
  if (LOW[v] == TI[v]) {
    ncomp++
    do { w = ST[sp--]; ONS[w] = 0; COMP[w] = ncomp; CN[ncomp]++; CM[ncomp, CN[ncomp]] = w } while (w != v)
  }
}

function record_cycle(m,    i, mi, key, a, b, t) {
  mi = 1
  for (i = 2; i <= m; i++) if (PATH[i] < PATH[mi]) mi = i
  key = ""
  for (i = 0; i < m; i++) key = key (i ? " -> " : "") PATH[(mi - 1 + i) % m + 1]
  key = key " -> " PATH[mi]
  if (key in SEENC) return
  SEENC[key] = 1; CYC[++ncyc] = key
  CYCG[ncyc] = GROUP[COMP[PATH[mi]]]
  t = 0
  for (i = 0; i < m; i++) {
    a = PATH[(mi - 1 + i) % m + 1]; b = PATH[(mi + i) % m + 1]
    EFREQ[a SUBSEP b]++
    if (index(KIND[a SUBSEP b], "R") == 0) t = 1
  }
  CYCT[ncyc] = t
}

# Pour chaque arête u->v interne à un groupe cyclique : plus court chemin v ~> u.
function find_cycles(    k, i, j, u, v, x, y, head, tail, r, rev, c) {
  split("", CYC); split("", CYCG); split("", CYCT); split("", SEENC); split("", EFREQ); ncyc = 0
  for (k = 1; k <= nf; k++) {
    u = FL[k]
    for (i = 1; i <= NA[u]; i++) {
      v = A[u, i]
      if (!usable(u, v) || COMP[v] != COMP[u] || !(COMP[u] in GROUP)) continue
      if (u == v) { PATH[1] = u; record_cycle(1); continue }
      split("", PRED); split("", VIS); split("", Q)
      head = 1; tail = 1; Q[1] = v; VIS[v] = 1
      while (head <= tail && !(u in VIS)) {
        x = Q[head++]
        for (j = 1; j <= NA[x]; j++) {
          y = A[x, j]
          if (!usable(x, y) || COMP[y] != COMP[u] || (y in VIS)) continue
          VIS[y] = 1; PRED[y] = x; Q[++tail] = y
        }
      }
      r = 0; x = u
      while (x != v) { rev[++r] = x; x = PRED[x] }
      rev[++r] = v
      for (c = 1; c <= r; c++) PATH[c] = rev[r - c + 1]
      record_cycle(r)
    }
  }
}

function analyze(    k, c, i, v, w, m) {
  split("", TI); split("", LOW); split("", ONS); split("", ST); split("", COMP)
  split("", CN); split("", CM); split("", CLV); split("", GROUP)
  tcount = 0; sp = 0; ncomp = 0; ngroup = 0; maxlv = 0
  for (k = 1; k <= nf; k++) if (!(FL[k] in TI)) strong(FL[k])
  # composantes numérotées dépendances d'abord : niveau = 1 + max des dépendances
  for (c = 1; c <= ncomp; c++) {
    m = 0
    for (k = 1; k <= CN[c]; k++) {
      v = CM[c, k]
      for (i = 1; i <= NA[v]; i++) {
        w = A[v, i]
        if (!usable(v, w) || COMP[w] == c) continue
        if (CLV[COMP[w]] + 1 > m) m = CLV[COMP[w]] + 1
      }
    }
    CLV[c] = m; if (m > maxlv) maxlv = m
    if (CN[c] > 1 || usable(CM[c, 1], CM[c, 1])) GROUP[c] = ++ngroup
  }
  find_cycles()
}

function reach(withT,    h, t, v, w, i, k) {
  split("", RV); split("", Q); h = 1; t = 0
  for (i = 1; i <= ne; i++) if (!(ENT[i] in RV)) { RV[ENT[i]] = 1; Q[++t] = ENT[i] }
  while (h <= t) {
    v = Q[h++]
    for (i = 1; i <= NA[v]; i++) {
      w = A[v, i]; k = KIND[v SUBSEP w]
      if (w in RV) continue
      if (index(k, "R") || index(k, "L") || (withT && index(k, "T"))) { RV[w] = 1; Q[++t] = w }
    }
  }
}

# ============================================================ affichage
function show_deps(f,    i, w, k) {
  for (i = 1; i <= NA[f]; i++) {
    w = A[f, i]; k = KIND[f SUBSEP w]
    if (index(k, "R"))      print "      -> " w
    else if (index(k, "L")) print "      -> " w " (import dynamique)"
    else                    print "      -> " w " (type)"
  }
}

function show_levels(    l, k, f, cnt, tag) {
  for (l = 0; l <= maxlv; l++) {
    cnt = 0
    for (k = 1; k <= nf; k++) if (CLV[COMP[FL[k]]] == l) cnt++
    if (!cnt) continue
    print ""; print "NIVEAU " l " (" cnt " fichier" (cnt > 1 ? "s" : "") ")"
    for (k = 1; k <= nf; k++) {
      f = FL[k]
      if (CLV[COMP[f]] != l) continue
      tag = (COMP[f] in GROUP) ? "   [cycle " GROUP[COMP[f]] "]" : ""
      print "  " f tag
      if (showdeps) show_deps(f)
    }
  }
}

function show_cycles(only_types,    g, i, shown, hdr, cmd, e, ab, any, nfreq) {
  if (ncyc == 0) return
  for (i = 1; i <= ncyc; i++) if (!only_types || CYCT[i]) any++
  if (!any) return
  print ""
  print only_types ? "CYCLES DE TYPES (sans effet à l'exécution) : " any \
                   : "CYCLES D'" (usetypes ? "EXÉCUTION ET DE TYPES" : "EXÉCUTION") " : " any
  shown = 0
  for (g = 1; g <= ngroup; g++) {
    hdr = 0
    for (i = 1; i <= ncyc; i++) {
      if (CYCG[i] != g || (only_types && !CYCT[i])) continue
      if (!hdr && !only_types) { print "  [cycle " g "]"; hdr = 1 }
      if (shown >= 40) continue
      print "    " CYC[i]; shown++
    }
  }
  if (any > 40) print "  ... " (any - 40) " autre(s), affichage limité à 40"
  if (!only_types) {
    nfreq = 0
    for (e in EFREQ) if (EFREQ[e] >= 2) nfreq++
    if (nfreq) {
      print ""; print "ARÊTES PRÉSENTES DANS PLUSIEURS CYCLES (à casser en priorité) :"
      fflush()
      cmd = "LC_ALL=C sort -k1,1nr | head -n 8"
      for (e in EFREQ) if (EFREQ[e] >= 2) { split(e, ab, SUBSEP); printf "  %3d cycles  %s -> %s\n", EFREQ[e], ab[1], ab[2] | cmd }
      close(cmd)
    }
  }
}

function show_list(title, arr, n,    i) {
  if (!n) return
  print ""; print title " (" n ") :"
  for (i = 1; i <= n; i++) print "  " arr[i]
}

# ============================================================ programme
BEGIN {
  for (i = 1; i < ARGC; i++) {
    f = ARGV[i]
    if (f ~ /\.m?js$/) { FSET[f] = 1; FL[++nf] = f }
    else if (f ~ /\.html$/) ISHTML[f] = 1
  }
}

FNR == 1 { if (cur != "") process(cur, buf); cur = FILENAME; buf = "" }
{ sub(/\r$/, ""); buf = buf $0 "\n" }

END {
  if (cur != "") process(cur, buf)
  resolve_all()

  MODE = usetypes ? 2 : 1
  analyze()
  show_levels()
  show_cycles(0)
  main_cycles = ncyc; main_groups = ngroup; main_levels = maxlv + 1

  if (!usetypes) {                      # cycles qui n'existent que via les types
    MODE = 2; analyze(); show_cycles(1)
  }

  show_list("IMPORTS INTROUVABLES", MISS, nmiss)
  show_list("EXTENSION .js OU index.js MANQUANTE (échoue dans le navigateur)", NOEXT, nnoext)
  show_list("SPÉCIFICATEURS NUS (nécessitent une import map)", BARE, nbare)

  nunreach = 0
  if (ne > 0) {
    reach(1)
    for (i = 1; i <= nf; i++) if (!(FL[i] in RV)) UNREACH[++nunreach] = FL[i]
    show_list("FICHIERS JAMAIS IMPORTÉS DEPUIS UNE PAGE HTML (code mort ?)", UNREACH, nunreach)
  } else {
    print ""; print "(aucun <script type=\"module\"> trouvé dans les .html : détection du code mort ignorée)"
  }

  print ""
  printf "%d fichier(s), %d niveau(x), %d groupe(s) cyclique(s), %d import(s) introuvable(s)\n", \
         nf, main_levels, main_groups, nmiss
  exit (main_cycles > 0 || nmiss > 0 || nnoext > 0) ? 1 : 0
}
AWK

awk -v usetypes="$TYPES" -v showdeps="$DEPS" "$AWK_PROG" "${FILES[@]}"
