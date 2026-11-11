// ui/component/factory_editor_comp.js

/**
 * @import {DestroyFunction} from "./core/utils.js"
 * @import {FlowConnectionID, MachineID} from "../../engine/core/ids.types.js"
 * @import {RecipeID} from "../../engine/item/recipe.js"
 * @import {Machine} from "../../engine/machine/machine.types.js"
 * @import {Res} from "../../utils/result.js"
 */
/** @import { EnumKey } from "../../utils/enum.js" */
import { enginesignal_on } from "../../engine/core/signal/signal.js";
import { world_connect_machines, world_disconnect_machines, world_set_flow_connection_limit, world_set_machine_recipe } from "../../engine/core/world/world.js";
import { RECIPE } from "../../engine/item/recipe.js";
import { CONNECTION_KIND } from "../../engine/machine/flow_connection.js";
import { MACHINE, machine_can_use_recipe, machine_node } from "../../engine/machine/machine.js";
import { assert } from "../../utils/assert.js";
import { enum_create, enum_is_enum_key, enum_keys } from "../../utils/enum.js";
import { repository_get } from "../../utils/repository.js";
import { err, result_is_err } from "../../utils/result.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { utils_assert_unreachable, utils_string_to_rkind } from "../../utils/utils.js";
import { uisignal_on } from "../core/signal/signal.js";
import { store_get } from "../core/store/store.js";
import { uistate_add_log } from "../core/ui_state/ui_state.js";
import { comp_create_comp, comp_delegate_change_with_enum, comp_delegate_click_with_enum } from "./core/comp.js";

const __CLICK_ACTIONS = enum_create(/** @type {const} */ ([
    "CONNECT",
    "DISCONNECT",
]));
/** @typedef {EnumKey<typeof __CLICK_ACTIONS>} ClickAction */

const __CHANGE_ACTIONS = enum_create(/** @type {const} */ ([
    "SET_RECIPE",
    "SET_LIMIT",
]));
/** @typedef {EnumKey<typeof __CHANGE_ACTIONS>} ChangeAction */

/** @returns {string} */
function __factoryeditorcomp_render() {
    return `
<h2>Éditeur usine</h2>
<div class="factory-editor-status"></div>
recettes: <div class="factory-editor-machines"></div>
connexions: <div class="factory-editor-connections"></div>
nouvelle connexion: <div class="factory-editor-new-connection"></div>
    `;
}

/** @param {HTMLElement} element */
function __factoryeditorcomp_update(element) {
    const { world, ui_state } = store_get();
    const entity_id = ui_state.selected_entity_id;
    const entity = entity_id === undefined ? undefined : repository_get(world.entity_repo, entity_id);
    const room = entity && repository_get(world.galaxy.room_repo, entity.room_id);
    const status = element.querySelector(".factory-editor-status");
    const machines_list = element.querySelector(".factory-editor-machines");
    const connections_list = element.querySelector(".factory-editor-connections");
    const new_connection = element.querySelector(".factory-editor-new-connection");
    assert(status && machines_list && connections_list && new_connection, "Missing factory editor fields");
    const machines = (room?.machines ?? []).map(machine_id => undefined_unwrap(repository_get(world.machine_repo, machine_id)));
    status.textContent = !room ? "Aucune entité sélectionnée" : machines.length ? `Salle #${room.id} ${room.name}` : "Aucune machine dans cette salle";
    const connections = world.flow_connection_repo.elements.filter(connection =>
        room?.machines.includes(connection.from) && room.machines.includes(connection.to));

    machines_list.innerHTML = machines.map(machine => {
        const node = machine_node(world.galaxy.room_repo, machine);
        const options = MACHINE[machine.kind].recipes.filter(recipe_id => machine_can_use_recipe(machine, node, recipe_id))
            .map(recipe_id => __factoryeditorcomp_option(recipe_id, recipe_id, recipe_id === machine.recipe_id));
        return `<div>${__factoryeditorcomp_machine_label(machine)}
<select data-change-action="${__CHANGE_ACTIONS.SET_RECIPE}" data-machine-id="${machine.id}">
${__factoryeditorcomp_option("", "sans recette", machine.recipe_id === undefined)}${options.join("")}
</select></div>`;
    }).join("");

    connections_list.innerHTML = connections.map(connection => `<div>#${connection.id} ${connection.kind} ${connection.from} -> ${connection.to}
limite <input type="number" min="0" step="1" value="${connection.manual_throughput_limit}" data-change-action="${__CHANGE_ACTIONS.SET_LIMIT}" data-connection-id="${connection.id}">
/ ${connection.max_throughput}
<button data-action="${__CLICK_ACTIONS.DISCONNECT}" data-connection-id="${connection.id}">Supprimer</button></div>`).join("");

    const machine_options = machines.map(machine => __factoryeditorcomp_option(String(machine.id), __factoryeditorcomp_machine_label(machine), false)).join("");
    new_connection.innerHTML = machines.length < 2 ? "" : `<select class="connect-from">${machine_options}</select>
-> <select class="connect-to">${machine_options}</select>
<select class="connect-kind">${enum_keys(CONNECTION_KIND).map(kind => __factoryeditorcomp_option(kind, kind, false)).join("")}</select>
<button data-action="${__CLICK_ACTIONS.CONNECT}">Connecter</button>`;
}

