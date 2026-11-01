/* CV Builder Mini App — editor UI. Talks to the bot's Serverless endpoints `cv` and `send`. */
(function () {
  'use strict';
  const tg = window.Telegram && window.Telegram.WebApp;
  const C = window.CV;

  // ---------------- state ----------------
  const S = { ui: 'en', cvs: [], cv: null, tab: 'content', clang: 'en', plang: 'en', open: {}, saving: '', busy: false };

  // ---------------- strings ----------------
  const STR = {
    content: ['Content', 'المحتوى'], design: ['Design', 'التصميم'], preview: ['Preview', 'المعاينة'],
    saved: ['Saved ✓', 'تم الحفظ ✓'], saving: ['Saving…', 'جارٍ الحفظ…'], unsaved: ['Edited', 'معدّل'], saveErr: ['Not saved', 'لم يُحفظ'],
    personal: ['Personal info', 'المعلومات الشخصية'], photo: ['Photo', 'الصورة'], upload: ['Upload', 'رفع صورة'], remove: ['Remove', 'حذف'],
    extra: ['Extra links / info', 'روابط ومعلومات إضافية'], addExtra: ['+ Add link or info', '+ إضافة رابط أو معلومة'],
    label: ['Label', 'العنوان'], value: ['Value', 'القيمة'],
    secTitle: ['Section title', 'عنوان القسم'], addItem: ['+ Add entry', '+ إضافة عنصر'], addSection: ['+ Add section', '+ إضافة قسم'],
    newEntry: ['(new entry)', '(عنصر جديد)'], present: ['Present', 'حتى الآن'], text: ['Text', 'النص'],
    hidden: ['hidden', 'مخفي'], side: ['sidebar', 'الشريط الجانبي'], main: ['main', 'الرئيسي'],
    moveSide: ['Move to sidebar / main column', 'نقل إلى الشريط الجانبي / العمود الرئيسي'],
    template: ['Template', 'القالب'], colors: ['Colors', 'الألوان'], accent: ['Main color', 'اللون الرئيسي'],
    textColor: ['Text color', 'لون النص'], bgColor: ['Page color', 'لون الصفحة'],
    typography: ['Typography', 'الخطوط'], fontLatin: ['English font', 'الخط الإنجليزي'], fontArabic: ['Arabic font', 'الخط العربي'],
    headLatin: ['English headings font', 'خط العناوين الإنجليزية'], headArabic: ['Arabic headings font', 'خط العناوين العربية'],
    same: ['Same as text', 'مثل خط النص'], size: ['Text size', 'حجم النص'], lineHeight: ['Line spacing', 'تباعد الأسطر'],
    nameScale: ['Name size', 'حجم الاسم'], layout: ['Layout', 'التخطيط'], page: ['Page size', 'حجم الصفحة'],
    margin: ['Margins', 'الهوامش'], gap: ['Section spacing', 'المسافة بين الأقسام'], sideWidth: ['Sidebar width', 'عرض الشريط الجانبي'],
    sidePos: ['Sidebar side', 'جهة الشريط الجانبي'], sideStyle: ['Sidebar style', 'نمط الشريط الجانبي'], headerAlign: ['Header alignment', 'محاذاة الترويسة'],
    sections: ['Sections', 'الأقسام'], titleStyle: ['Section title style', 'شكل عناوين الأقسام'], titleCase: ['Title letters', 'حروف العناوين'],
    datePos: ['Dates position', 'موضع التواريخ'], bullet: ['Bullet', 'رمز النقاط'], skillStyle: ['Skills display', 'عرض المهارات'],
    langStyle: ['Languages display', 'عرض اللغات'], photoShape: ['Photo shape', 'شكل الصورة'], photoSize: ['Photo size', 'حجم الصورة'],
    showPhoto: ['Show photo', 'إظهار الصورة'], photoBorder: ['Photo border', 'إطار الصورة'], icons: ['Contact icons', 'أيقونات التواصل'],
    pageNumbers: ['Page numbers', 'ترقيم الصفحات'], accentName: ['Color the name', 'تلوين الاسم'], extras: ['Extras', 'إضافات'],
    customCss: ['Custom CSS (advanced)', 'CSS مخصص (متقدم)'],
    cssHint: ['Applies to the CV only. Example: .cv-name{letter-spacing:2px}  .cv-sec-title{color:#c00}', 'يُطبّق على السيرة فقط. مثال: .cv-name{letter-spacing:2px}'],
    resetDesign: ['Reset design to default', 'إعادة التصميم للوضع الافتراضي'],
    sendPdf: ['📄 Send PDF to chat', '📄 إرسال PDF إلى المحادثة'], sendBoth: ['📄📄 Send both languages', '📄📄 إرسال اللغتين'],
    sendImg: ['🖼 Send as image', '🖼 إرسال كصورة'], print: ['🖨 Print / Save PDF', '🖨 طباعة / حفظ PDF'],
    pages: ['page(s)', 'صفحة'], generating: ['Generating', 'جارٍ الإنشاء'], uploading: ['Sending to chat…', 'جارٍ الإرسال إلى المحادثة…'],
    sent: ['Sent! Check the chat ✅', 'تم الإرسال! راجع المحادثة ✅'], failed: ['Something went wrong: ', 'حدث خطأ: '],
    caption: ['Your CV is ready ✅', 'سيرتك الذاتية جاهزة ✅'],
    printHint: ['On a computer, Print → Save as PDF gives a PDF with selectable text.', 'على الحاسوب، الطباعة ← حفظ كـ PDF تعطي ملفاً بنص قابل للتحديد.'],
    menu: ['CV options', 'خيارات السيرة'], newBlank: ['➕ New empty CV', '➕ سيرة جديدة فارغة'], newSample: ['✨ New CV from example', '✨ سيرة جديدة من مثال'],
    duplicate: ['⧉ Duplicate this CV', '⧉ نسخ هذه السيرة'], rename: ['✏️ Rename', '✏️ إعادة التسمية'], del: ['🗑 Delete this CV', '🗑 حذف هذه السيرة'],
    cvLangs: ['CV languages', 'لغات السيرة'], enOnly: ['English', 'الإنجليزية'], arOnly: ['Arabic', 'العربية'], both: ['Both', 'كلتاهما'],
    uiLang: ['Interface language', 'لغة الواجهة'], exportJson: ['⬇️ Send backup (.json) to chat', '⬇️ إرسال نسخة احتياطية (.json)'],
    importJson: ['⬆️ Import backup (.json)', '⬆️ استيراد نسخة احتياطية (.json)'], clearAll: ['🧹 Clear all content', '🧹 مسح كل المحتوى'],
    confirmDel: ['Delete this CV? This cannot be undone.', 'حذف هذه السيرة؟ لا يمكن التراجع.'],
    confirmClear: ['Clear all content of this CV?', 'مسح كل محتوى هذه السيرة؟'],
    confirmReset: ['Reset all design settings?', 'إعادة كل إعدادات التصميم؟'],
    cvName: ['CV name', 'اسم السيرة'], ok: ['Save', 'حفظ'], cancel: ['Cancel', 'إلغاء'], close: ['Close', 'إغلاق'],
    pickSection: ['Add a section', 'إضافة قسم'], already: ['already added', 'مضاف'],
    otherLang: ['In ', 'في '], imported: ['Imported ✅', 'تم الاستيراد ✅'], badFile: ['Invalid file', 'ملف غير صالح'],
    tooBig: ['Photo is too large', 'الصورة كبيرة جداً'], tapPreview: ['Tap to open full preview', 'اضغط لفتح المعاينة الكاملة'],
    datePh: ['e.g. 2024 or Sep 2024', 'مثال: 2024 أو أيلول 2024'], descPh: ['- Start a line with a dash for a bullet\n**bold**  *italic*', '- ابدأ السطر بشرطة لعمل نقطة\n**عريض**  *مائل*'],
    langEN: ['English', 'English'], langAR: ['العربية', 'العربية'], editing: ['Editing:', 'تحرير:'],
  };
  const OPT = {
    solid: ['Solid', 'ملوّن'], tint: ['Light', 'فاتح'], plain: ['None', 'بدون'], start: ['Start', 'البداية'], end: ['End', 'النهاية'],
    center: ['Center', 'الوسط'], circle: ['Circle', 'دائري'], rounded: ['Rounded', 'حواف مدورة'], square: ['Square', 'مربع'],
    underline: ['Underline', 'خط سفلي'], bar: ['Side bar', 'شريط جانبي'], filled: ['Filled', 'خلفية ملونة'], line: ['Line', 'خط ممتد'],
    boxed: ['Boxed', 'إطار'], upper: ['UPPERCASE', 'كبيرة'], normal: ['Normal', 'عادية'], bars: ['Bars', 'أشرطة'], dots: ['Dots', 'نقاط'],
    tags: ['Tags', 'وسوم'], text: ['Text only', 'نص فقط'], percent: ['Percent', 'نسبة'], below: ['Below title', 'تحت العنوان'],
  };
  const I = (k) => { const v = STR[k]; return v ? v[S.ui === 'ar' ? 1 : 0] : k; };
  const O = (k) => { const v = OPT[k]; return v ? v[S.ui === 'ar' ? 1 : 0] : k; };
  const L2 = (o) => (o ? o[S.ui] || o.en : '');

  // ---------------- tiny DOM helper ----------------
  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else if (k === 'value') e.value = v;
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k)));
    return e;
  }
  const stop = (fn) => (e) => { e.stopPropagation(); fn(e); };

  // ---------------- backend ----------------
  function call(name, input) {
    return new Promise((resolve, reject) => {
      const srv = (tg && tg.Serverless) || window.MOCK_SERVERLESS;
      if (!srv) return reject(new Error('Open this page from the bot inside Telegram.'));
      srv.call(name, input || {}, (err, res) => (err ? reject(new Error(err.message || err.type || 'Error')) : resolve(res)));
    });
  }

  // ---------------- feedback ----------------
  let toastTimer;
  function toast(msg) {
    document.querySelectorAll('.toast').forEach((x) => x.remove());
    const t = h('div', { class: 'toast' }, msg);
    document.body.append(t);
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), 2600);
  }
  let overlay;
  function busy(msg) {
    if (!msg) { if (overlay) overlay.remove(); overlay = null; S.busy = false; return; }
    S.busy = true;
    if (!overlay) { overlay = h('div', { class: 'overlay' }, h('div', { class: 'spin' }), h('div', { class: 'msg' })); document.body.append(overlay); }
    overlay.querySelector('.msg').textContent = msg;
  }
  function confirmBox(msg) {
    return new Promise((res) => {
      if (tg && tg.showConfirm && tg.isVersionAtLeast && tg.isVersionAtLeast('6.2')) tg.showConfirm(msg, (ok) => res(ok));
      else res(window.confirm(msg));
    });
  }
  const haptic = (t) => { try { tg && tg.HapticFeedback && tg.HapticFeedback.selectionChanged(); } catch (e) { /* */ } };

  // ---------------- saving ----------------
  let saveTimer = null;
  function dirty() {
    S.saving = 'unsaved'; updateStatus();
    clearTimeout(saveTimer); saveTimer = setTimeout(save, 1200);
    schedulePreview();
    try { tg && tg.enableClosingConfirmation && tg.enableClosingConfirmation(); } catch (e) { /* */ }
  }
  async function save() {
    clearTimeout(saveTimer); saveTimer = null;
    if (!S.cv) return;
    S.saving = 'saving'; updateStatus();
    try {
      await call('cv', { action: 'save', cv: S.cv });
      const row = S.cvs.find((c) => c.id === S.cv.id);
      if (row) row.title = S.cv.title; else S.cvs.unshift({ id: S.cv.id, title: S.cv.title });
      S.saving = 'saved';
      try { tg && tg.disableClosingConfirmation && tg.disableClosingConfirmation(); } catch (e) { /* */ }
    } catch (e) { S.saving = 'saveErr'; toast(I('failed') + e.message); }
    updateStatus();
  }
  async function flush() { if (saveTimer) await save(); }
  function updateStatus() { const el = document.getElementById('status'); if (el) el.textContent = S.saving ? I(S.saving) : ''; }

  // ---------------- language helpers ----------------
  const langs = () => (S.cv && S.cv.langs) || ['en', 'ar'];
  function fixLangs() {
    if (!langs().includes(S.clang)) S.clang = langs()[0];
    if (!langs().includes(S.plang)) S.plang = langs()[0];
  }
  function setUi(lang) {
    S.ui = lang === 'ar' ? 'ar' : 'en';
    document.body.dir = S.ui === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = S.ui;
  }

  // ---------------- render shell ----------------
  const app = document.getElementById('app');
  function render() {
    fixLangs();
    const y = window.scrollY;
    app.innerHTML = '';
    app.append(topBar());
    const body = h('div', { class: 'wrap' });
    if (S.tab === 'content') body.append(contentTab());
    else if (S.tab === 'design') body.append(designTab());
    else body.append(previewTab());
    app.append(body, tabs());
    if (S._keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
    S._keepScroll = false;
    if (S.tab !== 'content') schedulePreview(true);
  }
  const rerender = () => { S._keepScroll = true; render(); };

  function topBar() {
    const sel = h('select', { onchange: (e) => openCv(e.target.value) },
      S.cvs.map((c) => h('option', { value: c.id, selected: S.cv && c.id === S.cv.id }, c.title || 'CV')));
    return h('div', { class: 'top' }, sel, h('span', { id: 'status', class: 'status' }, S.saving ? I(S.saving) : ''),
      h('button', { class: 'iconbtn', onclick: menuSheet, 'aria-label': 'menu' }, '⋯'));
  }

  function tabs() {
    const b = (id, icon) => h('button', { class: S.tab === id ? 'on' : '', onclick: () => { S.tab = id; haptic(); render(); } }, h('b', null, icon), I(id));
    return h('div', { class: 'tabs' }, b('content', '✏️'), b('design', '🎨'), b('preview', '👁'));
  }

  function langSeg(key, label) {
    if (langs().length < 2) return null;
    const b = (l, t) => h('button', { class: S[key] === l ? 'on' : '', onclick: () => { S[key] = l; rerender(); } }, t);
    return h('div', { class: 'seg' }, b('en', I('langEN')), b('ar', I('langAR')));
  }

  // ---------------- inputs ----------------
  // translatable text: obj[key] = {en, ar}; edits the current content language
  function tInput(obj, key, label, multiline, onChange) {
    if (!obj[key] || typeof obj[key] !== 'object') obj[key] = { en: typeof obj[key] === 'string' ? obj[key] : '', ar: '' };
    const lang = S.clang, other = lang === 'en' ? 'ar' : 'en';
    const val = obj[key][lang] || '';
    const attrs = { class: 'inp', dir: lang === 'ar' ? 'rtl' : 'ltr', value: val, placeholder: multiline ? I('descPh') : '',
      oninput: (e) => { obj[key][lang] = e.target.value; onChange && onChange(e.target.value); dirty(); } };
    const field = multiline ? h('textarea', attrs) : h('input', attrs);
    if (multiline) field.value = val;
    const ref = langs().length > 1 && obj[key][other] ? h('span', { dir: 'auto', style: { opacity: .75, maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
      (other === 'en' ? 'EN: ' : 'AR: ') + obj[key][other].split('\n')[0]) : null;
    return h('label', { class: 'f' }, h('span', null, h('span', null, label), ref), field);
  }
  function sInput(obj, key, label, opts) {
    opts = opts || {};
    const field = h('input', { class: 'inp' + (opts.ltr === false ? '' : ' ltr'), value: obj[key] || '', placeholder: opts.ph || '',
      type: opts.type || 'text', inputmode: opts.mode,
      oninput: (e) => { obj[key] = e.target.value; opts.onChange && opts.onChange(e.target.value); dirty(); } });
    return h('label', { class: 'f' }, h('span', null, h('span', null, label), opts.extra || null), field);
  }
  function levelInput(obj, key, label) {
    const wrap = h('div', { class: 'lvl' });
    const draw = () => { wrap.innerHTML = ''; for (let i = 1; i <= 5; i++) wrap.append(h('button', { class: i <= (obj[key] || 0) ? 'on' : '', onclick: (e) => { e.preventDefault(); obj[key] = i; draw(); dirty(); haptic(); } })); };
    draw();
    return h('label', { class: 'f' }, h('span', null, label), wrap);
  }
  function endDateInput(it) {
    const isPresent = /^(present|__present__)$/i.test(it.end || '');
    let field;
    const chk = h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: isPresent, onchange: (e) => {
      it.end = e.target.checked ? 'present' : ''; field.value = ''; field.disabled = e.target.checked; dirty(); } }), I('present'));
    field = h('input', { class: 'inp ltr', value: isPresent ? '' : it.end || '', disabled: isPresent, placeholder: I('datePh'),
      oninput: (e) => { it.end = e.target.value; dirty(); } });
    return h('label', { class: 'f' }, h('span', null, h('span', null, L2(C.FIELD_LABELS.end)), chk), field);
  }

  // ---------------- collapsible card ----------------
  function card(id, headKids, bodyFn, extraClass) {
    const isOpen = !!S.open[id];
    const body = h('div', { class: 'card-b' });
    const head = h('div', { class: 'card-h' + (extraClass ? ' ' + extraClass : ''), onclick: () => {
      S.open[id] = !S.open[id]; el.classList.toggle('open', S.open[id]);
      if (S.open[id] && !body.childElementCount) body.append(bodyFn());
      body.style.display = S.open[id] ? '' : 'none';
    } }, h('span', { class: 'chev' }, '›'), headKids);
    const el = h('div', { class: 'card' + (isOpen ? ' open' : '') }, head, body);
    if (isOpen) body.append(bodyFn()); else body.style.display = 'none';
    return el;
  }

  // ---------------- content tab ----------------
  function sectionLabel(sec, lang) {
    return C.tr(sec.title, lang) || C.TYPES[sec.type].title[lang];
  }
  const tplLayout = () => C.TEMPLATES[S.cv.design.template].layout;

  function contentTab() {
    const cv = S.cv;
    const frag = h('div');
    if (langs().length > 1) frag.append(h('div', { class: 'hint' }, I('editing')), langSeg('clang'));
    frag.append(personalCard());
    cv.sections.forEach((sec, i) => frag.append(sectionCard(sec, i)));
    frag.append(h('button', { class: 'add', onclick: addSectionSheet }, I('addSection')));
    return frag;
  }

  function personalCard() {
    const p = S.cv.personal;
    const title = h('span', { class: 'ttl' }, I('personal'), h('small', null, C.tr(p.name, S.clang)));
    return card('personal', title, () => {
      const b = h('div');
      // photo
      const img = p.photo ? h('img', { src: p.photo, alt: '' }) : h('div', { class: 'ph' }, '👤');
      const file = h('input', { type: 'file', accept: 'image/*', style: { display: 'none' }, onchange: async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try { p.photo = await squarePhoto(f); S.cv.design.photo = true; dirty(); rerender(); } catch (err) { toast(I('tooBig')); }
      } });
      b.append(h('div', { class: 'photo' }, img, h('div', { class: 'row', style: { flex: 1 } },
        h('button', { class: 'btn sec', onclick: () => file.click() }, I('upload')),
        p.photo ? h('button', { class: 'btn sec', style: { color: 'var(--danger)' }, onclick: () => { p.photo = ''; dirty(); rerender(); } }, I('remove')) : null), file));
      for (const [k, kind] of C.PERSONAL_FIELDS) {
        const lab = L2(C.PERSONAL_LABELS[k]);
        if (kind === 't') b.append(tInput(p, k, lab, false, k === 'name' ? (v) => { title.querySelector('small').textContent = v; } : null));
        else b.append(sInput(p, k, lab, { type: k === 'email' ? 'email' : k === 'phone' ? 'tel' : 'text' }));
      }
      // extra
      b.append(h('div', { class: 'g-title' }, I('extra')));
      (p.extra || []).forEach((x, i) => {
        if (typeof x.value === 'string') x.value = { en: x.value, ar: x.value };
        b.append(h('div', { class: 'item' }, h('div', { class: 'card-b', style: { borderTop: 0 } },
          h('div', { class: 'row' }, tInput(x, 'label', I('label')), tInput(x, 'value', I('value'))),
          h('div', { style: { textAlign: 'end', marginTop: '8px' } }, h('button', { class: 'mini danger', onclick: () => { p.extra.splice(i, 1); dirty(); rerender(); } }, '🗑')))));
      });
      b.append(h('button', { class: 'add', onclick: () => { (p.extra = p.extra || []).push({ label: { en: '', ar: '' }, value: { en: '', ar: '' } }); dirty(); rerender(); } }, I('addExtra')));
      return b;
    });
  }

  function move(arr, i, d) { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; dirty(); haptic(); rerender(); }

  function sectionCard(sec, i) {
    const cv = S.cv, type = C.TYPES[sec.type];
    const layout = tplLayout();
    const nameEl = h('span', { class: 'ttl' }, sectionLabel(sec, S.clang),
      sec.hidden ? h('small', null, '· ' + I('hidden')) : layout !== 'single' ? h('small', null, '· ' + (sec.side ? I('side') : I('main'))) : null);
    const ctrls = [
      h('button', { class: 'mini', onclick: stop(() => move(cv.sections, i, -1)) }, '↑'),
      h('button', { class: 'mini', onclick: stop(() => move(cv.sections, i, 1)) }, '↓'),
      h('button', { class: 'mini' + (sec.hidden ? '' : ' on'), title: 'show / hide', onclick: stop(() => { sec.hidden = !sec.hidden; dirty(); rerender(); }) }, sec.hidden ? '🙈' : '👁'),
      layout !== 'single' ? h('button', { class: 'mini' + (sec.side ? ' on' : ''), title: I('moveSide'), onclick: stop(() => { sec.side = !sec.side; dirty(); rerender(); }) }, '⇆') : null,
    ];
    return card(sec.id, [nameEl, ...ctrls], () => {
      const b = h('div');
      const tLabel = sec.type === 'custom' ? I('secTitle') : I('secTitle') + ' (' + C.TYPES[sec.type].title[S.clang] + ')';
      b.append(tInput(sec, 'title', tLabel, false, (v) => { nameEl.firstChild.textContent = v || C.TYPES[sec.type].title[S.clang]; }));
      if (type.kind === 'text') {
        b.append(tInput(sec, 'text', I('text'), true));
      } else {
        sec.items.forEach((it, j) => b.append(itemCard(sec, it, j)));
        b.append(h('button', { class: 'add', onclick: () => { const it = C.newItem(sec.type); sec.items.push(it); S.open[it.id] = true; dirty(); rerender(); } }, I('addItem')));
      }
      b.append(h('div', { style: { textAlign: 'end', marginTop: '12px' } },
        h('button', { class: 'mini danger', onclick: async () => {
          if (!(await confirmBox('🗑 ' + sectionLabel(sec, S.ui) + '?'))) return;
          cv.sections.splice(i, 1); dirty(); rerender(); } }, '🗑 ' + sectionLabel(sec, S.ui))));
      return b;
    }, sec.hidden ? 'dim' : '');
  }

  function itemCard(sec, it, j) {
    const type = C.TYPES[sec.type];
    const firstKey = type.fields[0][0];
    const headTxt = () => C.tr(it[firstKey], S.clang) || I('newEntry');
    const ttl = h('span', { class: 'ttl', dir: 'auto' }, headTxt());
    const ctrls = [
      h('button', { class: 'mini', onclick: stop(() => move(sec.items, j, -1)) }, '↑'),
      h('button', { class: 'mini', onclick: stop(() => move(sec.items, j, 1)) }, '↓'),
      h('button', { class: 'mini', title: 'duplicate', onclick: stop(() => { const c = JSON.parse(JSON.stringify(it)); c.id = C.uid(); sec.items.splice(j + 1, 0, c); dirty(); rerender(); }) }, '⧉'),
      h('button', { class: 'mini danger', onclick: stop(() => { sec.items.splice(j, 1); dirty(); rerender(); }) }, '🗑'),
    ];
    const c = card(it.id, [ttl, ...ctrls], () => {
      const b = h('div');
      const fields = type.fields;
      for (let k = 0; k < fields.length; k++) {
        const [key, kind] = fields[k];
        const lab = L2(C.FIELD_LABELS[key]);
        if (key === 'start' && fields[k + 1] && fields[k + 1][0] === 'end') {
          b.append(h('div', { class: 'row' }, sInput(it, 'start', lab, { ph: I('datePh') }), endDateInput(it)));
          k++; continue;
        }
        if (kind === 't') b.append(tInput(it, key, lab, false, key === firstKey ? () => { ttl.textContent = headTxt(); } : null));
        else if (kind === 'm') b.append(tInput(it, key, lab, true));
        else if (kind === 'n') b.append(levelInput(it, key, lab));
        else b.append(sInput(it, key, lab, { ph: key === 'date' ? I('datePh') : '' }));
      }
      return b;
    });
    c.classList.replace('card', 'item');
    if (S.open[it.id]) c.classList.add('open');
    return c;
  }

  function addSectionSheet() {
    const present = new Set(S.cv.sections.map((s) => s.type));
    sheet(I('pickSection'), (close) => Object.keys(C.TYPES).map((t) => h('button', { class: 'list-btn', onclick: () => {
      const s = C.newSection(t);
      if (C.TYPES[t].kind !== 'text') s.items.push(C.newItem(t));
      S.cv.sections.push(s); S.open[s.id] = true; if (s.items[0]) S.open[s.items[0].id] = true;
      close(); dirty(); render(); setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 50);
    } }, h('span', { style: { flex: 1 } }, C.TYPES[t].title[S.ui]), present.has(t) && t !== 'custom' ? h('small', { style: { color: 'var(--hint)' } }, I('already')) : null)));
  }

  // photo → centered square JPEG data URL (≈40–80 KB)
  function squarePhoto(file) {
    return new Promise((res, rej) => {
      if (file.size > 25e6) return rej(new Error('big'));
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(img.width, img.height), size = Math.min(520, s);
        const c = document.createElement('canvas'); c.width = c.height = size;
        c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = rej; img.src = url;
    });
  }

  // ---------------- design tab ----------------
  let miniEl = null;
  function designTab() {
    const d = S.cv.design;
    const frag = h('div');
    miniEl = h('div', { class: 'mini-prev', onclick: () => { S.tab = 'preview'; render(); }, title: I('tapPreview') }, h('div', { class: 'scaler' }));
    frag.append(miniEl);
    if (langs().length > 1) frag.append(langSeg('plang'));

    const set = (k, v, full) => { d[k] = v; dirty(); if (full) rerender(); };
    const group = (title, ...kids) => [h('div', { class: 'g-title' }, title), h('div', { class: 'ctl' }, kids)];
    const chips = (key, list, label, labeler) => {
      const box = h('div', { class: 'chips' });
      list.forEach((v) => box.append(h('button', { class: 'chip' + (d[key] === v ? ' on' : ''), onclick: (e) => {
        box.querySelectorAll('.chip').forEach((x) => x.classList.remove('on')); e.currentTarget.classList.add('on'); set(key, v); haptic(); } }, labeler ? labeler(v) : O(v))));
      return h('label', { class: 'f' }, h('span', null, label), box);
    };
    const slider = (key, min, max, step, label, fmt) => {
      const out = h('b', null, fmt ? fmt(d[key]) : d[key]);
      return h('label', { class: 'f' }, h('span', null, h('span', null, label), out),
        h('input', { type: 'range', min, max, step, value: d[key], oninput: (e) => { const v = Number(e.target.value); out.textContent = fmt ? fmt(v) : v; set(key, v); } }));
    };
    const toggle = (key, label) => h('label', { class: 'tog' }, label, h('input', { type: 'checkbox', checked: !!d[key], onchange: (e) => set(key, e.target.checked) }));
    const fontSel = (key, list, label, allowSame) => h('label', { class: 'f' }, h('span', null, label),
      h('select', { class: 'inp sel', onchange: (e) => set(key, e.target.value) },
        allowSame ? h('option', { value: '', selected: !d[key] }, I('same')) : null,
        list.map((f) => h('option', { value: f, selected: d[key] === f }, f))));
    const colorRow = (key, label, palette) => {
      const sw = h('div', { class: 'sw' });
      const input = h('input', { type: 'color', value: d[key], oninput: (e) => { set(key, e.target.value); sw.querySelectorAll('button').forEach((x) => x.classList.remove('on')); } });
      (palette || []).forEach((c) => sw.append(h('button', { style: { background: c }, class: d[key] === c ? 'on' : '', onclick: (e) => {
        sw.querySelectorAll('button').forEach((x) => x.classList.remove('on')); e.currentTarget.classList.add('on'); input.value = c; set(key, c); haptic(); } })));
      sw.append(input);
      return h('label', { class: 'f' }, h('span', null, label), sw);
    };

    // templates
    const tg_ = h('div', { class: 'tpls' });
    Object.entries(C.TEMPLATES).forEach(([id, t]) => tg_.append(h('button', { class: 'tpl' + (d.template === id ? ' on' : ''), onclick: (e) => {
      tg_.querySelectorAll('.tpl').forEach((x) => x.classList.remove('on')); e.currentTarget.classList.add('on'); set('template', id); haptic(); } },
      h('span', { html: tplIcon(id) }), L2(t.name))));
    frag.append(h('div', { class: 'g-title' }, I('template')), tg_);

    frag.append(...group(I('colors'),
      colorRow('accent', I('accent'), C.PALETTE),
      colorRow('text', I('textColor'), ['#1d2430', '#000000', '#374151', '#3f3f46', '#1e293b']),
      colorRow('bg', I('bgColor'), ['#ffffff', '#fbfaf7', '#f8fafc', '#fdf8f0'])));

    frag.append(...group(I('typography'),
      fontSel('fontLatin', C.FONTS.latin, I('fontLatin')),
      fontSel('fontArabic', C.FONTS.arabic, I('fontArabic')),
      fontSel('headLatin', C.FONTS.latin, I('headLatin'), true),
      fontSel('headArabic', C.FONTS.arabic, I('headArabic'), true),
      slider('size', 8, 13, 0.5, I('size'), (v) => v + 'pt'),
      slider('lineHeight', 1.1, 1.9, 0.05, I('lineHeight'), (v) => v.toFixed(2)),
      slider('nameScale', 0.6, 1.6, 0.05, I('nameScale'), (v) => Math.round(v * 100) + '%')));

    frag.append(...group(I('layout'),
      chips('page', C.OPTION_LISTS.page, I('page'), (v) => v),
      slider('margin', 6, 25, 1, I('margin'), (v) => v + 'mm'),
      slider('gap', 0.5, 2, 0.05, I('gap'), (v) => Math.round(v * 100) + '%'),
      slider('sideWidth', 24, 45, 1, I('sideWidth'), (v) => v + '%'),
      chips('sidePos', C.OPTION_LISTS.sidePos, I('sidePos')),
      chips('sideStyle', C.OPTION_LISTS.sideStyle, I('sideStyle')),
      chips('headerAlign', C.OPTION_LISTS.headerAlign, I('headerAlign'))));

    frag.append(...group(I('sections'),
      chips('titleStyle', C.OPTION_LISTS.titleStyle, I('titleStyle')),
      chips('titleCase', C.OPTION_LISTS.titleCase, I('titleCase')),
      chips('datePos', C.OPTION_LISTS.datePos, I('datePos')),
      chips('bullet', C.OPTION_LISTS.bullet, I('bullet'), (v) => v),
      chips('skillStyle', C.OPTION_LISTS.skillStyle, I('skillStyle')),
      chips('langStyle', C.OPTION_LISTS.langStyle, I('langStyle'))));

    frag.append(...group(I('photo'),
      toggle('photo', I('showPhoto')),
      chips('photoShape', C.OPTION_LISTS.photoShape, I('photoShape')),
      slider('photoSize', 18, 45, 1, I('photoSize'), (v) => v + 'mm'),
      toggle('photoBorder', I('photoBorder'))));

    frag.append(...group(I('extras'),
      toggle('icons', I('icons')), toggle('accentName', I('accentName')), toggle('pageNumbers', I('pageNumbers'))));

    const css = h('textarea', { class: 'inp ltr', spellcheck: 'false', style: { fontFamily: 'ui-monospace,monospace', fontSize: '13px' }, oninput: (e) => set('customCss', e.target.value) });
    css.value = d.customCss || '';
    frag.append(...group(I('customCss'), h('div', { class: 'hint' }, I('cssHint')), css));

    frag.append(h('button', { class: 'btn sec', style: { margin: '6px 0 14px' }, onclick: async () => {
      if (!(await confirmBox(I('confirmReset')))) return;
      S.cv.design = Object.assign({}, C.DEFAULT_DESIGN); dirty(); rerender(); } }, I('resetDesign')));
    return frag;
  }

  function tplIcon(id) {
    const t = C.TEMPLATES[id];
    const a = 'var(--btn)', g = 'color-mix(in srgb,var(--hint) 45%,transparent)';
    const lines = (x, y, w, n) => Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * 6}" width="${w - (i % 2) * 6}" height="2.4" rx="1" fill="${g}"/>`).join('');
    let s = `<svg viewBox="0 0 60 78"><rect width="60" height="78" rx="4" fill="#fff" stroke="${g}"/>`;
    if (t.layout === 'sidebar') s += `<rect width="20" height="78" rx="4" fill="${a}"/>` + (t.header === 'side' ? `<circle cx="10" cy="12" r="5" fill="#fff"/>` : '') + lines(25, t.header === 'main' ? 20 : 8, 30, t.header === 'main' ? 9 : 11) + (t.header === 'main' ? `<rect x="25" y="8" width="26" height="5" rx="1" fill="#333"/>` : '');
    else if (t.header === 'band') s += `<rect width="60" height="17" rx="4" fill="${a}"/><rect x="5" y="22" width="16" height="52" fill="color-mix(in srgb,${a} 15%,#fff)"/>` + lines(25, 24, 30, 8);
    else if (t.layout === 'two') s += `<rect x="6" y="7" width="30" height="5" rx="1" fill="#333"/><rect x="5" y="16" width="50" height="1" fill="${a}"/>` + lines(6, 22, 15, 8) + lines(25, 22, 30, 8);
    else {
      const c = id === 'classic' || id === 'elegant';
      s += `<rect x="${c ? 15 : 6}" y="7" width="30" height="5" rx="1" fill="#333"/><rect x="${c ? 20 : 6}" y="14" width="20" height="2" rx="1" fill="${id === 'ats' ? '#333' : a}"/>`;
      if (id === 'timeline') s += `<rect x="7" y="22" width="1" height="50" fill="${a}"/>` + lines(12, 22, 42, 9);
      else if (id === 'minimal') s += lines(6, 22, 10, 3) + lines(20, 22, 34, 9);
      else s += `<rect x="6" y="20" width="48" height="1" fill="${id === 'ats' ? '#333' : a}"/>` + lines(6, 25, 48, 8);
    }
    return s + '</svg>';
  }

  // ---------------- preview ----------------
  let pvTimer = null, pvToken = 0, lastPages = null, lastPagesLang = null, lastPagesKey = '';
  function schedulePreview(now) {
    if (S.tab === 'content') { lastPagesKey = ''; return; }
    clearTimeout(pvTimer);
    pvTimer = setTimeout(drawPreview, now ? 0 : 350);
  }
  async function drawPreview() {
    const token = ++pvToken;
    const target = S.tab === 'design' ? miniEl : document.getElementById('pv');
    if (!target || !S.cv) return;
    const scaler = target.querySelector('.scaler');
    const host = h('div');
    scaler.innerHTML = ''; scaler.append(host);
    const pages = await C.render(S.cv, S.plang, host);
    if (token !== pvToken) return;
    const pw = pages[0].offsetWidth;
    const avail = target.clientWidth - (S.tab === 'design' ? 0 : 16);
    const scale = S.tab === 'design' ? Math.min(0.34, avail / pw) : avail / pw;
    scaler.style.transform = `scale(${scale})`;
    scaler.style.width = pw + 'px';
    if (S.tab === 'preview') {
      target.style.height = Math.ceil(scaler.scrollHeight * scale) + 'px';
      const info = document.getElementById('pinfo'); if (info) info.textContent = pages.length + ' ' + I('pages');
    }
    lastPages = pages; lastPagesLang = S.plang; lastPagesKey = JSON.stringify(S.cv);
  }

  function previewTab() {
    const frag = h('div');
    if (langs().length > 1) frag.append(langSeg('plang'));
    frag.append(h('div', { class: 'pv-wrap' }, h('div', { id: 'pv', class: 'pv' }, h('div', { class: 'scaler' }))));
    frag.append(h('div', { id: 'pinfo', class: 'pinfo' }, ''));
    frag.append(h('button', { class: 'btn', onclick: () => sendPdf([S.plang]) }, I('sendPdf')));
    const row = h('div', { class: 'btns' });
    if (langs().length > 1) row.append(h('button', { class: 'btn sec', onclick: () => sendPdf(['en', 'ar']) }, I('sendBoth')));
    row.append(h('button', { class: 'btn sec', onclick: sendImage }, I('sendImg')));
    const desktop = tg && /^(tdesktop|macos|web|weba|webk|unigram)$/.test(tg.platform || '');
    if (desktop || !tg) row.append(h('button', { class: 'btn sec', onclick: printCv }, I('print')));
    frag.append(row);
    if (desktop) frag.append(h('div', { class: 'hint' }, I('printHint')));
    return frag;
  }

  // pages for a language: reuse the preview if it is current, otherwise render off-screen
  async function pagesFor(lang) {
    if (lastPages && lastPagesLang === lang && lastPagesKey === JSON.stringify(S.cv) && lastPages[0].isConnected) return lastPages;
    const off = document.getElementById('offscreen');
    off.innerHTML = '';
    const host = h('div'); off.append(host);
    return await C.render(S.cv, lang, host);
  }

  const fileBase = (lang) => {
    const n = C.tr(S.cv.personal.name, lang) || S.cv.title || 'CV';
    return `${n} - CV${langs().length > 1 ? ' (' + lang.toUpperCase() + ')' : ''}`;
  };

  function toBase64(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  async function upload(bytes, meta) {
    const b64 = toBase64(bytes);
    const size = 450000, total = Math.max(1, Math.ceil(b64.length / size));
    const uid = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    for (let part = 0; part < total; part++) {
      busy(I('uploading') + (total > 1 ? ` ${Math.round(((part + 1) / total) * 100)}%` : ''));
      await call('send', Object.assign({ uid, part, total, data: b64.slice(part * size, (part + 1) * size) }, meta));
    }
  }

  async function sendPdf(list) {
    if (S.busy) return;
    try {
      await flush();
      for (const lang of list) {
        busy(I('generating') + ' PDF' + (list.length > 1 ? ' (' + lang.toUpperCase() + ')' : '') + '…');
        const pages = await pagesFor(lang);
        const bytes = await C.exportPdf(pages, S.cv, { lang, onProgress: (i, n) => busy(`${I('generating')} PDF ${i}/${n}…`) });
        await upload(bytes, { name: fileBase(lang), ext: 'pdf', kind: 'document', caption: I('caption') });
      }
      busy(); toast(I('sent'));
      try { tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred('success'); } catch (e) { /* */ }
    } catch (e) { busy(); toast(I('failed') + e.message); console.error(e); }
  }

  async function sendImage() {
    if (S.busy) return;
    try {
      busy(I('generating') + '…');
      const pages = await pagesFor(S.plang);
      for (let i = 0; i < pages.length; i++) {
        const bytes = await C.exportJpeg(pages[i], S.cv, 2);
        await upload(bytes, { name: fileBase(S.plang) + (pages.length > 1 ? ` ${i + 1}` : ''), ext: 'jpg', kind: 'photo', caption: pages.length > 1 ? `${i + 1}/${pages.length}` : '' });
      }
      busy(); toast(I('sent'));
    } catch (e) { busy(); toast(I('failed') + e.message); }
  }

  async function printCv() {
    const pages = await pagesFor(S.plang);
    const ps = C.pageSize(S.cv.design);
    const w = window.open('', '_blank');
    if (!w) { toast('Pop-up blocked'); return; }
    const root = pages[0].parentElement;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${C.esc(fileBase(S.plang))}</title>
      ${document.getElementById('cv-fonts') ? `<link rel="stylesheet" href="${document.getElementById('cv-fonts').href}">` : ''}
      <style>@page{size:${ps.w}mm ${ps.h}mm;margin:0}body{margin:0}.cv-page{page-break-after:always;break-after:page}</style></head>
      <body>${root.outerHTML}<script>document.fonts.ready.then(()=>setTimeout(()=>print(),400))<\/script></body></html>`);
    w.document.close();
  }

  // ---------------- menu & CV management ----------------
  function sheet(title, build) {
    const bg = h('div', { class: 'sheet-bg', onclick: (e) => { if (e.target === bg) close(); } });
    const close = () => bg.remove();
    bg.append(h('div', { class: 'sheet' }, h('h3', null, title), build(close)));
    document.body.append(bg);
  }

  function menuSheet() {
    sheet(I('menu'), (close) => {
      const b = h('div');
      const item = (label, fn, danger) => h('button', { class: 'list-btn' + (danger ? ' danger' : ''), onclick: () => { close(); fn(); } }, label);
      const chipRow = (cur, opts, fn) => h('div', { class: 'chips', style: { margin: '0 0 12px' } },
        opts.map(([v, lab]) => h('button', { class: 'chip' + (cur === v ? ' on' : ''), onclick: () => { close(); fn(v); } }, lab)));

      b.append(h('div', { class: 'g-title' }, I('cvLangs')),
        chipRow(langs().join(','), [['en', I('enOnly')], ['ar', I('arOnly')], ['en,ar', I('both')]], (v) => { S.cv.langs = v.split(','); dirty(); render(); }));
      b.append(h('div', { class: 'g-title' }, I('uiLang')),
        chipRow(S.ui, [['en', 'English'], ['ar', 'العربية']], (v) => { setUi(v); call('cv', { action: 'prefs', lang: v }).catch(() => {}); render(); }));
      b.append(item(I('rename'), renameSheet), item(I('newBlank'), () => newCv(false)), item(I('newSample'), () => newCv(true)),
        item(I('duplicate'), duplicateCv), item(I('exportJson'), exportJson), item(I('importJson'), importJson),
        item(I('clearAll'), clearAll, true), item(I('del'), deleteCv, true));
      return b;
    });
  }

  function renameSheet() {
    sheet(I('rename'), (close) => {
      const inp = h('input', { class: 'inp', value: S.cv.title || '', dir: 'auto' });
      setTimeout(() => inp.focus(), 50);
      return h('div', null, h('label', { class: 'f' }, h('span', null, I('cvName')), inp),
        h('div', { class: 'btns' }, h('button', { class: 'btn sec', onclick: close }, I('cancel')),
          h('button', { class: 'btn', onclick: () => { S.cv.title = inp.value.trim() || 'CV'; close(); dirty(); save(); render(); } }, I('ok'))));
    });
  }

  async function newCv(sample, fromCv) {
    await flush();
    const n = S.cvs.length + 1;
    const cv = fromCv || (sample ? C.sampleCv() : C.blankCv());
    cv.id = C.uid(); cv.title = fromCv ? (fromCv.title || 'CV') + ' (2)' : (S.ui === 'ar' ? 'سيرتي ' : 'My CV ') + n;
    S.cv = C.normalize(cv); S.cvs.unshift({ id: S.cv.id, title: S.cv.title }); S.open = {};
    await save(); render();
  }
  function duplicateCv() { newCv(false, JSON.parse(JSON.stringify(S.cv))); }

  async function deleteCv() {
    if (!(await confirmBox(I('confirmDel')))) return;
    try {
      const r = await call('cv', { action: 'remove', id: S.cv.id });
      S.cvs = r.cvs;
      if (S.cvs.length) await openCv(S.cvs[0].id); else { S.cv = null; await newCv(true); }
    } catch (e) { toast(I('failed') + e.message); }
  }

  async function clearAll() {
    if (!(await confirmBox(I('confirmClear')))) return;
    const fresh = C.blankCv();
    S.cv.personal = fresh.personal; S.cv.sections = fresh.sections; S.open = {};
    dirty(); render();
  }

  async function openCv(id) {
    if (S.cv && id === S.cv.id) return;
    await flush();
    busy('…');
    try { const r = await call('cv', { action: 'get', id }); S.cv = C.normalize(r.cv); S.open = {}; }
    catch (e) { toast(I('failed') + e.message); }
    busy(); render();
  }

  async function exportJson() {
    try {
      await flush();
      const bytes = new TextEncoder().encode(JSON.stringify(S.cv, null, 1));
      await upload(bytes, { name: (S.cv.title || 'CV') + ' backup', ext: 'json', kind: 'document', caption: 'Backup' });
      busy(); toast(I('sent'));
    } catch (e) { busy(); toast(I('failed') + e.message); }
  }

  function importJson() {
    const inp = h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' }, onchange: async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (!data || !Array.isArray(data.sections)) throw new Error('bad');
        await newCv(false, C.normalize(data));
        toast(I('imported'));
      } catch (err) { toast(I('badFile')); }
      inp.remove();
    } });
    document.body.append(inp); inp.click();
  }

  // ---------------- boot ----------------
  async function boot() {
    try { tg && tg.ready(); tg && tg.expand(); } catch (e) { /* */ }
    const qs = new URLSearchParams(location.search);
    const code = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.language_code) || navigator.language || 'en';
    setUi(qs.get('lang') || (String(code).startsWith('ar') ? 'ar' : 'en'));
    try {
      const r = await call('cv', { action: 'bootstrap', lang: qs.get('lang') || undefined });
      setUi(r.lang || S.ui);
      S.cvs = r.cvs || [];
      if (r.cv) S.cv = C.normalize(r.cv);
      else {
        const cv = C.sampleCv(); cv.title = S.ui === 'ar' ? 'سيرتي الذاتية' : 'My CV';
        S.cv = C.normalize(cv); S.cvs = [{ id: S.cv.id, title: S.cv.title }];
        S.open.personal = true;
        await save();
      }
      S.clang = S.plang = langs().includes(S.ui) ? S.ui : langs()[0];
      render();
    } catch (e) {
      app.innerHTML = '';
      app.append(h('div', { class: 'empty' }, I('failed') + e.message));
    }
  }
  window.addEventListener('resize', () => { if (S.tab !== 'content') schedulePreview(); });
  boot();
})();
