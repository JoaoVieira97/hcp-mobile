# -*- coding: utf-8 -*-

from odoo import models, fields, api

class Token(models.Model):
    _name = 'ges.token'
    _description = 'Token'
    _order = 'token'
    _rec_name = 'token'

    device = fields.Char('Device', required=True)
    token = fields.Char('Token', required=True)

    user_id = fields.Many2one('res.users',
                                'User',
                                ondelete='cascade')
