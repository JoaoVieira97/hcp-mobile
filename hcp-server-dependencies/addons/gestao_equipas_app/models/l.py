# -*- coding: utf-8 -*-

from odoo import models, fields, api

class L(models.Model):
    _inherit = 'ges.lesao'

    @api.model
    def create(self, values):
        
        res = super(L, self).create(values)

        atleta = self.env['ges.atleta'].browse(values['atleta'])
        atleta_user_id = atleta.user_id.id

        self.env['res.users'].browse(atleta_user_id).send_notification(title='Lesão registada', msg='Foi adicionada uma nova lesão relacionada contigo')

        pais = []
        for pai in atleta.pais:
            pais.append(pai.user_id.id)

        for pai in pais:
            self.env['res.users'].browse(pai).send_notification(title='Lesão registada', msg='Foi adicionada uma nova lesão relacionada com ' + atleta.user_id.name)

        return res