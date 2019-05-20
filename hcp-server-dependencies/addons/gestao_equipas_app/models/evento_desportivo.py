# -*- coding: utf-8 -*-

from odoo import models, fields, api

class Evento_Desportivo(models.Model):
    _inherit = 'ges.evento_desportivo'

    def atleta_alterar_disponibilidade(self, atletaId):
        linhas = list(filter(lambda linha: linha.atleta.id == atletaId, self.convocatorias))
        if len(linhas) > 0:
            linha = linhas[0]
            linha.write({
                'disponivel': not linha.disponivel
            })
            context = self._context
            current_uid = context.get('uid')
            user_test = self.env['res.users'].browse(current_uid)
            print(user_test.id)
            print(self.display_name)
            atleta = self.env['ges.atleta'].browse(atletaId)
            nome = atleta.user_id.name
            users_to_notificate = []
            for treinador in self.treinador:
                users_to_notificate.append(treinador.user_id.id)
            for seccionista in self.seccionistas:
                users_to_notificate.append(seccionista.user_id.id)
            for user in users_to_notificate:
                self.env['res.users'].browse(user).send_notification(title='Indisponibilidade de atleta', msg='Foi alterada a disponibilidade do atleta ' + nome)
        else:
            raise models.ValidationError('Não está convocado!')