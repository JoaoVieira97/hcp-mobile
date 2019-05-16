# -*- coding: utf-8 -*-
from odoo import http

# class GestaoEquipasApp(http.Controller):
#     @http.route('/gestao_equipas_app/gestao_equipas_app/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/gestao_equipas_app/gestao_equipas_app/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('gestao_equipas_app.listing', {
#             'root': '/gestao_equipas_app/gestao_equipas_app',
#             'objects': http.request.env['gestao_equipas_app.gestao_equipas_app'].search([]),
#         })

#     @http.route('/gestao_equipas_app/gestao_equipas_app/objects/<model("gestao_equipas_app.gestao_equipas_app"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('gestao_equipas_app.object', {
#             'object': obj
#         })