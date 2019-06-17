# -*- coding: utf-8 -*-

from odoo import models, fields, api
import requests
from . import send_notifications

class Lesao(models.Model):
    _inherit = 'ges.lesao'

    @api.model
    def create(self, values):

        res = super(Lesao, self).create(values)

        context = self._context
        current_uid = context.get('uid')
        user = self.env['res.users'].browse(current_uid)
        naoUsarUserId = user.id

        atleta = self.env['ges.atleta'].browse(values['atleta'])
        atleta_user_id = atleta.user_id.id

        notifications = []

        print(self.env['res.users'].browse(atleta_user_id).get_user_tokens())

        if (atleta_user_id != naoUsarUserId):
            for token in self.env['res.users'].browse(atleta_user_id).get_user_tokens():
                notifications.append({
                    'to': token,
                    'title': 'Lesão registada',
                    'body': 'Foi adicionada uma nova lesão relacionada contigo.'
                })

        for pai in atleta.pais:
            if (pai.user_id.id != naoUsarUserId):
                for token in self.env['res.users'].browse(pai.user_id.id).get_user_tokens():
                    notifications.append({
                        'to': token,
                        'title': 'Lesão registada',
                        'body': 'Foi adicionada uma nova lesão relacionada com ' + atleta.user_id.name + '.'
                    })

        print(notifications)
        
        send_notifications.send_notifications(notifications)

        return res