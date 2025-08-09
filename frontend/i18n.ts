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
      "savedPhrases":       "Saved Phrases",
      "settingsTitle": "Settings",
      "darkMode": "Dark Mode",
      "profile": "Profile",
      "faqTitle": "Help & FAQ",
      "faq1Q": "What does the app do?",
      "faq1A": "The app translates Arabic text to Arabic Sign Language (and vice versa) in real time using the device's camera.",
      "faq2Q": "Does the app support regional sign dialects?",
      "faq2A": "Currently, it supports standard Arabic Sign Language. Dialect support is in development.",
      "faq3Q": "Do I need internet to use the app?",
      "faq3A": "Yes, an internet connection is needed for real-time translation.",
      "profile": "Profile",
      "fullName": "Full Name:",
      "emailAddress": "Email Address:",
      "password": "Password:",
      "phoneNumber": "Phone Number:",
      "logout": "Log Out",
      "enterArabicText": "Enter Arabic Text",
  "translate": "Translate"

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
  "savedPhrases": "العبارات المحفوظة",
  "settingsTitle": "الإعدادات",
  "darkMode": "الوضع الداكن",
  "profile": "الملف الشخصي",
  "faqTitle": "المساعدة والأسئلة الشائعة",
"faq1Q": "ما وظيفة التطبيق؟",
"faq1A": "يترجم التطبيق النص العربي إلى لغة الإشارة العربية (والعكس) في الوقت الفعلي باستخدام كاميرا الجهاز.",
"faq2Q": "هل يدعم التطبيق لهجات الإشارة الإقليمية؟",
"faq2A": "حاليًا، يدعم التطبيق لغة الإشارة العربية القياسية. دعم اللهجات قيد التطوير.",
"faq3Q": "هل أحتاج إلى الإنترنت لاستخدام التطبيق؟",
"faq3A": "نعم، تحتاج إلى اتصال بالإنترنت للترجمة الفورية.",
"profile": "الملف الشخصي",
"fullName": "الاسم الكامل:",
"emailAddress": "البريد الإلكتروني:",
"password": "كلمة المرور:",
"phoneNumber": "رقم الهاتف:",
"logout": "تسجيل الخروج",
 "enterArabicText": "أدخل نصًا بالعربية",
  "translate": "ترجم"
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
