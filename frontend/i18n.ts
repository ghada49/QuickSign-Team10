// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const resources = {
  en: {
    translation: {
      "signup": "Sign Up",
      "login": "Login",
      "fullName": "Full Name",
      "email": "Email",
      "password": "Password",
      "createAccount": "Create Account",
      "alreadyAccount": "Already have an account?",
      "gender": "Gender",
      "male": "Male",
      "female": "Female",
      "forgotPass": "Forgot Password?",
      "noAcc": "Don’t have an account?",
      "resetPass": "Reset Password",
      "resetPassB": "Reset Password",
      "translateArabicToSign": "Translate Arabic to Sign",
      "translateSignToArabic": "Translate Sign to Arabic",
      "emergencyPhrases":   "Emergency Phrases",
      "savedPhrases":       "Saved Phrases"

},
  },
  ar: {
    translation: {
       "signup": "إنشاء حساب",
       "login": "تسجيل الدخول",
        "fullName": "الاسم الكامل",
        "email": "البريد الإلكتروني",
        "password": "كلمة المرور",
        "createAccount": "إنشاء حساب",
        "alreadyAccount": "لديك حساب بالفعل؟",
        "gender": "الجنس",
        "male": "ذكر",
        "female": "أنثى",
        "forgotPass": "هل نسيت كلمة المرور؟",
         "noAcc": "ليس لديك حساب؟",
         "resetPass": " إعادة تعيين كلمة المرور",
         "resetPassB" :"إعادة تعيين",
  "translateArabicToSign": "الترجمة من العربية إلى لغة الإشارة",
  "translateSignToArabic": "الترجمة من لغة الإشارة إلى العربية",
  "emergencyPhrases": "عبارات الطوارئ",
  "savedPhrases": "العبارات المحفوظة"

},
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for React
    },
  });

export default i18n;
