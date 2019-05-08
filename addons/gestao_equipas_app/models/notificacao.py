# -*- coding: utf-8 -*-

from odoo import models, fields, api
import requests

lista = {}

class Notificacao(models.Model):
    _name = 'ges.notificacao'
    _description = 'Notificacao'

    def addUserToken(self, user, token):
        lista[user] = token
        print("----------------------------")
        print("Adicionado o utilizador " + user + " com o token " + token)
        print(str(lista))
        print("----------------------------")

    def sendNotification(self, user):
        url = 'https://exp.host/--/api/v2/push/send'
        body = {
            'to': lista[user],
            'title': 'Nova convocatória (Odoo)',
            'body': 'Foste convocado para o jogo deste fim-de-semana'
        }
        headers = {'Content-Type': 'application/json'}
        requests.post(url, body, headers)
        print("Notificação enviada")

    def sendNotificationToUser(self, userS, userD):
        url = 'https://exp.host/--/api/v2/push/send'
        body = {
            'to': lista[userD],
            'title': 'Nova notificação',
            'body': 'Utilizador ' + userS + ' mandou-te um alerta'
        }
        headers = {'Content-Type': 'application/json'}
        requests.post(url, body, headers)
        print("Notificação enviada")
