# -*- coding: utf-8 -*-

from odoo import models, fields, api
from . import send_notifications
from datetime import datetime
from pytz import timezone

class Evento_Desportivo(models.Model):
    _inherit = 'ges.evento_desportivo'

    @api.model
    def alterar_disponibilidade(self, atleta):

        super(Evento_Desportivo, self).alterar_disponibilidade(atleta)

        linhas = list(filter(lambda linha: linha.atleta.id == atleta.id, self.convocatorias))
        if len(linhas) > 0:
            
            linha = linhas[0]

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

            nome_evento = self.calendar_event.evento_ref._description
            evento_datetime = datetime.strptime(self.calendar_event.display_start, '%Y-%m-%d %H:%M:%S').astimezone(timezone('Europe/Lisbon')).strftime('%d/%m/%Y %HH%M')
            datetime_split = evento_datetime.split(" ")
            evento_data = datetime_split[0]
            evento_horas = datetime_split[1]
            disponibilidade = ''
            titulo = ''
            if linha['disponivel']:
                disponibilidade = disponibilidade + '\'disponível\''
                titulo = 'Disponibilidade de atleta'
            else:
                disponibilidade = disponibilidade + '\'indisponível\''
                titulo = 'Indisponibilidade de atleta'

            notifications = []

            for user in users_to_notificate:
                for token in self.env['res.users'].browse(user).get_user_tokens():
                    notifications.append({
                        'to': token,
                        'title': titulo,
                        'body': 'Foi alterada a disponibilidade do atleta ' + nome + ' para ' + disponibilidade + ' no ' + nome_evento + ' de dia ' + evento_data + ' às ' + evento_horas + '.'
                    })

            #print(notifications)
            
            send_notifications.send_notifications(notifications)

    def atleta_alterar_disponibilidade(self, atletaId):

        atleta = self.env['ges.atleta'].browse(atletaId)
        self.alterar_disponibilidade(atleta)