# Odoo Installation on CentOS 7

Follow these instructions to install HCP Web App on CentOS 7 machine.

```bash
# Update packages
sudo yum clean all
sudo yum -y update
# Install Apache
sudo yum -y install httpd
sudo systemctl start httpd
sudo systemctl enable httpd
# Install Tmux
sudo yum -y install tmux
# Install Python 3.6
sudo yum -y install yum-utils
sudo yum -y groupinstall development
sudo yum -y install https://centos7.iuscommunity.org/ius-release.rpm
sudo yum -y install python36u
sudo yum -y install python36u-pip
sudo yum -y install python36u-devel
sudo yum -y install libxml2 libxml2-devel libxml2-python libxslt libxslt-devel
sudo yum -y install openldap-devel
sudo yum -y install nodejs-less
# Install PostgresSQL
sudo yum -y install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Install Odoo 11

```bash
# Download Odoo 11
wget http://nightly.odoocdn.com/11.0/nightly/src/odoo_11.0.latest.tar.gz
mkdir ~/odoo
tar -xvzf odoo_11.0.latest.tar.gz -C ~/odoo --strip 1
# Create a Virtual Environment
mkdir ~/.virtualenvs
python3.6 -m venv ~/.virtualenvs/hcpwebapp
# Activate Venv and Install Odoo
source ~/.virtualenvs/hcpwebapp/bin/activate
cd ~/odoo
pip install -r requirements.txt
pip install validate_email
pip install phonenumbers
python setup.py install
```

## Run Apache

- Create remote IP module config:

  ```bash
  sudo vim /etc/httpd/conf.d/remoteip.conf
  ```

- Paste the following:

  ```text
  LoadModule remoteip_module modules/mod_remoteip.so
  RemoteIPHeader X-Forwarded-For
  ```

- Create Odoo config:
  ```bash
  sudo vim /etc/httpd/conf.d/odoo.prod.conf
  ```
- Paste the following config:

  ```text
  <VirtualHost *:80>
    ServerName hcp-web.ddns.net
    ServerAlias www.hcp-web.ddns.net

    <Proxy *>
      Order deny,allow
      Allow from all
    </Proxy>

    ProxyRequests Off
    ProxyPass / http://127.0.0.1:8069/
    ProxyPassReverse / http://127.0.0.1:8069/

    <Location />
      Order allow,deny
      Allow from all
    </Location>
  </VirtualHost>
  ```

- Set httpd connections and restart it

  ```bash
  sudo /usr/sbin/setsebool -P httpd_can_network_connect 1
  sudo systemctl restart httpd
  ```

## Run Odoo

- Start Odoo 11
  ```bash
  odoo --addons-path=~/.virtualenvs/hcpwebapp/lib/python3.6/site-packages/odoo-11.0.post20190616-py3.6.egg/odoo/addons/,$HOME/hcp/hcp-old/addons,$HOME/hcp/hcp-new/addons
  ```
- Restore Database
- Login as Admin
- Go to 'Apps'
- Remove the 'Apps' filter on the search bar
- Update Apps List on left side panel
- Search for your new module
- Click on it and install the module
- You're done
