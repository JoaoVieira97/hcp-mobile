![alt text](http://hcpenafiel.pt/assets/images/logo.png "Hóquei Clube Penafiel")

# "Hóquei Clube Penafiel" Mobile Application


`Software Labs Project` 2019/20, Computer and Software Engineering Course @ University of Minho, Braga - Portugal

This mobile app is being developed using [React Native](https://facebook.github.io/react-native/).

Web App version can be found [here](https://github.com/git-antoniosousa/hcp-1), although this is a **private** repository.

<br >

## Odoo Installation

Download Odoo 11:

```bash
wget https://nightly.odoocdn.com/11.0/nightly/src/odoo_11.0.latest.tar.gz
mkdir ~/odoo
tar -xvzf odoo_11.0.latest.tar.gz -C ~/odoo --strip 1
```
___
Install Python 3 and Virtual Environment

```bash
sudo apt-get install -y python3
sudo apt-get install -y python3-pip
sudo pip install --upgrade pip
pip install virtualenv
```
___
Install dependencies

```bash
sudo apt-get install -y libxml2-dev libxslt-dev python3-dev
sudo apt-get install -y libsasl2-dev libldap2-dev libssl-dev
sudo apt-get install -y wkhtmltopdf
sudo apt-get install -y node-less
```
___
Install Odoo 11

```bash
virtualenv -p python3 ~/.virtualenvs/hcpwebapp
source ~/.virtualenvs/hcpwebapp/bin/activate
cd ~/odoo
pip install -r requirements.txt
python setup.py install
pip install validate_email
pip install phonenumbers
```
___
Run Odoo 11
```bash
# Let's assume that you have the "gestao_equipas" folder in the following directory:
ls $HOME/hcp-1/addons
# To run Odoo web server, just run the following command:
odoo --addons-path=~/.virtualenvs/hcpwebapp/lib/python3.6/site-packages/odoo-11.0.post20190227-py3.6.egg/odoo/addons/,$HOME/hcp-1/addons
```

<br >


## Requirements (Linux)

Install Node.js and NPM.

```bash
sudo apt-get install -y nodejs
sudo apt-get install -y libssl1.0-dev
sudo apt-get install -y nodejs-dev
sudo apt-get install -y node-gyp
sudo apt-get install -y npm

# Install the React Native Command Line Interface
sudo npm install -g react-native-cli
# Install the Expo Command Line Interface
sudo npm install -g expo-cli
```
___
Install Java SE Development Kit 8 (Java JDK).

```bash
sudo apt install -y openjdk-8-jdk
sudo apt install -y openjdk-8-jre

# Set Java 8 if it is not the default
sudo update-alternatives --config java
```
___
Download and Install [Android Studio](https://developer.android.com/studio/index.html). Make sure to check the following boxes `Android SDK`, `Android SDK Platform` and `Android Virtual Device` (for Android Virtual Device Manager), during installation.

Install the Android SDK. Android SDKs can be installed through the SDK Manager in Android Studio.

```
Install Android 9 (Pie) | Android SDK Platform 28
```
___
Configure the ANDROID_HOME environment variable.
Add the following to your `bash profile` config file:
  * using default bash go to `$HOME/.bashrc`
  * using zsh go to `$HOME/.zshrc`
  
  ```
  export ANDROID_HOME=$HOME/Android/Sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/tools
  export PATH=$PATH:$ANDROID_HOME/tools/bin
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```
___
Preparing the Android device:
  * Using a physical device, click [here](https://facebook.github.io/react-native/docs/running-on-device)
  * Using a virtual device
    * Open AVD (`Tools > AVD Manager`)
    * Create a new AVD > Create Virtual Device > Select the Pie API Level 28 image
    * You can now launch it
    
___
Run the React Native project
  * Inside the folder `HcpMobileApp`
    * Install dependencies
    ```
    npm install
    ```
    * Run the app
    ```
    npm run start
    ```
