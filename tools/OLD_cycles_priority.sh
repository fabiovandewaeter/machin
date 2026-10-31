#!/usr/bin/env bash
# tools/OLD_cycles_priority.sh

bash tools/cycles.sh .

echo ""
echo "PRIORITY"
bash tools/cycles.sh | grep -- '->' | sed 's/^ *//' \
  | awk -F' -> ' '{for(i=1;i<NF;i++) print $i " -> " $(i+1)}' \
  | sort | uniq -c | sort -rn
