## To clone the repository
  ```bash
      git clone ENEEDDD TO ADD THE LINK HERE BUT ITS PRIVATE NOW
      cd QuickSignTeam10
  ```
## Setting up the different parts of the project
  For each part of the project, (backend, frontend, model), first install the corresponding requirements which are integrated in a separate file specific to each part called requirements.txt.
  
  ## To set up the backend
   - Sign in through the terminal of AWS to connect with the IAM user to be able to access AWS tools.
   - Download the older version of python specified in the requirements file present in the backend directory, and run ml.py using a separate environment
   - Run app.py
  ## To run the frontend
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
  The dataset used, KArSL Dataset, can be found on this link: https://hamzah-luqman.github.io/KArSL/. It is composed of 3 signers performing the each the sign of every word 50 times. In total, we have 150 takes for each word, that are already split into two sections: a training dataset (42 takes per signer for each word, 126 in total) and a testing dataset (8 takes per signer for each word, 24 in total).
  
  The model achieved a training accuracy of 93.32%, and a testing accuracy of 94.16%.

  
  The words trained on are:
| word | english | arabic |
| ---: | :--- | :--- |
| 88 | heart | قلب |
| 95 | burning | حروق |
| 115 | headache | صداع |
| 125 | Loss of hair | تساقط الشعر |
| 131 | itch | حكة / هرش |
| 157 | immunity | مناعة |
| 159 | healthy | معافى |
| 160 | eat | ياكل |
| 161 | drink | يشرب |
| 162 | sleep | ينام |
| 171 | build | يبني |
| 172 | break | يكسر |
| 173 | walk | يمشي |
| 174 | love | يحب |
| 175 | hate | يكره |
| 176 | grill | يشوي |
| 177 | plow | يحرث |
| 178 | plant | يزرع |
| 184 | support | يدعم |
| 187 | grow | ينمي |
| 195 | father | أب |
| 196 | mother | أم |
| 197 | sister | أخت |
| 255 | tired | تعب |
| 256 | crying | بكاء |
| 260 | heavy | ثقيل |
| 287 | left | يسار |
| 288 | right | يمين |
| 289 | welcome | أهلا وسهلا |
| 293 | thanks | شكرا |




  

    
