# -*- coding: utf-8 -*-

from odoo import models, fields, api
from . import send_notifications

class Evento_Desportivo(models.Model):
    _inherit = 'ges.evento_desportivo'

    @api.model
    def alterar_disponibilidade(self, atleta):

        super(Evento_Desportivo, self).alterar_disponibilidade(atleta)

        context = self._context
        current_uid = context.get('uid')
        user = self.env['res.users'].browse(current_uid)
        naoUsarUserId = user.id

        nome = atleta.user_id.name

        users_to_notificate = []

        for treinador in self.treinador:
            users_to_notificate.append(treinador.user_id.id)
        for seccionista in self.seccionistas:
            users_to_notificate.append(seccionista.user_id.id)

        if naoUsarUserId in users_to_notificate:
            users_to_notificate.remove(naoUsarUserId)

        disponibilidade = ' para '
        linhas = list(filter(lambda linha: linha.atleta.id == atleta.id, self.convocatorias))
        if len(linhas) > 0:
            linha = linhas[0]
            if linha['disponivel']:
                disponibilidade = disponibilidade + '\'disponível\''
            else:
                disponibilidade = disponibilidade + '\'indisponível\''

        notifications = []

        for user in users_to_notificate:
            for token in self.env['res.users'].browse(user).get_user_tokens():
                notifications.append({
                    'to': token,
                    'title': 'Indisponibilidade de atleta',
                    'body': 'Foi alterada a disponibilidade do atleta ' + nome + disponibilidade + '.'
                })

        #print(notifications)
        
        send_notifications.send_notifications(notifications)

    def atleta_alterar_disponibilidade(self, atletaId):

        atleta = self.env['ges.atleta'].browse(atletaId)
        self.alterar_disponibilidade(atleta)