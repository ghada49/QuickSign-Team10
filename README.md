## To clone the repository
  ```bash
      git clone https://github.com/yourusername/flutterforecast.git
      cd QuickSignTeam10
  ```
## Setting up the different parts of the project
  For each part of the project, (backend, frontend, model), first install the corresponding requirements which are integrated in a separate file specific to each part called requirements.txt.
  
  ## In order to run the applicaiton:
   - Sign in through the terminal of AWS to connect with the IAM user to be able to access AWS tools.
   - Download the older version of python specified in the requirements file present in the backend directory, and run ml.py using a separate environment
   - Run app.py
   - Install npm in the command prompt:
    ```bash
     npm install
     ```
   - To start the app: 
     ```bash
     npx expo start
     ```
   - When the output appears, you will receive the option to run the application on different operating systems:
      -  Android emulator:  https://docs.expo.dev/workflow/android-studio-emulator/
      - iOS emulator: https://docs.expo.dev/workflow/ios-simulator/
      - Expo Go, a sandbox for trying out app development with Expo: https://expo.dev/go
      - Dvelopment build: https://docs.expo.dev/develop/development-builds/introduction/
## Machine Learning Model:
  The dataset used, KArSL Dataset, can be found on this link: https://hamzah-luqman.github.io/KArSL/
  The model achieved a training accuracy of 93.32%, and a testing accuracy of 94.16%
  

    
