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
        else:
            raise models.ValidationError('Não está convocado!')