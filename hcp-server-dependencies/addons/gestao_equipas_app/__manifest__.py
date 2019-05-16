# -*- coding: utf-8 -*-
{
    'name': "gestao_equipas_app",

    'summary': """
        Extensão do módulo 'gestao_equipas' para adicionar novas funcionalidades""",

    'description': """
        Extensão do módulo 'gestao_equipas' para adicionar novas funcionalidades como:
		- Enviar notificações, em que cada utilizador possui um conjunto de tokens
    """,

    'author': "João Vieira, Hugo Oliveira, Raphael Oliveira",
    'website': "https://github.com/oliveirahugo68/hcp-mobile/",

    'category': 'Uncategorized',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base', 'gestao_equipas'],

    # always loaded
    'data': [
        'security/ir.model.access.csv',
        #'views/views.xml',
        #'views/templates.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        #'demo/demo.xml',
    ],
}
