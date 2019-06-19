# HCP Mobile App

This Mobile Application will explore the management of a hockey team. Our goal is to provide a better user experience for the different age range.

### Development Setup

Bellow, we list the useful commands that allow a new user to be join in our development.

- Install all the dependencies of our app. Use flag `--save` to download these dependencies to the `node_modules` folder (that will be created) just for this project:

    ```bash
    npm install --save
    ```
  
- To start Expo service, and then run on your mobile emulator:

    ```bash
    npm run start
    ```

### How to generate APK file

The deployment requires the user to have an Expo account.

- Authenticate on the Expo service:

    ```bash
    expo login
    ```

- Build our project (this command will upload our files to the Expo servers and the files will be compiled there):

    ```bash
    expo build:android
    ```