/**
 * @param {Machine} machine
 * @returns {string}
 */
function __factoryeditorcomp_machine_label(machine) {
    return `#${machine.id} ${machine.kind}`;
}

/**
 * @param {string} value
 * @param {string} label
 * @param {boolean} selected
 * @returns {string}
 */
function __factoryeditorcomp_option(value, label, selected) {
    return `<option value="${value}"${selected ? " selected" : ""}>${label}</option>`;
}

/**
 * @param {HTMLElement} element
 * @param {ClickAction} action
 * @param {HTMLElement} target
 */
function __factoryeditorcomp_handle_click(element, action, target) {
    const world = store_get().world;
    /** @type {Res<unknown, string>} */
    let result;
    switch (action) {
        case __CLICK_ACTIONS.CONNECT: {
            const from = element.querySelector(".connect-from");
            const to = element.querySelector(".connect-to");
            const kind = element.querySelector(".connect-kind");
            assert(from instanceof HTMLSelectElement && to instanceof HTMLSelectElement && kind instanceof HTMLSelectElement,
                "Missing connection fields");
            result = enum_is_enum_key(CONNECTION_KIND, kind.value)
                ? world_connect_machines(world, utils_string_to_rkind(from.value), utils_string_to_rkind(to.value), kind.value)
                : err(`Unknown connection kind: ${kind.value}`);
            break;
        }
        case __CLICK_ACTIONS.DISCONNECT:
            result = world_disconnect_machines(world, utils_string_to_rkind(target.dataset.connectionId));
            break;
        default:
            utils_assert_unreachable(action);
    }
    __factoryeditorcomp_report(element, result);
}

/**
 * @param {HTMLElement} element
 * @param {ChangeAction} action
 * @param {HTMLElement} target
 */
function __factoryeditorcomp_handle_change(element, action, target) {
    assert(target instanceof HTMLSelectElement || target instanceof HTMLInputElement, "Invalid factory editor field");
    const world = store_get().world;
    /** @type {Res<unknown, string>} */
    let result;
    switch (action) {
        case __CHANGE_ACTIONS.SET_RECIPE: {
            /** @type {MachineID} */
            const machine_id = utils_string_to_rkind(target.dataset.machineId);
            if (target.value === "") result = world_set_machine_recipe(world, machine_id, undefined);
            else if (Object.hasOwn(RECIPE, target.value)) result = world_set_machine_recipe(world, machine_id, /** @type {RecipeID} */ (target.value));
            else result = err(`Unknown recipe: ${target.value}`);
            break;
        }
        case __CHANGE_ACTIONS.SET_LIMIT: {
            /** @type {FlowConnectionID} */
            const connection_id = utils_string_to_rkind(target.dataset.connectionId);
            result = world_set_flow_connection_limit(world, connection_id, Number(target.value));
            break;
        }
        default:
            utils_assert_unreachable(action);
    }
    __factoryeditorcomp_report(element, result);
}

/**
 * @param {HTMLElement} element
 * @param {Res<unknown, string>} result
 */
function __factoryeditorcomp_report(element, result) {
    if (!result_is_err(result)) return;
    uistate_add_log(store_get().ui_state, result.error);
    __factoryeditorcomp_update(element);
}

/**
 * @param {HTMLElement} container
 * @returns {{element: HTMLElement, destroy: DestroyFunction}}
 */
export function factoryeditorcomp_mount(container) {
    return comp_create_comp(container, "factory-editor-comp", (element, add_cleanup) => {
        element.innerHTML = __factoryeditorcomp_render();
        add_cleanup(comp_delegate_click_with_enum(element, __CLICK_ACTIONS, (action, _event, target) => {
            __factoryeditorcomp_handle_click(element, action, target);
        }));
        add_cleanup(comp_delegate_change_with_enum(element, __CHANGE_ACTIONS, (action, _event, target) => {
            __factoryeditorcomp_handle_change(element, action, target);
        }));
        const update = () => __factoryeditorcomp_update(element);
        add_cleanup(enginesignal_on("entity.room_id.changed", update));
        add_cleanup(enginesignal_on("room.content.removed", update));
        add_cleanup(enginesignal_on("room.machines.added", update));
        add_cleanup(enginesignal_on("room.machines.removed", update));
        add_cleanup(enginesignal_on("machine.recipe_id.changed", update));
        add_cleanup(enginesignal_on("flow_connection.added", update));
        add_cleanup(enginesignal_on("flow_connection.removed", update));
        add_cleanup(enginesignal_on("flow_connection.manual_throughput_limit.changed", update));
        add_cleanup(uisignal_on("ui_state.selected_entity_id.changed", update));
        update();
    });
}
