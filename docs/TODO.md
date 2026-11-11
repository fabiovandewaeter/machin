# 1
- ajouter recréation des connexions des machines dans world_restore

# 2
- Ajouter le système de graphe orienté sans cycles pour créer l'usine
- Il faut travailler uniquement avec des entiers donc les débits seront surement en grammes ou millilitres pour avoir des gros nombres et ne pas avoir de floats
- En débits une machine prend soit 100% de ce qu'elle prendre, sinon max(besoin, disponnible), et si au moins une de ses entrées n'est pas satisfaite à 100% on brise sa consommation sur les autres entrées et sa production proportionellement (il faut garder des entiers donc voir comment faire)
  Stockage

  Types
  - ids.types.js : ajouter un FlowConnectionID.
  - flow_connection.js : un seul type FlowConnection, avec id, kind, from: MachineRef, to: MachineRef,
    max_throughput, manual_throughput_limit et throughput. Il remplace FlowConnectionBase et ses variantes Belt et
    Pipe tant qu'elles n'ont pas de champs propres.
  - throughput : c'est le résultat du calcul. Au chargement, on le recalcule au lieu de faire confiance à la valeur
    sauvegardée.

  Données dans World
  - flow_connection_repo : la seule source de vérité pour les connexions.
  - Repo des machines : il en faut aussi un, au moins extractor_repo, sinon on ne peut pas vérifier qu'une
    MachineRef existe.
  - machineref_key(ref) : renvoie `${kind}:${id}`. Elle va dans machine.js, puisque c'est du code exécuté et pas un
    type.

  Fonctions bas niveau, qui modifient le repo sans rien vérifier :
  - flowconnection_spawn(repo, { kind, from, to, max_throughput }) ;
  - flowconnection_remove(repo, id). 
  
  API du monde (world.js, renvoie un Res, vérifie tout avant de modifier quoi que ce soit, puis fait un seul batch)
  - world_connect_machines(world, from, to, kind) : les deux machines existent, from !== to, la même connexion
    n'existe pas déjà, aucun cycle n'est créé. Ensuite on crée la connexion puis on recalcule les débits.
  - world_disconnect_machines(world, connection_id) : on retire la connexion puis on recalcule les débits.
  - Suppression d'une machine : retirer aussi toutes ses connexions.

  Signaux à ajouter à la table
  - "flow_connection.added" et "flow_connection.removed", avec un payload { flow_connection_id } ;
  - "flow_connection.throughput.changed".

  Chargement (world_restore)
  - Pour chaque connexion : kind fait parti Jump to bottom (ctrl+End) ↓ bres sont finis et ≥ 0, from et to
    existent, et une connexion ne relie pas une machine à elle-même.
  - Le graphe entier ne contient aucun cycle.
  - On recalcule ensuite les débits, et on incrémente la version de save.
 
  Calcul (par exemple engine/machine/flow.js)

  Une fonction flow_compute(world), appelée après toute modification (connexion, déconnexion, ajout ou retrait de
  machine, changement de limite) et au chargement. On pourra l'appeler à chaque tick plus tard, si la production
  varie dans le temps.

  1. Adjacence : on construit outgoing et incoming à partir de la table, dans une variable locale qui n'est jamais
     stockée.
  2. Ordre topologique : algorithme de Kahn (un tri topologique). Si toutes les machines ne sont pas traitées, il y
     a un cycle, ce qui est une erreur interne.
  3. Passe des demandes, dans l'ordre topologique inverse :
     - la demande d'une machine est son besoin propre plus la somme des demandes de ses sorties ;
     - la demande d'une connexion est le minimum entre la demande en aval, max_throughput et
       manual_throughput_limit.
  4. Passe des débits, dans l'ordre topologique :
     - ce qui est disponible pour une machine est sa production plus ce qu'elle reçoit en entrée ;
     - on le répartit entre ses connexions sortantes, et throughput ne dépasse jamais la demande de la connexion.
  5. Écriture : on écrit throughput dans la table et on émet throughput.changed uniquement pour les valeurs
     modifiées, le tout dans un batch.
     
  Une décision de game design reste à prendre : quand l'offre est inférieure à la demande, faut-il répartir
  proportionnellement, ou par ordre de priorité entre les connexions ?
 
  Vérification des cycles

  - À la connexion : avant d'ajouter from → to, on regarde si from est atteignable depuis to, par un parcours en
    largeur sur outgoing avec un ensemble des machines déjà visitées. Si c'est le cas, ou si from === to, on
    renvoie err sans rien modifier.
  - Au chargement : on lance Kahn sur tout le graphe. S'il reste des machines non traitées, la save est refusée.
  - Dans flow_compute : un assert vérifie que Kahn a bien traité toutes les machines. Ça ne devrait jamais échouer
    si les deux vérifications précédentes sont en place.
   
  Tests à prévoir

  - Connecter puis déconnecter, avec vérification des signaux.
  - Refus d'un cycle direct (A→B→A), indirect (A→B→C→A), d'une connexion d'une machine vers elle-même, et d'une
    connexion en double.
  - Refus d'une save contenant un cycle ou une référence vers une machine inexistante.
  - Débits : offre suffisante, offre limitée, limite manuelle, et chaîne de machines en série.

# 4
- vérifier quand chargement qu'on utilise que des trucs qui existent par exemple les crafts ou effets ou autres dans timeline

