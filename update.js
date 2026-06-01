// @ts-check
// update.js

/**
 * @param {Model} model
 * @param {Msg} msg
 * @returns {Model} 
 */
export function update(model, msg) {
    switch (msg.type) {
        case "increment":
            return {
                ...model,
                count: model.count + msg.amount,
                logs: [...model.logs, `${msg.type} ${msg.amount}`]
            }
        case "decrement":
            return {
                ...model,
                count: model.count - msg.amount,
                logs: [...model.logs, `${msg.type} ${msg.amount}`]
            }
    }
}
