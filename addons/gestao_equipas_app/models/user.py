# -*- coding: utf-8 -*-

from odoo import models, fields, api
from validate_email import validate_email
from phonenumbers import is_valid_number, parse as parse_number


class User(models.Model):
    _inherit = 'res.users'

    tokens = fields.One2many('ges.token',
                            'user_id',
                            'Tokens')

    @api.multi
    def add_token(self, device, token):
        updated = False

        for t in self.tokens:
            dev = t.device
            # device already registered
            if (dev == device):
                tok = t.token
                # device registered but token changed
                if (tok != token):
                    self.write({
                        'tokens': [(1, int(t.id), {
                            'device': device,
                            'token': token
                        })]
                    })
                updated = True
                break

        # device not registered yet
        if (not updated):
            self.write({
                'tokens': [(0, 0, {
                    'device': device,
                    'token': token
                })]
            })

        list = []
        for token in self.tokens:
            info = {
                'device': token.device,
                'token': token.token,
            }
            list.append(info)
        return list
