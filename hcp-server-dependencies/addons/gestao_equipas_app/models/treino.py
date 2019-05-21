# -*- coding: utf-8 -*-

from odoo import models, fields, api

class Treino(models.Model):
    _inherit = 'ges.treino'

    @api.model
    def create(self, values):
		
        res = super(Treino, self).create(values)
		
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
            else:
                dados[seccionista.user_id.id]['treinador_seccionista'] = True
		
        for treinador in treinadores:
            if treinador.user_id.id not in dados:
                aux = {
                    'treinador_seccionista': True,
                    'atleta': False,
                    'filhos': []
                }
            else:
                dados[treinador.user_id.id]['treinador_seccionista'] = True
		
        dados.pop(naoUsarUserId, None)
		
        for dado in dados:
            if dados[dado]['treinador_seccionista'] and dados[dado]['atleta']:
                self.env['res.users'].browse(dado).send_notification(title='Nova convocatória', msg='Foste convocado como técnico e atleta para um novo treino.')
            elif dados[dado]['treinador_seccionista'] and dados[dado]['filhos']:
                msg = 'Foste convocado como técnico para um novo treino. '
                if (len(dados[dado]['filhos']) == 1):
                    msgAux = ' também foi convocado/a.'
                else:
                    msgAux = ' também foram convocados/as.'
                msg = msg + ', '.join(dados[dado]['filhos']) + msgAux
                self.env['res.users'].browse(dado).send_notification(title='Nova convocatória', msg=msg)
            elif dados[dado]['treinador_seccionista']:
                self.env['res.users'].browse(dado).send_notification(title='Nova convocatória', msg='Foste convocado como técnico para um novo treino.')
            elif dados[dado]['atleta']:
                self.env['res.users'].browse(dado).send_notification(title='Nova convocatória', msg='Foste convocado para um novo treino.')
            elif dados[dado]['filhos']:
                if (len(dados[dado]['filhos']) == 1):
                    msgAux = ' foi convocado/a para um novo treino.'
                else:
                    msgAux = ' foram convocados/as para um novo treino.'
                msg = ', '.join(dados[dado]['filhos']) + msgAux
                self.env['res.users'].browse(dado).send_notification(title='Nova convocatória', msg=msg)
		
        return res