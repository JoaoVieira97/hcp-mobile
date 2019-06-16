# Odoo Installation on Ubuntu

Follow these instructions to install HCP Web App on Ubuntu machine.

## Download Odoo 11:

```bash
wget https://nightly.odoocdn.com/11.0/nightly/src/odoo_11.0.latest.tar.gz
mkdir ~/odoo
tar -xvzf odoo_11.0.latest.tar.gz -C ~/odoo --strip 1
```

---

## Install Python 3 and Virtual Environment

```bash
sudo apt-get install -y python3
sudo apt-get install -y python3-pip
sudo pip install --upgrade pip
pip install virtualenv
```

---

## Install dependencies

```bash
sudo apt-get install -y libxml2-dev libxslt-dev python3-dev
sudo apt-get install -y libsasl2-dev libldap2-dev libssl-dev
sudo apt-get install -y wkhtmltopdf
sudo apt-get install -y node-less
```

---

## Install Odoo 11

```bash
virtualenv -p python3 ~/.virtualenvs/hcpwebapp
source ~/.virtualenvs/hcpwebapp/bin/activate
cd ~/odoo
pip install -r requirements.txt
python setup.py install
pip install validate_email
pip install phonenumbers
```

---

## Run Odoo 11

```bash
# Let's assume that you have the "gestao_equipas" folder in the following directory:
ls $HOME/hcp-1/addons
# To run Odoo web server, just run the following command:
odoo --addons-path=~/.virtualenvs/hcpwebapp/lib/python3.6/site-packages/odoo-11.0.post20190227-py3.6.egg/odoo/addons/,$HOME/hcp-1/addons
```
