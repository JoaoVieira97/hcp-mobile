![alt text](http://hcpenafiel.pt/assets/images/logo.png 'Hóquei Clube Penafiel')

# "Hóquei Clube Penafiel" Mobile Application

Software Labs Project 2019/20, Computer and Software Engineering Course @ University of Minho, Braga - Portugal

This mobile app is being developed using [React Native](https://facebook.github.io/react-native/) and [Redux](https://redux.js.org/introduction/getting-started).

Web App version can be found [here](https://github.com/git-antoniosousa/hcp-1), although this is a **private** repository.

<br >

## Contributors

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/oliveirahugo68">
        <img src="https://avatars3.githubusercontent.com/u/29900750?s=460&v=4" width="100px;" alt="Hugo Oliveira"/>
        <br />
        <sub><b>Hugo Oliveira</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/raphael28">
        <img src="https://avatars2.githubusercontent.com/u/43729094?s=460&v=4" width="100px;" alt="Raphael Oliveira"/>
        <br />
        <sub><b>Raphael Oliveira</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/JoaoVieira97">
        <img src="https://avatars2.githubusercontent.com/u/34378224?s=460&v=4" width="100px;" alt="João Vieira"/>
        <br />
        <sub><b>João Vieira</b>
      </a>
    </td>
  </tr>
</table>

<br >

## Create a new Odoo module _gestao_equipas_app_

```bash
# Activate Virtual Environment
source ~/.virtualenvs/hcpwebapp/bin/activate
```

```bash
# Assuming that you have the "gestao_equipas" folder in the following directory:
ls $HOME/hcp-1/addons
# Assuming that you want to have "gestao_equipas_app" folder in the following directory:
ls $HOME/hcp-mobile/hcp-server-dependencies/addons

# Create gestao_equipas_app module
odoo scaffold gestao_equipas_app addons
```

## Install the _gestao_equipas_app_ module

```bash
# Run Odoo with specific addons
odoo --addons-path=~/.virtualenvs/hcpwebapp/lib/python3.6/site-packages/odoo-11.0.post20190616-py3.6.egg/odoo/addons/,$HOME/hcp-1/addons,$HOME/hcp-mobile/hcp-server-dependencies/addons
```

- Access Odoo Web Interface and install new module:
  - Login as Admin
  - Go to 'Apps'
  - Remove the 'Apps' filter on the search bar
  - Update Apps List on left side panel
  - Search for your new module > "gestao_equipas_app"
  - Click on it and install the module
