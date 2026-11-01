/* CV engine: data model, templates, pagination and export.
   Shared by the editor (app.js). Exposes window.CV. */
(function () {
  'use strict';

  // ---------- Section types ----------
  // field kinds: t = translatable text, m = translatable multiline, s = plain text, n = level 1-5
  const TYPES = {
    summary:        { kind: 'text', side: false, title: { en: 'Profile', ar: 'نبذة شخصية' } },
    experience:     { kind: 'list', side: false, title: { en: 'Experience', ar: 'الخبرات العملية' },
                      fields: [['role','t'],['org','t'],['location','t'],['start','s'],['end','s'],['desc','m']],
                      map: { head: 'role', sub: ['org','location'], date: true, desc: 'desc' } },
    education:      { kind: 'list', side: false, title: { en: 'Education', ar: 'التعليم' },
                      fields: [['degree','t'],['school','t'],['location','t'],['start','s'],['end','s'],['grade','t'],['desc','m']],
                      map: { head: 'degree', sub: ['school','location','grade'], date: true, desc: 'desc' } },
    skills:         { kind: 'meter', side: true, title: { en: 'Skills', ar: 'المهارات' },
                      fields: [['name','t'],['level','n']] },
    languages:      { kind: 'meter', side: true, title: { en: 'Languages', ar: 'اللغات' },
                      fields: [['name','t'],['level','n'],['note','t']] },
    certifications: { kind: 'list', side: false, title: { en: 'Certifications', ar: 'الشهادات' },
                      fields: [['name','t'],['issuer','t'],['date','s'],['url','s']],
                      map: { head: 'name', sub: ['issuer'], single: 'date', url: 'url' } },
    projects:       { kind: 'list', side: false, title: { en: 'Projects', ar: 'المشاريع' },
                      fields: [['name','t'],['role','t'],['date','s'],['url','s'],['desc','m']],
                      map: { head: 'name', sub: ['role'], single: 'date', url: 'url', desc: 'desc' } },
    volunteering:   { kind: 'list', side: false, title: { en: 'Volunteering', ar: 'العمل التطوعي' },
                      fields: [['role','t'],['org','t'],['start','s'],['end','s'],['desc','m']],
                      map: { head: 'role', sub: ['org'], date: true, desc: 'desc' } },
    awards:         { kind: 'list', side: false, title: { en: 'Awards', ar: 'الجوائز' },
                      fields: [['title','t'],['issuer','t'],['date','s'],['desc','m']],
                      map: { head: 'title', sub: ['issuer'], single: 'date', desc: 'desc' } },
    publications:   { kind: 'list', side: false, title: { en: 'Publications', ar: 'المنشورات' },
                      fields: [['title','t'],['venue','t'],['date','s'],['url','s']],
                      map: { head: 'title', sub: ['venue'], single: 'date', url: 'url' } },
    courses:        { kind: 'list', side: true, title: { en: 'Courses & Training', ar: 'الدورات التدريبية' },
                      fields: [['name','t'],['org','t'],['date','s']],
                      map: { head: 'name', sub: ['org'], single: 'date' } },
    references:     { kind: 'list', side: false, title: { en: 'References', ar: 'المعرّفون' },
                      fields: [['name','t'],['position','t'],['org','t'],['contact','s']],
                      map: { head: 'name', sub: ['position','org'], plain: 'contact' } },
    interests:      { kind: 'tags', side: true, title: { en: 'Interests', ar: 'الاهتمامات' },
                      fields: [['name','t']] },
    custom:         { kind: 'list', side: false, title: { en: 'Custom section', ar: 'قسم مخصص' },
                      fields: [['title','t'],['subtitle','t'],['date','s'],['desc','m']],
                      map: { head: 'title', sub: ['subtitle'], single: 'date', desc: 'desc' } },
  };

  const FIELD_LABELS = {
    role: { en: 'Job title', ar: 'المسمى الوظيفي' }, org: { en: 'Organization', ar: 'الجهة' },
    location: { en: 'Location', ar: 'الموقع' }, start: { en: 'Start', ar: 'البداية' },
    end: { en: 'End', ar: 'النهاية' }, desc: { en: 'Description (one point per line)', ar: 'الوصف (نقطة في كل سطر)' },
    degree: { en: 'Degree', ar: 'الشهادة' }, school: { en: 'University / School', ar: 'الجامعة / المدرسة' },
    grade: { en: 'Grade / GPA', ar: 'المعدل / التقدير' }, name: { en: 'Name', ar: 'الاسم' },
    level: { en: 'Level', ar: 'المستوى' }, note: { en: 'Note (e.g. Native)', ar: 'ملاحظة (مثل: اللغة الأم)' },
    issuer: { en: 'Issuer', ar: 'الجهة المانحة' }, date: { en: 'Date', ar: 'التاريخ' },
    url: { en: 'Link', ar: 'الرابط' }, title: { en: 'Title', ar: 'العنوان' },
    subtitle: { en: 'Subtitle', ar: 'العنوان الفرعي' }, venue: { en: 'Journal / Publisher', ar: 'المجلة / الناشر' },
    position: { en: 'Position', ar: 'المنصب' }, contact: { en: 'Contact (phone / email)', ar: 'التواصل (هاتف / بريد)' },
  };

  const PERSONAL_FIELDS = [
    ['name','t'],['title','t'],['email','s'],['phone','s'],['location','t'],
    ['website','s'],['linkedin','s'],['dob','s'],['nationality','t'],
  ];
  const PERSONAL_LABELS = {
    name: { en: 'Full name', ar: 'الاسم الكامل' }, title: { en: 'Professional title', ar: 'المسمى المهني' },
    email: { en: 'Email', ar: 'البريد الإلكتروني' }, phone: { en: 'Phone', ar: 'الهاتف' },
    location: { en: 'City, Country', ar: 'المدينة، البلد' }, website: { en: 'Website', ar: 'الموقع الإلكتروني' },
    linkedin: { en: 'LinkedIn', ar: 'لينكدإن' }, dob: { en: 'Date of birth', ar: 'تاريخ الميلاد' },
    nationality: { en: 'Nationality', ar: 'الجنسية' },
  };

  // ---------- Fonts (all have 400 & 700 on Google Fonts) ----------
  const FONTS = {
    latin: ['Inter','Roboto','Open Sans','Lato','Montserrat','Poppins','Raleway','IBM Plex Sans','Source Sans 3',
            'Merriweather','Playfair Display','Source Serif 4','EB Garamond','Lora','Crimson Pro'],
    arabic: ['Cairo','Tajawal','Almarai','IBM Plex Sans Arabic','Noto Kufi Arabic','Noto Naskh Arabic',
             'Amiri','Readex Pro','Changa','El Messiri','Reem Kufi','Markazi Text','Noto Sans Arabic'],
  };

  // ---------- Templates ----------
  // layout: single | sidebar (colored side column) | two (plain side column)
  // header: top | main | side | band
  const TEMPLATES = {
    modern:    { layout: 'sidebar', header: 'main', name: { en: 'Modern', ar: 'عصري' } },
    creative:  { layout: 'sidebar', header: 'side', name: { en: 'Creative', ar: 'إبداعي' } },
    executive: { layout: 'two',     header: 'band', name: { en: 'Executive', ar: 'تنفيذي' } },
    compact:   { layout: 'two',     header: 'top',  name: { en: 'Compact', ar: 'مضغوط' } },
    classic:   { layout: 'single',  header: 'top',  name: { en: 'Classic', ar: 'كلاسيكي' } },
    elegant:   { layout: 'single',  header: 'top',  name: { en: 'Elegant', ar: 'أنيق' } },
    minimal:   { layout: 'single',  header: 'top',  name: { en: 'Minimal', ar: 'بسيط' } },
    timeline:  { layout: 'single',  header: 'top',  name: { en: 'Timeline', ar: 'خط زمني' } },
    ats:       { layout: 'single',  header: 'top',  name: { en: 'ATS plain', ar: 'متوافق مع ATS' } },
  };

  const PALETTE = ['#1f4e79','#0f766e','#047857','#7f1d1d','#9d174d','#6d28d9','#1e40af','#b45309',
                   '#c2410c','#334155','#111827','#0e7490','#a16207','#be123c','#4d7c0f','#5b21b6'];

  const DEFAULT_DESIGN = {
    template: 'modern', accent: '#1f4e79', text: '#1d2430', bg: '#ffffff',
    sideStyle: 'solid', sidePos: 'start', sideWidth: 33,
    fontLatin: 'Inter', fontArabic: 'Cairo', headLatin: '', headArabic: '',
    size: 10, lineHeight: 1.4, nameScale: 1, margin: 14, gap: 1,
    page: 'A4', headerAlign: 'start',
    photo: true, photoShape: 'circle', photoSize: 30, photoBorder: true,
    titleStyle: 'underline', titleCase: 'upper', skillStyle: 'bars', langStyle: 'dots',
    datePos: 'end', icons: true, bullet: '•', pageNumbers: false, accentName: false,
    customCss: '',
  };

  const OPTION_LISTS = {
    sideStyle: ['solid','tint','plain'], sidePos: ['start','end'], page: ['A4','Letter'],
    headerAlign: ['start','center'], photoShape: ['circle','rounded','square'],
    titleStyle: ['underline','bar','filled','plain','line','boxed'], titleCase: ['upper','normal'],
    skillStyle: ['bars','dots','tags','text','percent'], langStyle: ['dots','bars','text','tags'],
    datePos: ['end','below'], bullet: ['•','–','▸','✓','◆','○'],
  };

  // ---------- helpers ----------
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const tr = (v, lang) => {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    const o = lang === 'ar' ? 'en' : 'ar';
    return (v[lang] && String(v[lang]).trim()) ? v[lang] : (v[o] || '');
  };
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>');

  function lum(hex) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || '');
    if (!m) return 0;
    const c = [1, 2, 3].map((i) => { const x = parseInt(m[i], 16) / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  const onColor = (hex) => (lum(hex) > 0.42 ? '#111827' : '#ffffff');
  function mix(hex, white, amt) { // blend hex toward white(#fff) or other
    const p = (h) => { const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(h) || [0,'00','00','00'];
      return [1,2,3].map((i) => parseInt(m[i], 16)); };
    const a = p(hex), b = p(white);
    return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * amt).toString(16).padStart(2, '0')).join('');
  }

  const PRESENT = { en: 'Present', ar: 'حتى الآن' };
  function dateRange(it, lang) {
    const s = (it.start || '').trim();
    let e = (it.end || '').trim();
    if (e.toLowerCase() === 'present' || e === '__present__') e = PRESENT[lang];
    const b = (x) => `<bdi>${esc(x)}</bdi>`;
    if (s && e) return `${b(s)} – ${b(e)}`;
    return s || e ? b(s || e) : '';
  }

  function descHtml(text) {
    if (!text) return '';
    const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let out = '', inList = false;
    for (const l of lines) {
      const m = /^[-•*–▸✓]\s*(.*)$/.exec(l);
      if (m) { if (!inList) { out += '<ul class="cv-ul">'; inList = true; } out += `<li>${inline(m[1])}</li>`; }
      else { if (inList) { out += '</ul>'; inList = false; } out += `<p>${inline(l)}</p>`; }
    }
    if (inList) out += '</ul>';
    return `<div class="cv-desc">${out}</div>`;
  }

  // ---------- icons (simple stroke icons) ----------
  const IC = {
    email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    location: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    website: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v6M8 7.5v.01M12 16v-6M12 12.5a2.5 2.5 0 0 1 5 0V16"/>',
    dob: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    nationality: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  };
  const icon = (k) => `<svg class="cv-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[k] || IC.link}</svg>`;

  // ---------- defaults & sample ----------
  function newSection(type) {
    const s = { id: uid(), type, title: { en: '', ar: '' }, hidden: false, side: !!TYPES[type].side, items: [] };
    if (TYPES[type].kind === 'text') s.text = { en: '', ar: '' };
    return s;
  }
  function newItem(type) {
    const it = { id: uid() };
    for (const [k, kind] of TYPES[type].fields) it[k] = kind === 't' || kind === 'm' ? { en: '', ar: '' } : kind === 'n' ? 4 : '';
    return it;
  }
  const T = (en, ar) => ({ en, ar });

  function blankCv(title) {
    return {
      id: uid(), title: title || 'My CV', langs: ['en', 'ar'], version: 1,
      personal: { name: T('', ''), title: T('', ''), email: '', phone: '', location: T('', ''), website: '',
                  linkedin: '', dob: '', nationality: T('', ''), photo: '', extra: [] },
      sections: ['summary', 'experience', 'education', 'skills', 'languages'].map(newSection),
      design: Object.assign({}, DEFAULT_DESIGN),
    };
  }

  function sampleCv(title) {
    const cv = blankCv(title);
    cv.personal = { name: T('Sara Ahmed Ali', 'سارة أحمد علي'), title: T('Registered Nurse', 'ممرضة جامعية'),
      email: 'sara.ahmed@example.com', phone: '+964 770 000 0000', location: T('Najaf, Iraq', 'النجف، العراق'),
      website: '', linkedin: 'linkedin.com/in/sara-ahmed', dob: '', nationality: T('Iraqi', 'عراقية'), photo: '', extra: [] };
    const sec = (type, items, extra) => Object.assign(newSection(type), { items: items.map((x) => Object.assign(newItem(type), x)) }, extra || {});
    cv.sections = [
      Object.assign(newSection('summary'), { text: T(
        'Dedicated registered nurse with clinical training in critical care and emergency departments. Skilled in patient assessment, medication administration and patient education, with a commitment to evidence-based practice.',
        'ممرضة جامعية متفانية بخبرة تدريبية سريرية في العناية المركزة والطوارئ. ماهرة في تقييم المرضى وإعطاء الأدوية وتثقيف المرضى، مع التزام بالممارسة المبنية على الدليل.') }),
      sec('experience', [
        { role: T('Staff Nurse — ICU', 'ممرضة — العناية المركزة'), org: T('Al-Sadr Teaching Hospital', 'مستشفى الصدر التعليمي'),
          location: T('Najaf', 'النجف'), start: '2025', end: 'present',
          desc: T('- Monitored and assessed up to 4 critically ill patients per shift\n- Administered IV medications and managed infusion pumps\n- Educated families on discharge care plans',
                  '- مراقبة وتقييم ما يصل إلى ٤ مرضى بحالات حرجة في كل مناوبة\n- إعطاء الأدوية الوريدية وإدارة مضخات التسريب\n- تثقيف العائلات حول خطط الرعاية بعد الخروج') },
        { role: T('Clinical Trainee', 'متدربة سريرية'), org: T('Emergency Department', 'قسم الطوارئ'),
          location: T('Kufa', 'الكوفة'), start: '2023', end: '2024',
          desc: T('- Performed triage and vital-sign monitoring\n- Assisted in CPR and emergency procedures',
                  '- إجراء الفرز ومراقبة العلامات الحيوية\n- المساعدة في الإنعاش القلبي الرئوي والإجراءات الطارئة') },
      ]),
      sec('education', [
        { degree: T('B.Sc. in Nursing', 'بكالوريوس تمريض'), school: T('University of Kufa', 'جامعة الكوفة'),
          location: T('Najaf, Iraq', 'النجف، العراق'), start: '2021', end: '2025', grade: T('Very Good', 'جيد جداً'), desc: T('', '') },
      ]),
      sec('skills', [
        { name: T('Patient assessment', 'تقييم المرضى'), level: 5 }, { name: T('IV therapy', 'العلاج الوريدي'), level: 4 },
        { name: T('Basic Life Support', 'الإنعاش الأساسي'), level: 5 }, { name: T('Medical records', 'السجلات الطبية'), level: 4 },
        { name: T('Infection control', 'مكافحة العدوى'), level: 4 },
      ]),
      sec('languages', [
        { name: T('Arabic', 'العربية'), level: 5, note: T('Native', 'اللغة الأم') },
        { name: T('English', 'الإنجليزية'), level: 4, note: T('Professional', 'مستوى مهني') },
      ]),
      sec('certifications', [
        { name: T('Basic Life Support (BLS)', 'دعم الحياة الأساسي (BLS)'), issuer: T('American Heart Association', 'جمعية القلب الأمريكية'), date: '2024', url: '' },
      ]),
      sec('interests', [{ name: T('Health education', 'التثقيف الصحي') }, { name: T('Reading', 'القراءة') }, { name: T('Volunteering', 'التطوع') }]),
    ];
    return cv;
  }

  // ---------- normalize (import / old data) ----------
  function normalize(cv) {
    const base = blankCv();
    cv = Object.assign({}, base, cv || {});
    cv.personal = Object.assign({}, base.personal, cv.personal || {});
    cv.design = Object.assign({}, DEFAULT_DESIGN, cv.design || {});
    if (!TEMPLATES[cv.design.template]) cv.design.template = 'modern';
    if (!Array.isArray(cv.langs) || !cv.langs.length) cv.langs = ['en', 'ar'];
    cv.sections = (Array.isArray(cv.sections) ? cv.sections : []).filter((s) => s && TYPES[s.type]).map((s) => {
      const n = Object.assign(newSection(s.type), s);
      n.items = (Array.isArray(s.items) ? s.items : []).map((it) => Object.assign(newItem(s.type), it, { id: it.id || uid() }));
      return n;
    });
    return cv;
  }

  // ---------- CSS ----------
  function fontsUrl(d) {
    const fams = new Set([d.fontLatin, d.fontArabic, d.headLatin, d.headArabic].filter(Boolean));
    if (!fams.size) return '';
    return 'https://fonts.googleapis.com/css2?' + [...fams].map((f) => 'family=' + encodeURIComponent(f).replace(/%20/g, '+') + ':wght@400;700').join('&') + '&display=swap';
  }

  function pageSize(d) { return d.page === 'Letter' ? { w: 215.9, h: 279.4 } : { w: 210, h: 297 }; }

  function cssFor(d, lang) {
    const acc = d.accent || '#1f4e79';
    const tpl = TEMPLATES[d.template] || TEMPLATES.modern;
    const ats = d.template === 'ats';
    const A = ats ? '#111111' : acc;
    const sideBg = tpl.layout !== 'sidebar' || ats ? 'transparent' : d.sideStyle === 'solid' ? acc : d.sideStyle === 'tint' ? mix(acc, '#ffffff', 0.9) : 'transparent';
    const sideFg = sideBg === acc ? onColor(acc) : d.text;
    const sideAccent = sideBg === acc ? onColor(acc) : A;
    const latin = `'${d.fontLatin}'`, arabic = `'${d.fontArabic}'`;
    const body = lang === 'ar' ? `${arabic}, ${latin}, sans-serif` : `${latin}, ${arabic}, sans-serif`;
    const hl = d.headLatin ? `'${d.headLatin}'` : latin, ha = d.headArabic ? `'${d.headArabic}'` : arabic;
    const head = lang === 'ar' ? `${ha}, ${hl}, sans-serif` : `${hl}, ${ha}, sans-serif`;
    const ps = pageSize(d);
    return `
.cvx{--acc:${A};--acc-on:${onColor(A)};--acc-soft:${mix(A, '#ffffff', 0.88)};--txt:${d.text};--muted:${mix(d.text, '#ffffff', 0.38)};
--bg:${d.bg};--side-bg:${sideBg};--side-fg:${sideFg};--side-acc:${sideAccent};--fs:${d.size}pt;--lh:${d.lineHeight};
--m:${d.margin}mm;--gap:${d.gap};--sidew:${d.sideWidth}%;--photo:${d.photoSize}mm;--body:${body};--head:${head};}
.cvx .cv-page{width:${ps.w}mm;height:${ps.h}mm;background:var(--bg);color:var(--txt);font-family:var(--body);font-size:var(--fs);
line-height:var(--lh);position:relative;overflow:hidden;display:flex;flex-direction:column;box-sizing:border-box;
-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}
.cvx .cv-page *{box-sizing:border-box;}
.cvx .cv-page p{margin:0 0 .25em;}
.cvx .cv-body{flex:1;min-height:0;display:flex;}
.cvx .cv-col{min-height:0;overflow:hidden;}
.cvx .cv-main{flex:1;padding:var(--m);}
.cvx .cv-side{width:var(--sidew);flex:none;padding:var(--m) calc(var(--m)*.8);background:var(--side-bg);color:var(--side-fg);}
.cvx.side-end .cv-side{order:2;}
.cvx.lay-two .cv-side{background:transparent;color:var(--txt);padding-inline-start:0;}
.cvx.lay-two.side-start .cv-side{padding-inline-start:var(--m);padding-inline-end:calc(var(--m)*.5);}
.cvx.lay-two.side-end .cv-side{padding-inline-end:var(--m);padding-inline-start:calc(var(--m)*.5);}
.cvx.lay-two .cv-main{padding-inline-end:calc(var(--m)*.6);}
.cvx.lay-two.side-end .cv-main{padding-inline-end:calc(var(--m)*.6);}
.cvx.lay-two.side-start .cv-main{padding-inline-start:calc(var(--m)*.6);padding-inline-end:var(--m);}
.cvx.lay-two .cv-body{gap:0;}
.cvx.lay-two .cv-side .cv-sec-title{color:var(--acc);}
.cvx .cv-block{margin-bottom:calc(.55em*var(--gap));}
.cvx .cv-sec{margin-top:calc(.9em*var(--gap));}
.cvx .cv-first{margin-top:0;}
/* header */
.cvx .cv-head{display:flex;align-items:center;gap:5mm;margin-bottom:calc(1em*var(--gap));}
.cvx .cv-head.center{flex-direction:column;text-align:center;gap:3mm;}
.cvx .cv-name{font-family:var(--head);font-weight:700;font-size:calc(var(--fs)*2.5*${d.nameScale});line-height:1.12;margin:0;
${d.accentName ? 'color:var(--acc);' : ''}letter-spacing:${lang === 'ar' ? '0' : '-.01em'};}
.cvx .cv-role{font-size:calc(var(--fs)*1.25);color:var(--acc);font-weight:700;margin-top:.15em;}
.cvx .cv-contacts{display:flex;flex-wrap:wrap;gap:.25em 1.1em;margin-top:.55em;font-size:.92em;color:var(--muted);}
.cvx .cv-head.center .cv-contacts{justify-content:center;}
.cvx .cv-contact{display:inline-flex;align-items:center;gap:.4em;}
.cvx .cv-ic{width:1.05em;height:1.05em;flex:none;color:var(--acc);}
.cvx .cv-photo{width:var(--photo);height:var(--photo);object-fit:cover;flex:none;display:block;
border-radius:${d.photoShape === 'circle' ? '50%' : d.photoShape === 'rounded' ? '14%' : '0'};
${d.photoBorder ? 'border:1.2mm solid var(--acc-soft);' : ''}}
.cvx .cv-side .cv-photo{margin:0 auto 5mm;${d.photoBorder ? 'border-color:rgba(255,255,255,.35);' : ''}}
.cvx .cv-side .cv-contact,.cvx .cv-side .cv-contacts{color:var(--side-fg);}
.cvx .cv-side .cv-ic{color:var(--side-acc);}
.cvx .cv-side .cv-contacts{flex-direction:column;gap:.45em;margin:0;font-size:.92em;}
.cvx .cv-side .cv-contact{word-break:break-word;align-items:flex-start;}
.cvx .cv-side .cv-contact .cv-ic{margin-top:.2em;}
.cvx .cv-sidehead{text-align:center;margin-bottom:6mm;}
.cvx .cv-sidehead .cv-name{color:var(--side-fg);font-size:calc(var(--fs)*2*${d.nameScale});}
.cvx .cv-sidehead .cv-role{color:var(--side-acc);opacity:.92;}
.cvx .cv-band{background:var(--acc);color:var(--acc-on);padding:calc(var(--m)*.85) var(--m);flex:none;}
.cvx .cv-band .cv-head{margin:0;}
.cvx .cv-band .cv-name{color:var(--acc-on);}
.cvx .cv-band .cv-role,.cvx .cv-band .cv-contacts,.cvx .cv-band .cv-contact,.cvx .cv-band .cv-ic{color:var(--acc-on);}
.cvx .cv-band .cv-role{opacity:.9;}
.cvx .cv-band .cv-photo{border-color:rgba(255,255,255,.4);}
.cvx .cv-top{padding:var(--m) var(--m) 0;flex:none;}
.cvx .cv-top .cv-head{margin-bottom:0;padding-bottom:calc(.7em*var(--gap));}
/* section titles */
.cvx .cv-sec-title{font-family:var(--head);font-weight:700;color:var(--acc);font-size:calc(var(--fs)*1.18);margin:0 0 .5em;
${d.titleCase === 'upper' && lang !== 'ar' ? 'text-transform:uppercase;letter-spacing:.08em;font-size:calc(var(--fs)*1.08);' : ''}}
.cvx .cv-side .cv-sec-title{color:var(--side-acc);}
.cvx.ts-underline .cv-sec-title{border-bottom:.5mm solid currentColor;padding-bottom:.2em;}
.cvx.ts-bar .cv-sec-title{border-inline-start:1.4mm solid currentColor;padding-inline-start:.5em;}
.cvx.ts-filled .cv-main .cv-sec-title{background:var(--acc);color:var(--acc-on);padding:.2em .6em;border-radius:1mm;}
.cvx.ts-filled .cv-side .cv-sec-title{border-bottom:.4mm solid currentColor;padding-bottom:.2em;}
.cvx.ts-line .cv-sec-title{display:flex;align-items:center;gap:.6em;}
.cvx.ts-line .cv-sec-title::after{content:"";flex:1;height:.35mm;background:currentColor;opacity:.45;}
.cvx.ts-boxed .cv-sec-title{border:.4mm solid currentColor;padding:.15em .6em;display:inline-block;}
/* entries */
.cvx .cv-entry-top{display:flex;justify-content:space-between;gap:1em;align-items:baseline;}
.cvx .cv-entry-head{font-weight:700;font-size:1.05em;}
.cvx .cv-entry-sub{color:var(--muted);font-weight:400;}
.cvx .cv-entry-sub b{color:var(--txt);}
.cvx .cv-date{color:var(--acc);font-size:.9em;white-space:nowrap;font-weight:700;}
.cvx .cv-side .cv-date{color:var(--side-acc);}
.cvx.date-below .cv-entry-top{display:block;}
.cvx.date-below .cv-date{display:block;font-weight:400;}
.cvx .cv-desc{margin-top:.2em;}
.cvx .cv-ul{margin:.15em 0 0;padding:0;list-style:none;}
.cvx .cv-ul li{position:relative;padding-inline-start:1.1em;margin-bottom:.12em;}
.cvx .cv-ul li::before{content:"${d.bullet.replace(/["\\]/g, '')}";position:absolute;inset-inline-start:0;color:var(--acc);font-weight:700;}
.cvx .cv-side .cv-ul li::before{color:var(--side-acc);}
.cvx .cv-url{font-size:.88em;color:var(--muted);word-break:break-all;}
.cvx .cv-side .cv-entry-sub,.cvx .cv-side .cv-url{color:inherit;opacity:.85;}
/* meters */
.cvx .cv-meter{margin-bottom:.45em;}
.cvx .cv-meter-row{display:flex;justify-content:space-between;gap:.6em;align-items:center;}
.cvx .cv-meter-note{font-size:.88em;opacity:.75;}
.cvx .cv-bar{height:1.5mm;border-radius:1mm;background:rgba(127,127,127,.28);margin-top:.25em;overflow:hidden;}
.cvx .cv-bar i{display:block;height:100%;background:var(--acc);border-radius:1mm;}
.cvx .cv-side .cv-bar i{background:var(--side-acc);}
.cvx .cv-dots{display:inline-flex;gap:1.1mm;flex:none;}
.cvx .cv-dots i{width:2.2mm;height:2.2mm;border-radius:50%;border:.35mm solid var(--acc);display:block;}
.cvx .cv-dots i.on{background:var(--acc);}
.cvx .cv-side .cv-dots i{border-color:var(--side-acc);}
.cvx .cv-side .cv-dots i.on{background:var(--side-acc);}
.cvx .cv-pct{font-size:.85em;opacity:.8;}
.cvx .cv-tags{display:flex;flex-wrap:wrap;gap:1.6mm;}
.cvx .cv-tag{background:var(--acc-soft);color:var(--acc);padding:.15em .65em;border-radius:3mm;font-size:.92em;}
.cvx .cv-side .cv-tag{background:rgba(127,127,127,.18);color:var(--side-fg);}
.cvx .cv-meters-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0 6mm;}
.cvx .cv-textlist{margin:0;}
.cvx .cv-pagenum{position:absolute;bottom:5mm;inset-inline-end:var(--m);font-size:.8em;color:var(--muted);}
/* ---------- template flavours ---------- */
.cvx.tpl-modern .cv-main .cv-head{border-bottom:.5mm solid var(--acc-soft);padding-bottom:.8em;}
.cvx.tpl-classic .cv-head{flex-direction:column;text-align:center;gap:2mm;border-bottom:.6mm double var(--txt);padding-bottom:.7em;}
.cvx.tpl-classic .cv-contacts{justify-content:center;}
.cvx.tpl-classic .cv-sec-title{text-align:center;}
.cvx.tpl-elegant .cv-head{flex-direction:column;text-align:center;gap:2.5mm;}
.cvx.tpl-elegant .cv-contacts{justify-content:center;}
.cvx.tpl-elegant .cv-name{font-weight:400;letter-spacing:${lang === 'ar' ? '0' : '.12em'};${lang === 'ar' ? '' : 'text-transform:uppercase;'}}
.cvx.tpl-elegant .cv-role{color:var(--muted);font-weight:400;letter-spacing:${lang === 'ar' ? '0' : '.2em'};${lang === 'ar' ? '' : 'text-transform:uppercase;'}font-size:var(--fs);}
.cvx.tpl-elegant .cv-top .cv-head{border-bottom:.35mm solid var(--acc);}
.cvx.tpl-elegant .cv-sec-title{justify-content:center;text-align:center;}
.cvx.tpl-minimal .cv-name{font-weight:700;}
.cvx.tpl-minimal .cv-role{color:var(--muted);font-weight:400;}
.cvx.tpl-minimal .cv-sec{display:grid;grid-template-columns:28mm 1fr;gap:0 5mm;}
.cvx.tpl-minimal .cv-sec > .cv-sec-title{grid-row:1/span 99;border:0;background:none;color:var(--acc);padding:0;font-size:var(--fs);}
.cvx.tpl-minimal .cv-sec > .cv-sec-title::after{display:none;}
.cvx.tpl-minimal .cv-cont{grid-column:2;}
.cvx.tpl-minimal .cv-more{margin-inline-start:33mm;}
.cvx.tpl-timeline .cv-entry{position:relative;padding-inline-start:6mm;border-inline-start:.5mm solid var(--acc-soft);padding-bottom:.4em;}
.cvx.tpl-timeline .cv-entry::before{content:"";position:absolute;inset-inline-start:-1.6mm;top:.35em;width:2.7mm;height:2.7mm;border-radius:50%;background:var(--bg);border:.6mm solid var(--acc);}
.cvx.tpl-timeline .cv-head{border-inline-start:2mm solid var(--acc);padding-inline-start:5mm;}
.cvx.tpl-compact{--fs:${(d.size * 0.92).toFixed(2)}pt;}
.cvx.tpl-compact .cv-top .cv-head{border-bottom:.5mm solid var(--acc);}
.cvx.tpl-compact .cv-side{border-inline-start:.35mm solid var(--acc-soft);}
.cvx.side-start.tpl-compact .cv-side{border-inline-start:0;border-inline-end:.35mm solid var(--acc-soft);}
.cvx.tpl-executive .cv-side{background:var(--acc-soft) !important;padding:var(--m) calc(var(--m)*.7) !important;}
.cvx.tpl-ats .cv-ic,.cvx.tpl-ats .cv-photo{display:none !important;}
.cvx.tpl-ats .cv-sec-title{border-bottom:.35mm solid #111;color:#111;background:none !important;}
.cvx.tpl-ats .cv-date,.cvx.tpl-ats .cv-role,.cvx.tpl-ats .cv-ul li::before{color:#111;}
`;
  }

  // ---------- block builders ----------
  function L(lang) { return lang; }
  function secTitle(sec, lang) {
    const custom = tr(sec.title, lang);
    return esc(custom || TYPES[sec.type].title[lang]);
  }

  function contactItems(p, lang, d) {
    const keys = ['email', 'phone', 'location', 'website', 'linkedin', 'dob', 'nationality'];
    const out = [];
    for (const k of keys) {
      const v = tr(p[k], lang);
      const dir = typeof p[k] === 'string' ? 'ltr' : 'auto';
      if (v) out.push(`<span class="cv-contact">${d.icons ? icon(k) : ''}<bdi dir="${dir}">${esc(v)}</bdi></span>`);
    }
    for (const x of p.extra || []) {
      const lab = tr(x.label, lang), val = tr(x.value, lang);
      if (val) out.push(`<span class="cv-contact">${d.icons ? icon('link') : ''}<span>${lab ? '<b>' + esc(lab) + ':</b> ' : ''}<bdi dir="auto">${esc(val)}</bdi></span></span>`);
    }
    return out.length ? `<div class="cv-contacts">${out.join('')}</div>` : '';
  }

  const photoHtml = (p, d) => (d.photo && p.photo && d.template !== 'ats' ? `<img class="cv-photo" src="${esc(p.photo)}" alt="">` : '');

  function headerHtml(cv, lang, opts) {
    const p = cv.personal, d = cv.design;
    const center = opts.center ? ' center' : '';
    return `<div class="cv-head${center}">${opts.photo ? photoHtml(p, d) : ''}<div class="cv-head-txt">
      <h1 class="cv-name">${esc(tr(p.name, lang))}</h1>
      ${tr(p.title, lang) ? `<div class="cv-role">${esc(tr(p.title, lang))}</div>` : ''}
      ${opts.contacts ? contactItems(p, lang, d) : ''}</div></div>`;
  }

  function levelHtml(level, style) {
    const n = Math.max(0, Math.min(5, Number(level) || 0));
    if (style === 'bars') return `<div class="cv-bar"><i style="width:${n * 20}%"></i></div>`;
    if (style === 'dots') return `<span class="cv-dots">${[1,2,3,4,5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
    if (style === 'percent') return `<span class="cv-pct">${n * 20}%</span>`;
    return '';
  }

  // returns array of block html strings for a section; first block includes title
  function sectionBlocks(sec, lang, d, inSide, single) {
    const type = TYPES[sec.type];
    const title = `<h2 class="cv-sec-title">${secTitle(sec, lang)}</h2>`;
    const blocks = [];
    if (type.kind === 'text') {
      const txt = tr(sec.text, lang);
      if (!txt.trim()) return [];
      return [`<div class="cv-sec">${title}<div class="cv-cont">${descHtml(txt)}</div></div>`];
    }
    const items = sec.items.filter((it) => {
      const k = type.fields[0][0];
      return tr(it[k], lang).trim();
    });
    if (!items.length) return [];

    if (type.kind === 'tags' || (type.kind === 'meter' && ((sec.type === 'skills' ? d.skillStyle : d.langStyle) === 'tags'))) {
      const tags = items.map((it) => `<span class="cv-tag">${esc(tr(it.name, lang))}</span>`).join('');
      return [`<div class="cv-sec">${title}<div class="cv-cont"><div class="cv-tags">${tags}</div></div></div>`];
    }
    if (type.kind === 'meter') {
      const style = sec.type === 'skills' ? d.skillStyle : d.langStyle;
      const rows = items.map((it) => {
        const note = it.note ? tr(it.note, lang) : '';
        const name = esc(tr(it.name, lang));
        if (style === 'text') return `<div class="cv-meter"><div class="cv-meter-row"><span>${name}</span>${note ? `<span class="cv-meter-note">${esc(note)}</span>` : ''}</div></div>`;
        if (style === 'bars') return `<div class="cv-meter"><div class="cv-meter-row"><span>${name}</span>${note ? `<span class="cv-meter-note">${esc(note)}</span>` : ''}</div>${levelHtml(it.level, 'bars')}</div>`;
        return `<div class="cv-meter"><div class="cv-meter-row"><span>${name}${note ? ` <span class="cv-meter-note">(${esc(note)})</span>` : ''}</span>${levelHtml(it.level, style)}</div></div>`;
      }).join('');
      const grid = single ? `<div class="cv-meters-grid">${rows}</div>` : rows;
      return [`<div class="cv-sec">${title}<div class="cv-cont">${grid}</div></div>`];
    }
    // list entries
    const m = type.map;
    items.forEach((it, i) => {
      const head = esc(tr(it[m.head], lang));
      const subs = (m.sub || []).map((k) => tr(it[k], lang)).filter(Boolean).map(esc);
      const date = m.date ? dateRange(it, lang) : m.single && it[m.single] ? `<bdi>${esc(it[m.single])}</bdi>` : '';
      const url = m.url && it[m.url] ? `<div class="cv-url"><bdi dir="ltr">${esc(it[m.url])}</bdi></div>` : '';
      const plain = m.plain && it[m.plain] ? `<div class="cv-url"><bdi dir="auto">${esc(it[m.plain])}</bdi></div>` : '';
      const desc = m.desc ? descHtml(tr(it[m.desc], lang)) : '';
      const entry = `<div class="cv-entry">
        <div class="cv-entry-top"><div><span class="cv-entry-head">${head}</span>${subs.length ? `<div class="cv-entry-sub">${subs.join(' · ')}</div>` : ''}</div>
        ${date ? `<span class="cv-date">${date}</span>` : ''}</div>${url}${plain}${desc}</div>`;
      if (i === 0) blocks.push(`<div class="cv-sec">${title}<div class="cv-cont cv-block">${entry}</div></div>`);
      else blocks.push(`<div class="cv-cont cv-block cv-more" data-minimal="1">${entry}</div>`);
    });
    return blocks;
  }

  // ---------- rendering + pagination ----------
  function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }

  let fontLinkHref = '';
  function ensureFonts(d) {
    const href = fontsUrl(d);
    if (href && href !== fontLinkHref) {
      fontLinkHref = href;
      let link = document.getElementById('cv-fonts');
      if (!link) { link = document.createElement('link'); link.id = 'cv-fonts'; link.rel = 'stylesheet'; link.crossOrigin = 'anonymous'; document.head.appendChild(link); }
      return new Promise((res) => { link.onload = link.onerror = () => res(); link.href = href; setTimeout(res, 4000); });
    }
    return Promise.resolve();
  }

  async function waitFonts(d, lang) {
    await ensureFonts(d);
    const fams = [d.fontLatin, d.fontArabic, d.headLatin, d.headArabic].filter(Boolean);
    const sample = lang === 'ar' ? 'أبجد abc' : 'abc أبجد';
    try {
      await Promise.race([
        Promise.all(fams.flatMap((f) => [document.fonts.load(`400 12px '${f}'`, sample), document.fonts.load(`700 12px '${f}'`, sample)])),
        new Promise((r) => setTimeout(r, 4000)),
      ]);
      await document.fonts.ready;
    } catch (e) { /* ignore */ }
  }

  function sanitizeCss(css) {
    return String(css || '').replace(/</g, '').replace(/@import[^;]*;?/gi, '').slice(0, 20000);
  }

  // Render cv in `lang` into host element. Returns array of page elements.
  async function render(cv, lang, host) {
    cv = normalize(cv);
    const d = cv.design;
    const tpl = TEMPLATES[d.template];
    await waitFonts(d, lang);

    host.innerHTML = '';
    const root = document.createElement('div');
    root.className = ['cvx', 'tpl-' + d.template, 'lay-' + tpl.layout, 'side-' + d.sidePos, 'ts-' + d.titleStyle,
      d.datePos === 'below' ? 'date-below' : ''].join(' ');
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', lang);
    const style = document.createElement('style');
    style.textContent = cssFor(d, lang) + (d.customCss ? `\n.cvx{${sanitizeCss(d.customCss)}}` : '');
    root.appendChild(style);
    host.appendChild(root);

    const single = tpl.layout === 'single';
    const visible = cv.sections.filter((s) => !s.hidden);
    const sideSecs = single ? [] : visible.filter((s) => s.side);
    const mainSecs = single ? visible : visible.filter((s) => !s.side);

    const mainBlocks = [], sideBlocks = [];
    const center = d.headerAlign === 'center';
    let topHtml = '';
    if (tpl.header === 'band') topHtml = `<div class="cv-band">${headerHtml(cv, lang, { photo: true, contacts: true, center })}</div>`;
    else if (tpl.header === 'top') topHtml = `<div class="cv-top">${headerHtml(cv, lang, { photo: true, contacts: true, center })}</div>`;
    else if (tpl.header === 'main') {
      mainBlocks.push(headerHtml(cv, lang, { photo: false, contacts: false, center }));
      const ph = photoHtml(cv.personal, d);
      if (ph) sideBlocks.push(ph);
      const ct = contactItems(cv.personal, lang, d);
      if (ct) sideBlocks.push(`<div class="cv-sec cv-first"><h2 class="cv-sec-title">${lang === 'ar' ? 'التواصل' : 'Contact'}</h2>${ct}</div>`);
    } else if (tpl.header === 'side') {
      const p = cv.personal;
      sideBlocks.push(`<div class="cv-sidehead">${photoHtml(p, d)}<h1 class="cv-name">${esc(tr(p.name, lang))}</h1>${tr(p.title, lang) ? `<div class="cv-role">${esc(tr(p.title, lang))}</div>` : ''}</div>`);
      const ct = contactItems(p, lang, d);
      if (ct) sideBlocks.push(`<div class="cv-sec cv-first"><h2 class="cv-sec-title">${lang === 'ar' ? 'التواصل' : 'Contact'}</h2>${ct}</div>`);
    }
    for (const s of mainSecs) mainBlocks.push(...sectionBlocks(s, lang, d, false, single));
    for (const s of sideSecs) sideBlocks.push(...sectionBlocks(s, lang, d, true, false));

    const pages = [];
    function newPage() {
      const first = pages.length === 0;
      const pg = el(`<div class="cv-page">${first ? topHtml : ''}<div class="cv-body">${single ? '' : '<div class="cv-col cv-side"></div>'}<div class="cv-col cv-main"></div></div></div>`);
      root.appendChild(pg);
      pages.push(pg);
      return pg;
    }
    const over = (col) => col.scrollHeight > col.clientHeight + 1;

    function flow(blocks, sel) {
      let pi = 0;
      if (!pages[0]) newPage();
      for (const html of blocks) {
        let col = pages[pi].querySelector(sel);
        let node = el(html);
        if (!col.children.length && node.classList.contains('cv-sec')) node.classList.add('cv-first');
        col.appendChild(node);
        if (over(col) && col.children.length > 1) {
          col.removeChild(node);
          pi++;
          if (!pages[pi]) newPage();
          col = pages[pi].querySelector(sel);
          node = el(html.replace('cv-more', 'cv-more cv-cont-first'));
          if (node.classList.contains('cv-sec')) node.classList.add('cv-first');
          col.appendChild(node);
        }
      }
    }
    newPage();
    flow(mainBlocks, '.cv-main');
    if (!single) flow(sideBlocks, '.cv-side');

    if (d.pageNumbers && pages.length > 1) pages.forEach((pg, i) => pg.appendChild(el(`<div class="cv-pagenum">${i + 1} / ${pages.length}</div>`)));
    return pages;
  }

  // ---------- export ----------
  let fontEmbedCache = { href: '', css: '' };
  async function toDataUrl(url) {
    const r = await fetch(url);
    const b = await r.blob();
    return await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });
  }
  // Build @font-face CSS with inlined font files, only for the subsets the text needs.
  async function fontEmbedCss(d) {
    const href = fontsUrl(d);
    if (!href) return '';
    if (fontEmbedCache.href === href) return fontEmbedCache.css;
    let css = await (await fetch(href)).text();
    const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]))];
    const map = {};
    await Promise.all(urls.map(async (u) => { try { map[u] = await toDataUrl(u); } catch (e) { map[u] = u; } }));
    css = css.replace(/url\((https:[^)]+)\)/g, (m, u) => `url(${map[u] || u})`);
    fontEmbedCache = { href, css };
    return css;
  }

  async function pageToCanvas(page, d, scale) {
    const opts = { pixelRatio: scale || 2.5, backgroundColor: d.bg || '#fff', cacheBust: false,
      fontEmbedCSS: await fontEmbedCss(d) };
    // Safari/WKWebView sometimes drops images/fonts on the first pass; render twice.
    await window.htmlToImage.toCanvas(page, Object.assign({}, opts, { pixelRatio: 0.3 })).catch(() => {});
    return window.htmlToImage.toCanvas(page, opts);
  }

  async function exportPdf(pages, cv, opts) {
    const d = normalize(cv).design;
    const ps = pageSize(d);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: [ps.w, ps.h], orientation: 'portrait', compress: true });
    const name = tr(cv.personal && cv.personal.name, (opts && opts.lang) || 'en');
    pdf.setProperties({ title: name ? name + ' — CV' : 'CV', creator: 'CV Builder Bot' });
    for (let i = 0; i < pages.length; i++) {
      const canvas = await pageToCanvas(pages[i], d, (opts && opts.scale) || 2.5);
      const img = canvas.toDataURL('image/jpeg', (opts && opts.quality) || 0.92);
      if (i > 0) pdf.addPage([ps.w, ps.h], 'portrait');
      pdf.addImage(img, 'JPEG', 0, 0, ps.w, ps.h, undefined, 'FAST');
      if (opts && opts.onProgress) opts.onProgress(i + 1, pages.length);
    }
    return new Uint8Array(pdf.output('arraybuffer'));
  }

  async function exportJpeg(page, cv, scale) {
    const d = normalize(cv).design;
    const canvas = await pageToCanvas(page, d, scale || 1.6);
    return await new Promise((res) => canvas.toBlob((b) => b.arrayBuffer().then((ab) => res(new Uint8Array(ab))), 'image/jpeg', 0.9));
  }

  window.CV = { TYPES, FIELD_LABELS, PERSONAL_FIELDS, PERSONAL_LABELS, FONTS, TEMPLATES, PALETTE, DEFAULT_DESIGN, OPTION_LISTS,
    tr, uid, esc, newSection, newItem, blankCv, sampleCv, normalize, render, exportPdf, exportJpeg, pageSize, onColor };
})();
