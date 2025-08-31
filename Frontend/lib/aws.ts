import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'eu-north-1_6ggq7XgmG',  
      userPoolClientId: '4d9aeahendp2o0i4o06k7tgo7n', 
      loginWith: { email: true, username: false, phone: false },
    },
  },
});
