# -*- coding: utf-8 -*-

from odoo import models, fields, api

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

        if (atleta_user_id != naoUsarUserId):
            self.env['res.users'].browse(atleta_user_id).send_notification(title='Lesão registada', msg='Foi adicionada uma nova lesão relacionada contigo.')

        for pai in atleta.pais:
            if (pai.user_id.id != naoUsarUserId):
                self.env['res.users'].browse(pai.user_id.id).send_notification(title='Lesão registada', msg='Foi adicionada uma nova lesão relacionada com ' + atleta.user_id.name + '.')

        return res