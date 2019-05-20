# -*- coding: utf-8 -*-

from odoo import models, fields, api

class T(models.Model):
    _inherit = 'ges.treino'

    @api.model
    def create(self, values):
        
        res = super(T, self).create(values)
        
        atletas = self.env['ges.atleta'].browse(values['atletas'][0][2])
        seccionistas = self.env['ges.seccionista'].browse(values['seccionistas'][0][2])
        treinadores = self.env['ges.treinador'].browse(values['treinador'][0][2])
        
        user_ids = []
        for atleta in atletas:
            user_ids.append(atleta.user_id.id)
        for seccionista in seccionistas:
            user_ids.append(seccionista.user_id.id)
        for treinador in treinadores:
            user_ids.append(treinador.user_id.id)

        # print(str(user_ids))
        for user in user_ids:
            self.env['res.users'].browse(user).send_notification(title='Novo evento', msg='Foste convocado para um novo treino')

        for atleta in atletas:
            pais = []
            for pai in atleta.pais:
                pais.append(pai.user_id.id)
            print(pais)
            for pai in pais:
                self.env['res.users'].browse(pai).send_notification(title='Novo evento', msg=atleta.user_id.name + ' foi convocado para um novo treino')

        return res