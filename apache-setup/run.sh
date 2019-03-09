#!/bin/bash

# VARIABLES
# -----------------------------------------------------------------------
RED='\033[0;31m'  # red color
GRE='\033[0;32m'  # green color
YEL='\033[1;33m'  # yellow color
NC='\033[0m'      # no color

# RUN
# -----------------------------------------------------------------------
if [[ $1 == start ]]; then
      # change config files
      sudo cp odoo.prod.conf /etc/apache2/sites-available
      cd /etc/apache2/sites-available
      sudo a2dissite * &>/dev/null
      sudo a2ensite odoo.prod.conf &>/dev/null
      sudo a2enmod proxy &>/dev/null
      sudo a2enmod proxy_http &>/dev/null
      # sudo a2enmod remoteip &>/dev/null
      sudo systemctl reload apache2
      echo -e "${GRE}✔ Odoo server config was deployed. Running at port 80!${NC}"
      echo -e "${GRE}✔ ${NC}Done!"
      exit 0

elif [[ $1 == stop ]]; then
      cd /etc/apache2/sites-available
      sudo a2dissite odoo.prod.conf &>/dev/null
      sudo a2dissite proxy &>/dev/null
      sudo a2dissite proxy_http &>/dev/null
      # sudo a2dissite remoteip &>/dev/null
      sudo systemctl reload apache2
      echo -e "${GRE}✔ Odoo server is no longer being proxied!${NC}"
      echo -e "${GRE}✔ ${NC}Done!"
      exit 0
else
      echo -e "${RED}✗ Wrong arguments!${NC}"
      echo -e "\t${GRE}✔${NC} ./run.sh start"
      echo -e "\t${GRE}✔${NC} ./run.sh stop"
      exit 1
fi

# INFORMATION
# -----------------------------------------------------------------------
# /var/log/apache2/access.log
# /var/log/apache2/error.log
