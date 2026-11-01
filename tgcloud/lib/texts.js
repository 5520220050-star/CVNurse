import { MINI_APP_URL } from './config.js';

export const TEXT = {
  en: {
    choose: 'Choose your language / اختر لغتك',
    welcome: (name) => `Hi ${name}! 👋\n\nI build professional CVs in <b>English</b>, <b>Arabic</b> or <b>both</b>.\n\n• 9 templates, any color, 28 fonts\n• Rearrange, rename and hide any section\n• Live preview, then I send you the PDF here\n\nTap the button below to start.`,
    open: '📝 Open CV Builder',
    menu: 'CV Builder',
    help: '<b>How it works</b>\n1. Tap <b>Open CV Builder</b>.\n2. Fill your info in the <b>Content</b> tab (switch between English and Arabic at the top).\n3. Style it in the <b>Design</b> tab.\n4. In <b>Preview</b>, tap <b>Send PDF</b> — the file arrives in this chat.\n\nCommands: /start · /lang · /help',
    langSet: 'Language set to English ✅',
    other: 'Tap the button to open your CV Builder 👇',
  },
  ar: {
    choose: 'Choose your language / اختر لغتك',
    welcome: (name) => `أهلاً ${name}! 👋\n\nأصمم لك سيرة ذاتية احترافية <b>بالعربية</b> أو <b>بالإنجليزية</b> أو <b>باللغتين</b>.\n\n• ٩ قوالب، أي لون، ٢٨ خطاً\n• رتّب الأقسام وأعد تسميتها وأخفِ ما تريد\n• معاينة مباشرة، ثم أرسل لك ملف PDF هنا\n\nاضغط الزر بالأسفل للبدء.`,
    open: '📝 افتح منشئ السيرة الذاتية',
    menu: 'السيرة الذاتية',
    help: '<b>طريقة الاستخدام</b>\n١. اضغط <b>افتح منشئ السيرة الذاتية</b>.\n٢. املأ معلوماتك في تبويب <b>المحتوى</b> (بدّل بين العربية والإنجليزية من الأعلى).\n٣. نسّق الشكل من تبويب <b>التصميم</b>.\n٤. من <b>المعاينة</b> اضغط <b>إرسال PDF</b> وسيصلك الملف هنا.\n\nالأوامر: /start · /lang · /help',
    langSet: 'تم اختيار العربية ✅',
    other: 'اضغط الزر لفتح منشئ السيرة الذاتية 👇',
  },
};

export const t = (lang) => TEXT[lang === 'ar' ? 'ar' : 'en'];

export const langKeyboard = {
  inline_keyboard: [[
    { text: 'English 🇬🇧', callback_data: 'lang:en' },
    { text: 'العربية 🇮🇶', callback_data: 'lang:ar' },
  ]],
};

export const openKeyboard = (lang) => ({
  inline_keyboard: [[{ text: t(lang).open, web_app: { url: MINI_APP_URL + '?lang=' + lang } }]],
});
