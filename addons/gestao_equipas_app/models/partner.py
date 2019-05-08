# -*- coding: utf-8 -*-

from odoo import models, fields, api
from validate_email import validate_email
from phonenumbers import is_valid_number, parse as parse_number


class Partner(models.Model):
    _name = 'res.partner'
    _inherit = 'res.partner'
    _description = 'Club Partner'
    _order = 'name'
    _rec_name = 'name'

    tokens = fields.One2many('ges.token',
                            'partner_id',
                            'Tokens')