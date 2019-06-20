# -*- coding: utf-8 -*-

from odoo import models, fields, api
from . import send_notifications

class Jogo(models.Model):
    _inherit = 'ges.jogo'

    @api.model
    def create(self, values):
		
        res = super(Jogo, self).create(values)
		
        context = self._context
        current_uid = context.get('uid')
        user = self.env['res.users'].browse(current_uid)
	
        # map with users ids
        # id: {treinador_seccionosta: false, atleta: false, filhos: [nomes...]}
        dados = {}
        naoUsarUserId = user.id
        
		# dados
        atletas = self.env['ges.atleta'].browse(values['atletas'][0][2])
        seccionistas = self.env['ges.seccionista'].browse(values['seccionistas'][0][2])
        treinadores = self.env['ges.treinador'].browse(values['treinador'][0][2])

        for atleta in atletas:
            if atleta.user_id.id not in dados:
                aux = {
                    'treinador_seccionista': False,
                    'atleta': True,
                    'filhos': []
                }
                dados[atleta.user_id.id] = aux
			
            for pai in atleta.pais:
                if pai.user_id.id not in dados:
                    aux = {
                        'treinador_seccionista': False,
                        'atleta': False,
                        'filhos': [atleta.user_id.name]
                    }
                    dados[pai.user_id.id] = aux
                else:
                    dados[pai.user_id.id]['filhos'].append(atleta.user_id.name)

        for seccionista in seccionistas:
            if seccionista.user_id.id not in dados:
                aux = {
					'treinador_seccionista': True,
					'atleta': False,
					'filhos': []
				}
                dados[seccionista.user_id.id] = aux
            else:
                dados[seccionista.user_id.id]['treinador_seccionista'] = True
		
        for treinador in treinadores:
            if treinador.user_id.id not in dados:
                aux = {
                    'treinador_seccionista': True,
                    'atleta': False,
                    'filhos': []
                }
                dados[treinador.user_id.id] = aux
            else:
                dados[treinador.user_id.id]['treinador_seccionista'] = True
		
        dados.pop(naoUsarUserId, None)

        notifications = []
		
        for dado in dados:

            if dados[dado]['treinador_seccionista'] and dados[dado]['atleta']:
                for token in self.env['res.users'].browse(dado).get_user_tokens():
                    notifications.append({
                        'to': token,
                        'title': 'Nova convocatória',
                        'body': 'Foste convocado como técnico e atleta para um novo jogo.'
                    })
            
            elif dados[dado]['treinador_seccionista'] and dados[dado]['filhos']:
                msg = 'Foste convocado como técnico para um novo jogo. '
                if (len(dados[dado]['filhos']) == 1):
                    msgAux = ' também foi convocado/a.'
                else:
                    msgAux = ' também foram convocados/as.'
                msg = msg + ', '.join(dados[dado]['filhos']) + msgAux
                for token in self.env['res.users'].browse(dado).get_user_tokens():
                    notifications.append({
                        'to': token,
                        'title': 'Nova convocatória',
                        'body': msg
                    })
            
            elif dados[dado]['treinador_seccionista']:
                for token in self.env['res.users'].browse(dado).get_user_tokens():
                    notifications.append({
                        'to': token,
                        'title': 'Nova convocatória',
                        'body': 'Foste convocado como técnico para um novo jogo.'
                    })
            
            elif dados[dado]['atleta']:
                for token in self.env['res.users'].browse(dado).get_user_tokens():
                    notifications.append({
                        'to': token,
                        'title': 'Nova convocatória',
                        'body': 'Foste convocado para um novo jogo.'
                    })
            
            elif dados[dado]['filhos']:
                if (len(dados[dado]['filhos']) == 1):
                    msgAux = ' foi convocado/a para um novo jogo.'
                else:
                    msgAux = ' foram convocados/as para um novo jogo.'
                msg = ', '.join(dados[dado]['filhos']) + msgAux
                for token in self.env['res.users'].browse(dado).get_user_tokens():
                    notifications.append({
                        'to': token,
                        'title': 'Nova convocatória',
                        'body': msg
                    })
        
        send_notifications.send_notifications(notifications)
		
        return res