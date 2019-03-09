// ODOO actions

export function setOdooInstance(odoo) {
    return {
        type: 'SET_ODOO_CONNECTION_INSTANCE',
        odoo: odoo
    }
}
