## To clone the repository
  ```bash
      git clone https://github.com/ghada49/QuickSign-Team10.git
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
  The dataset used, KArSL Dataset, can be found on this link: https://hamzah-luqman.github.io/KArSL/
  The model achieved a training accuracy of 93.32%, and a testing accuracy of 94.16%
  The dataset used, KArSL Dataset, can be found on this link: https://hamzah-luqman.github.io/KArSL/. It is composed of 3 signers performing the each the sign of every word 50 times. In total, we have 150 takes for each word, that are already split into two sections: a training dataset (42 takes per signer for each word, 126 in total) and a testing dataset (8 takes per signer for each word, 24 in total).

  The model achieved a training accuracy of 93.32%, and a testing accuracy of 94.16%.
  The model is present under the name Model - 93.32% Training Acc - 94.16% Testing Acc.h5.
  The code for the model is present under the name Training Model Final. The cells can be run in order to train the model.


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
## Translation from text-to-sign

The same dataset used for the model is also used here to create the avatars using the code found in the directory named Text to Sign.
The code used to create the frames of avatars performing the sign language is present in the same directory, and 
The words present in the S3 bucket with their corresponding avatar videos are:

| Word Number | English     | Arabic |
| :--- | :---: | ---: |
| 88  | heart       | قلب |
| 115 | headache    | صداع |
| 117  | fever       | حمى |
| 131 | itch        | حكة |
| 157 | immunity    | مناعة |
| 159 | healthy     | معافى |
| 160 | eat         | يأكل |
| 161 | drink       | يشرب |
| 162 | sleep       | ينام |
| 171 | build       | يبني |
| 172 | break       | يكسر |
| 173 | walk        | يمشي |
| 174 | love        | يحب |
| 175 | hate        | يكره |
| 176 | grill/roast | يشوي |
| 177 | plow        | يحرث |
| 184 | support     | يدعم |
| 187 | grow        | يتنامى |
| 195 | father      | أب |
| 196 | mother      | أم |
| 197 | sister      | أخت |
| 255 | tired       | تعب |
| 256 | crying      | بكاء |
| 260 | heavy       | ثقيل |
| 289 | welcome     | مرحبا |
| 293 | thanks      | شكرا |
| 436 | halal       | حلال |
| 437 | forbidden   | حرام |
| 497 | doctor      | طبيب |
| 498 | phone       | هاتف |





  

    
