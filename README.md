![alt text](http://hcpenafiel.pt/assets/images/logo.png "Hóquei Clube Penafiel")

# "Hóquei Clube Penafiel" Mobile Application


`Software Labs Project` 2019/20, Computer and Software Engineering Course @ University of Minho, Braga - Portugal

This mobile app is being developed using [React Native](https://facebook.github.io/react-native/).

Web App version can be found [here](https://github.com/git-antoniosousa/hcp-1), although this is a **private** repository.

<br >

## Requirements (Linux)

Install Node.js and NPM.

```bash
sudo apt-get install -y nodejs
sudo apt-get install -y libssl1.0-dev
sudo apt-get install -y nodejs-dev
sudo apt-get install -y node-gyp
sudo apt-get install -y npm

# Install The React Native Comand Line Interface
npm install -g react-native-cli
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
