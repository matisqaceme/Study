#!/usr/bin/env node
// Build the Owl Dental site on the Prism Oral Surgery design.
//
//   node rebrand/owldental/build.mjs [srcDir=sites/prismoralsurgery.com] [outDir=sites/owldental-on-prism]
//
// Takes the captured Prism pages as templates, replaces every piece of practice information with Owl
// Dental's (content.mjs), drops the Prism pages Owl has no equivalent for, removes Prism's trackers,
// booking widget, form backend and font kit, and prunes Prism assets nothing references any more.
import { load } from 'cheerio';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from './content.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(process.argv[2] ?? 'sites/prismoralsurgery.com');
const OUT = path.resolve(process.argv[3] ?? 'sites/owldental-on-prism');
const ASSETS = path.join(HERE, 'assets');
const OWL = '/assets/owl'; // where Owl images live in the output

const P = C.practice;
const T = C.treatments;

// ---------------------------------------------------------------- URL helpers
const SKIP_URL = /^(https?:|mailto:|tel:|sms:|#|data:|blob:|javascript:|\/\/)/i;
const URL_ATTRS = ['href', 'src', 'poster', 'data-src', 'action'];
const rewriteCss = (css, fn) => css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => `url(${q}${fn(u)}${q})`);
const rewriteSrcset = (v, fn) => v.split(/,\s+/).map((c) => { const m = c.trim().match(/^(\S+)(\s+.+)?$/); return m ? fn(m[1]) + (m[2] ?? '') : c; }).join(', ');

function mapUrls($, fn) {
  $('*').each((_, el) => {
    for (const a of URL_ATTRS) { const v = el.attribs?.[a]; if (v != null) el.attribs[a] = fn(v); }
    if (el.attribs?.srcset) el.attribs.srcset = rewriteSrcset(el.attribs.srcset, fn);
    if (el.attribs?.style && /url\(/.test(el.attribs.style)) el.attribs.style = rewriteCss(el.attribs.style, fn);
  });
  $('style').each((_, el) => { const css = $(el).html(); if (css && /url\(/.test(css)) $(el).html(rewriteCss(css, fn)); });
}
/** Make every relative URL in a template root-relative ("/x/y"), given the template page's directory. */
const absolutize = ($, tplDir) => mapUrls($, (v) => (SKIP_URL.test(v) || v.startsWith('/')) ? v : path.posix.resolve('/' + tplDir, v.replace(/^\.\//, '')) + '');
/** Turn root-relative URLs back into relative ones for the output page's directory. */
const relativize = ($, outDir) => mapUrls($, (v) => {
  if (!v.startsWith('/') || v.startsWith('//')) return v;
  const m = v.match(/^([^?#]*)(.*)$/); let rel = path.posix.relative('/' + outDir, m[1]) || '.';
  if (m[1].endsWith('/') && !rel.endsWith('/')) rel += '/';
  if (rel === './' ) rel = './'; if (rel === '.') rel = './';
  return rel + m[2];
});

// ---------------------------------------------------------------- template loading
const cache = new Map();
function tpl(page) { // page: '' (home) or 'about' or 'services/specialty-services/dental-implants'
  const file = path.join(SRC, page, 'index.html');
  if (!cache.has(file)) cache.set(file, fs.readFileSync(file, 'utf8'));
  const $ = load(cache.get(file));
  absolutize($, page);
  return $;
}
const owlImg = (name) => `${OWL}/${name}`;
const setText = (el, text) => { el.contents().remove(); el.text(text); };
const textOf = (e) => (e.type === 'text' ? e.data : (e.children || []).map(textOf).join(''));
/** First element matching `sel` (under a cheerio root `$` or inside a selection) whose text contains `text`. */
/** Element whose own text (a single text node) contains `text`: a heading or label, never a container. */
const leafBy = ($, text) => { // the smallest element whose text contains `text`
  let best = null; $('h1, h2, h3, h4, h5, div, p, span, a, strong').each((_, e) => { const t = textOf(e).replace(/\s+/g, ' ').trim(); if (t.includes(text) && (!best || t.length <= textOf(best).replace(/\s+/g, ' ').trim().length)) best = e; });
  return $(best);
};
const firstBy = (root, sel, text) => (typeof root === 'function' ? root(sel) : root.find(sel)).filter((_, e) => textOf(e).replace(/\s+/g, ' ').trim().includes(text)).first();

// ---------------------------------------------------------------- transforms shared by every page
function stripThirdParty($) {
  $('script[src]').each((_, s) => { if (/googletagmanager|gtag\/js|patientloop|usebasin|recaptcha|typekit/i.test(s.attribs.src)) $(s).remove(); });
  $('script:not([src])').each((_, s) => { const t = $(s).html() || ''; if (/gtm\.start|nuggetUrl|Typekit\.load|application\/ld\+json|dataLayer/.test(t) || s.attribs.type === 'application/ld+json') $(s).remove(); });
  $('noscript').each((_, n) => { if (/googletagmanager/.test($(n).html() || '')) $(n).remove(); });
  $('link[rel="preconnect"], link[rel="dns-prefetch"]').each((_, l) => { if (/patientloop|usebasin|typekit|googletagmanager/.test(l.attribs.href || '')) $(l).remove(); });
  $('[class*="pl-booking"], [data-pl-booking]').removeAttr('data-pl-booking');
}

function headMeta($, { title, description, pagePath }) {
  $('title').text(title);
  $('meta[name="description"]').attr('content', description);
  $('meta[property="og:title"], meta[name="twitter:title"], meta[property="twitter:title"]').attr('content', title);
  $('meta[property="og:description"], meta[name="twitter:description"], meta[property="twitter:description"]').attr('content', description);
  $('meta[property="og:image"], meta[name="twitter:image"], meta[property="twitter:image"]').attr('content', `${P.domain}${owlImg('hero-wexford.jpg')}`);
  $('html').attr('data-wf-domain', 'www.owldental.ie');
  $.root().contents().each((_, n) => { if (n.type === 'comment') $(n).remove(); });
  $.root().prepend(`<!-- ${P.name}: built from the Prism Oral Surgery design by rebrand/owldental/build.mjs on ${new Date().toISOString().slice(0, 10)} -->\n`);
  $('meta[property="og:url"], link[rel="canonical"]').remove();
  $('link[rel="icon"], link[rel="shortcut icon"]').attr('href', owlImg('favicon-32.png'));
  $('link[rel="apple-touch-icon"]').attr('href', owlImg('favicon-256.png'));
  $('head').append(`<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': ['Dentist', 'LocalBusiness'], name: P.name, url: P.domain + pagePath, telephone: '+353 53 912 2364', email: P.email,
    address: { '@type': 'PostalAddress', streetAddress: 'Redmond Square', addressLocality: 'Wexford', addressRegion: 'County Wexford', postalCode: 'Y35 NYR8', addressCountry: 'IE' },
    openingHours: ['Mo-Fr 09:00-18:00'], image: P.domain + owlImg('hero-wexford.jpg'),
  })}</script>`);
}

function navbar($) {
  // Logo lockup in place of the Prism wordmark.
  const logo = $('.navbar1_logo').first();
  logo.replaceWith(`<div class="navbar1_logo owl-lockup"><img src="${owlImg('owl-logo.png')}" alt="${P.name}" class="owl-lockup_mark"><span class="owl-lockup_name">${P.name}</span></div>`);
  const ext = $('.logo_extension'); ext.children().eq(0).text(P.dentist); ext.children().eq(1).text('General Dentist, Founder of Owl Dental');
  $('.navbar1_logo-link').attr('href', '/');

  const links = $('.navbar1_menu-links');
  const home = links.children().first(); // <a class="navbar1_link">Home</a>
  const simpleLink = (text, href) => home.clone().removeClass('w--current').removeAttr('aria-current').attr('href', href).text(text);
  const kids = links.children().toArray();
  const byText = (t) => $(kids.find((k) => $(k).text().replace(/\s+/g, ' ').trim().startsWith(t)));

  byText('About Us').replaceWith(simpleLink('About', '/about/'));
  const services = byText('Services');
  services.find('.w-dropdown-toggle div, .w-dropdown-toggle').first().contents().filter((_, n) => n.type === 'text').first().replaceWith('Treatments');
  services.find('.w-dropdown-toggle div').first().text('Treatments');
  // One column of treatment links, the other Prism columns dropped.
  const list = services.find('.navbar-dropdown4_dropdown-link-list').first();
  const headings = list.find('a.service-heading');
  const firstHeading = headings.first();
  const firstList = firstHeading.next();
  headings.slice(1).each((_, h) => { $(h).next().remove(); $(h).remove(); });
  firstHeading.attr('href', '/services/').text('Our Treatments');
  const linkTpl = firstList.find('a.navbar-dropdown4_service-link').first();
  const itemTpl = linkTpl.closest('.w-dyn-item').length ? linkTpl.closest('.w-dyn-item') : linkTpl;
  const container = itemTpl.parent();
  container.children().remove();
  for (const t of T) { const it = itemTpl.clone(); const a = it.is('a') ? it : it.find('a').first(); a.attr('href', `/services/${t.slug}/`).text(t.title); container.append(it); }
  services.find('.navbar-dropdown4_bottom-bar a.button').attr('href', '/services/').find('p, div').first().text('All Treatments');
  services.find('.navbar-dropdown4_bottom-bar a.button').filter((_, a) => !$(a).find('p, div').length).text('All Treatments');
  byText('For Patients').replaceWith(simpleLink('Pricelist', '/pricelist/'));
  byText('For Referrers').remove();
  byText('Blog').remove();
  byText('Contact').attr('href', '/contact-us/');
  // Phone + appointment buttons
  const btns = $('.navbar1_menu-buttons');
  btns.find('a.phone-swap').attr('href', P.phoneHref).text(P.phone);
  btns.find('a.pl-booking-decorated, a.button:not(.phone-swap)').attr('href', '/contact-us/#appointment').removeClass('pl-booking-decorated').text('Book an Appointment');
}

function footer($) {
  const f = $('footer');
  f.find('.footer_logo').replaceWith(`<div class="footer_logo owl-lockup is-footer"><img src="${owlImg('owl-logo.png')}" alt="${P.name}" class="owl-lockup_mark"><span class="owl-lockup_name">${P.name}</span></div>`);
  f.find('.footer_logo-link').attr('href', '/');
  // Address / contact block
  firstBy(f, 'a', '55 Woodland').attr('href', P.mapsLink).text(P.addressLine);
  f.find('a.phone-swap').attr('href', P.phoneHref).text(P.phone);
  f.find('a[href^="mailto:"]').attr('href', `mailto:${P.email}`).text(P.email);
  f.find('.footer_social-link').remove();
  contactItems(f);
  // Link columns: one main column and one treatments column.
  const cols = f.find('.footer_link-list');
  const main = cols.first(); const linkTpl = main.find('a.footer_link').first();
  main.children().remove();
  for (const [t, h] of [['Home', '/'], ['About', '/about/'], ['Treatments', '/services/'], ['Dental Implants', '/services/dental-implants/'], ['Pricelist', '/pricelist/'], ['Contact', '/contact-us/']]) main.append(linkTpl.clone().removeClass('w--current').removeAttr('aria-current').attr('href', h).text(t));
  const treat = cols.eq(1); const head = treat.find('a.footer_link').first(); const nested = treat.find('.w-dyn-item').first();
  head.attr('href', '/services/').text('Our Treatments');
  const nestedWrap = nested.parent(); nestedWrap.children().remove();
  for (const t of T) { const it = nested.clone(); it.find('a').attr('href', `/services/${t.slug}/`).text(t.title); nestedWrap.append(it); }
  cols.slice(2).remove();
  f.find('.footer_credit-text').html(`© <span class="year-span">2026</span> ${P.copyright}`);
  f.find('.footer9_legal-link').remove();
}

/** The repeated email / phone / address / hours block used in hero, contact sections and footer. */
function contactItems(root) {
  root.find('.footer-contact_item, .footer-contact_info, a[href^="mailto:"], a[href^="tel:"], a[href*="maps.app.goo.gl"], a[href*="google.com/maps"]').each((_, a) => {
    const el = root.find(a); const href = el.attr('href') || ''; const txt = textOf(a);
    if (/224-1708/.test(txt)) { el.remove(); return; } // Prism's fax line; Owl has none
    const labels = el.find('div').filter((_, d) => textOf(d).trim() !== '' && !el.find(d).children('div').length); // text-bearing leaf divs
    const isLabel = (re) => labels.length === 1 && re.test(labels.first().text().trim());
    const setLeaf = (v) => { if (labels.length) { labels.first().text(v); labels.slice(1).remove(); } else if (!el.children().length) el.text(v); };
    if (href.startsWith('mailto:') || /@prismoralsurgery/.test(txt)) { if (a.name === 'a') el.attr('href', `mailto:${P.email}`); if (!isLabel(/^Email$/i)) setLeaf(P.email); }
    else if (href.startsWith('tel:') || /908[) -]+224/.test(txt)) { if (a.name === 'a') el.attr('href', P.phoneHref); if (!isLabel(/^Phone$/i)) setLeaf(P.phone); }
    else if (/maps/.test(href) || /Woodland/.test(txt)) { if (a.name === 'a') el.attr('href', P.mapsLink); if (!isLabel(/^Location$/i)) setLeaf(P.addressLine); }
  });
  root.find('p').each((_, p) => { const el = root.find(p); if (/Mon - Fri: 7:30/.test(el.text())) el.html(P.hoursHtml); });
}

/** Safety net: any Prism detail left in plain text anywhere on the page. */
function sweepText($) {
  const R = [
    [/info@prismoralsurgery\.com/g, P.email], [/\(908\) 224-1707|908-224-1707/g, P.phone], [/\(908\) 224-1708/g, ''],
    [/55 Woodland Avenue, Summit,? New Jersey 07901( United States)?/g, P.addressLine], [/Summit, NJ/g, 'Wexford'],
    [/Prism Oral Surgery & Implants of Summit|Prism Oral Surgery/g, P.name], [/Dr\. Jean Kim, DDS|Dr\. Jean Kim|Dr\. Kim/g, P.dentist],
  ];
  const walk = (n) => { for (const c of n.children || []) { if (c.type === 'text') { let t = c.data; for (const [re, v] of R) t = t.replace(re, v); c.data = t; } else if (c.type === 'tag' && !/^(script|style)$/.test(c.name)) walk(c); } };
  walk($.root()[0]);
  $('div, span, p').each((_, e) => { if (e.children.length === 1 && e.children[0].type === 'text' && e.children[0].data.trim() === '' && (e.attribs.class || '') === '') $(e).remove(); });
}

function heroSocial($) { // Prism's facebook/instagram/maps icon row: keep only the map pin
  $('.hero_social-link').each((_, a) => { const href = a.attribs.href || ''; if (/maps/.test(href)) $(a).attr('href', P.mapsLink); else $(a).closest('.w-dyn-item').length ? $(a).closest('.w-dyn-item').remove() : $(a).remove(); });
}

function appointmentButtons($) {
  $('a.pl-booking-decorated, a[href*="patientloop"]').each((_, a) => { $(a).attr('href', '/contact-us/#appointment').removeClass('pl-booking-decorated'); if (/Make an Appointment|Book Appointment/i.test($(a).text())) $(a).text('Book an Appointment'); });
  $('a[href*="pdf.dsnforms.com"], a[href*="weavebillpay"], a[href*="patientviewer.com"]').each((_, a) => $(a).attr('href', '/contact-us/'));
}

function forms($) { // Basin + reCAPTCHA -> Netlify Forms, without the SMS and legal checkboxes
  $('form').each((i, f) => {
    const el = $(f);
    for (const a of Object.keys(f.attribs)) if (/^data-basin|^data-wf|^data-widget|^value$/.test(a)) el.removeAttr(a);
    el.attr({ method: 'POST', action: '/contact-us/thanks/', name: 'appointment', 'data-netlify': 'true', 'netlify-honeypot': 'bot-field', id: 'appointment-form' });
    el.find('.form_checkbox-wrapper, .w-checkbox, .g-recaptcha, .grecaptcha-badge').remove();
    el.find('input[type="hidden"]').remove();
    el.find('[class*="recaptcha"]').remove();
    el.find('input[type="checkbox"]').closest('label, div').remove();
    el.prepend('<input type="hidden" name="form-name" value="appointment"><p class="owl-hidden"><label>Don’t fill this out: <input name="bot-field"></label></p>');
    el.find('input[type="submit"], .button[type="submit"]').attr('value', 'Send').attr('data-wait', 'Sending…');
  });
  $('.w-form-done, .w-form-fail, .success-text, .error-text').remove();
  $('iframe').each((_, i) => { if (/recaptcha/i.test((i.attribs.src || '') + (i.attribs.title || ''))) { const p = $(i).parent(); if (p.is('div') && p.children().length <= 2 && !p.attr('class')) p.remove(); else $(i).remove(); } });
  $('.grecaptcha-badge, textarea.g-recaptcha-response').remove();
  $('script:not([src])').each((_, s) => { if (/Select all form elements/.test($(s).html() || '')) $(s).remove(); });
}

function maps($) {
  $('iframe').each((_, i) => { if (/google\.com\/maps/.test(i.attribs.src || '')) $(i).attr('src', P.mapsEmbed).attr('title', 'Owl Dental, Redmond Square, Wexford'); });
  $('a[href*="maps.app.goo.gl"], a[href*="google.com/maps/place"]').attr('href', P.mapsLink);
}

function extraCss($) {
  $('head').append(`<style>
.owl-lockup{display:flex;align-items:center;gap:.6rem;width:auto;min-height:2rem}
.owl-lockup_mark{height:2.6rem;width:auto}
.owl-lockup_name{font-family:var(--_typography---font-styles--heading);font-size:1.6rem;line-height:1;color:var(--_primitives---colors--brand--blue);white-space:nowrap}
.owl-lockup.is-footer .owl-lockup_mark{height:4rem}
.owl-lockup.is-footer .owl-lockup_name{font-size:2.2rem}
.owl-hidden{display:none}
.owl-price{list-style:none;padding:0;margin:0 0 1.5rem}
.owl-price li{display:flex;justify-content:space-between;gap:1rem;padding:.6rem 0;border-bottom:1px solid rgba(0,0,0,.08)}
.owl-price li span:last-child{white-space:nowrap;font-weight:600}
.owl-price li small{display:block;font-weight:400;opacity:.8}
</style>`);
}

function common($, meta) {
  stripThirdParty($); headMeta($, meta); extraCss($); navbar($); footer($); heroSocial($); appointmentButtons($); forms($); maps($); contactItems($('main'));
}

function priceHtml(rows) {
  if (!rows.length) return '';
  return `<h2><strong>Pricing</strong></h2><ul class="owl-price">${rows.map(([n, p, note]) => `<li><span>${n}${note ? `<small>${note}</small>` : ''}</span><span>${p}</span></li>`).join('')}</ul><p>Treatments marked with * are eligible for 20% tax relief under the Med 2 scheme. We participate in the PRSI scheme.</p>`;
}

// ---------------------------------------------------------------- pages
const pages = []; // { dir, html }
function emit(dir, $) { sweepText($); relativize($, dir); pages.push({ dir, html: $.html() }); }

function buildHome() {
  const $ = tpl('');
  common($, { title: `${P.name} | Dentist in Wexford Town`, description: C.intro, pagePath: '/' });
  const hero = $('.section_home-hero');
  hero.find('.text-style-tagline').first().text(C.home.tagline);
  hero.find('h1').first().attr('aria-label', C.home.h1).html(C.home.h1);
  hero.find('p.text-size-medium').first().text(C.home.lead);
  $('.home-hero_background-image').attr({ src: owlImg('hero-wexford.jpg'), alt: 'Wexford Town at dusk' }).removeAttr('srcset').removeAttr('sizes');
  // Meet the founder
  const meet = $('.layout18_image').first(); meet.attr({ src: owlImg('team-andre-lemos.jpg'), alt: P.dentist }).removeAttr('srcset').removeAttr('sizes');
  const meetSec = meet.closest('section'); meetSec.find('h2').first().text(C.home.meetH2); meetSec.find('p.text-size-medium').first().text(C.home.meetP); meetSec.find('a.button').first().attr('href', '/about/').text(C.home.meetButton);
  // Treatment cards
  const grid = $('.services_item-list').first(); const cardTpl = grid.find('.services_item').first();
  const svcSec = grid.closest('section'); svcSec.find('h2').first().text(C.home.servicesH2); svcSec.find('p.text-size-medium').first().text(C.home.servicesP);
  $('.services_image').first().attr({ src: owlImg('treat-3.jpg'), alt: 'A patient smiling' }).removeAttr('srcset').removeAttr('sizes');
  const icons = grid.find('.services_item img.icon-1x1-medium').toArray().map((i) => i.attribs.src);
  grid.children().remove();
  T.slice(0, 6).forEach((t, i) => { const c = cardTpl.clone(); c.find('h3').text(t.title); c.find('p').first().text(t.card); c.find('img.icon-1x1-medium').attr('src', icons[i % icons.length]); const a = c.find('a.button'); a.attr('href', `/services/${t.slug}/`); a.find('div').first().text(`Explore ${t.short}`); grid.append(c); });
  firstBy($, 'a.button', 'Explore All Services').attr('href', '/services/').text(C.home.servicesButton);
  // "Advanced technology" strip
  const tech = $('.advanced-technology_item').first().closest('section');
  tech.find('h2').first().text(C.home.techH2); tech.find('p.text-size-medium').first().text(C.home.techP);
  tech.find('.advanced-technology_item').each((i, it) => { const d = C.home.techItems[i]; if (!d) { $(it).remove(); return; } $(it).find('img').attr({ src: owlImg(d[2]), alt: d[0] }).removeAttr('srcset').removeAttr('sizes'); $(it).find('p').first().html(`<strong>${d[0]}</strong> ${d[1]}`); });
  // Why choose slider
  firstBy($, 'h3', 'Why Patients Choose').text(C.home.whyH3);
  $('.slider_slide').each((i, s) => { const d = C.home.whyItems[i]; if (!d) return; $(s).find('h3').text(d[0]); $(s).find('p').first().text(d[1]); });
  // New patients
  const np = $('.logo4_wrapper').first().closest('section');
  np.find('h2').first().text(C.home.newH2); np.find('p.text-size-medium').first().text(C.home.newP); np.find('a.button').first().attr('href', '/pricelist/').text(C.home.newButton);
  np.find('.logo4_wrapper').each((i, a) => { const d = C.home.newLinks[i]; if (!d) { $(a).remove(); return; } $(a).attr('href', d[1]).find('div').first().text(d[0]); });
  // Contact section
  const ct = $('form').first().closest('section'); ct.find('h2').first().text(C.home.contactH2); ct.find('p.text-size-medium').first().text(C.home.contactP);
  emit('', $);
}

function buildAbout() {
  const $ = tpl('about');
  common($, { title: `About Us | ${P.name}, Wexford Town`, description: C.about.lead, pagePath: '/about/' });
  const hero = $('.section_hero'); hero.find('.text-style-tagline').first().text(C.about.tagline); hero.find('h1').first().text(C.about.h1); hero.find('p.text-size-medium').first().text(C.about.lead);
  $('img.hero_image').attr({ src: owlImg('implants-3.jpg'), alt: 'Owl Dental, Wexford' }).removeAttr('srcset').removeAttr('sizes');
  firstBy($, 'h2', 'What Sets Us Apart').text('What Sets Us Apart');
  const apartSec = firstBy($, 'h2', 'What Sets Us Apart').closest('section');
  apartSec.find('.text-size-medium').each((i, e) => { const d = C.about.apart[i]; if (d) { $(e).text(d[0]); $(e).next('.text-size-regular').text(d[1]); } });
  firstBy($, 'h2', 'Our Philosophy').closest('section').find('p.text-size-medium').first().text(C.about.philosophy);
  const meet = $('.layout18_image').first(); meet.attr({ src: owlImg('team-andre-lemos.jpg'), alt: P.dentist }).removeAttr('srcset').removeAttr('sizes');
  const meetSec = meet.closest('section'); meetSec.find('h2').first().text(`Meet ${P.dentist}`); meetSec.find('p.text-size-medium').first().text(C.about.dentistBlurb);
  const staffH2 = firstBy($, 'h2', 'Meet our amazing staff'); staffH2.text('Meet Our Team');
  staffH2.closest('.section_slider').removeClass('hide'); // Prism hides its placeholder team slider; Owl has a real team
  staffH2.closest('.slider_card').find('p').first().text(C.about.staffIntro); staffH2.closest('section').find('p.text-size-medium').first().text(C.about.staffIntro);
  const imgs = $('.team_image'); const cardTpl = imgs.first().closest('.w-dyn-item, .slider_slide, .team_item, [class*="item"]');
  const wrap = cardTpl.parent(); wrap.children().remove();
  for (const [name, role, img] of C.about.team) { const c = cardTpl.clone(); c.find('img.team_image').attr({ src: owlImg(img), alt: name }).removeAttr('srcset').removeAttr('sizes'); c.find('h3').text(name); c.find('p').first().text(role); wrap.append(c); }
  firstBy($, 'h2', 'Visit Us in Summit').text(C.about.visitH2);
  const visit = firstBy($, 'h2', C.about.visitH2).closest('section');
  visit.find('.text-rich-text').first().html(`<p>${C.about.visitP}</p><p>Call <a href="${P.phoneHref}" class="phone-swap">${P.phone}</a> or <a href="/contact-us/">request an appointment online</a>.</p>`);
  emit('about', $);
}

function buildServices() {
  const $ = tpl('services');
  common($, { title: `Dental Treatments in Wexford | ${P.name}`, description: C.servicesPage.lead, pagePath: '/services/' });
  const hero = $('.section_hero'); hero.find('.text-style-tagline').first().text(C.servicesPage.tagline); hero.find('h1').first().text(C.servicesPage.h1); hero.find('p.text-size-medium').first().html(C.servicesPage.lead);
  $('img.hero_image').attr({ src: owlImg('treat-4.jpg'), alt: 'Dental treatments at Owl Dental' }).removeAttr('srcset').removeAttr('sizes');
  leafBy($, 'Explore Our Services').text(C.servicesPage.gridH2);
  const cards = $('.blog36_item').filter((_, e) => $(e).find('.blog36_image').length > 0); // the grid's first item is the heading cell
  const cardTpl = cards.first().clone(); const list = $('.blog36_list').first(); cards.remove();
  for (const t of T) { const c = cardTpl.clone(); c.find('img').attr({ src: owlImg(t.image), alt: t.title }).removeAttr('srcset').removeAttr('sizes'); c.find('h3').text(t.title); c.find('.text-size-regular').first().text(t.card); const a = c.find('a.button'); a.attr('href', `/services/${t.slug}/`); a.find('div').first().text(`Explore ${t.short}`); c.find('a:not(.button)').attr('href', `/services/${t.slug}/`); list.append(c); }
  const expH2 = firstBy($, 'h2', 'What to Expect'); expH2.text(C.servicesPage.expectH2);
  expH2.closest('section').find('.text-size-medium').each((i, e) => { const d = C.servicesPage.expect[i]; if (d) { $(e).html(d[0]); $(e).next('.text-size-regular').html(d[1]); } });
  const cta = firstBy($, 'h2', 'Not Sure Where to Start'); cta.text(C.servicesPage.ctaH2);
  const ctaSec = cta.closest('section');
  ctaSec.find('.text-rich-text').first().html(`<p>${C.servicesPage.ctaP}</p><p>Call <a href="${P.phoneHref}" class="phone-swap">${P.phone}</a> or <a href="/contact-us/">request an appointment online</a>.</p>`);
  emit('services', $);
}

function buildTreatment(t) {
  const $ = tpl('services/specialty-services/dental-implants');
  common($, { title: `${t.title} in Wexford | ${P.name}`, description: t.intro, pagePath: `/services/${t.slug}/` });
  const hero = $('.section_hero'); hero.find('.text-style-tagline').first().text(t.tagline); hero.find('h1').first().text(`${t.title} in Wexford`); hero.find('p.text-size-medium').first().text(t.intro);
  $('img.hero_image').attr({ src: owlImg(t.hero), alt: t.title }).removeAttr('srcset').removeAttr('sizes');
  const rich = $('.text-rich-text').first(); rich.html(t.body + priceHtml(t.price));
  firstBy($, 'h2', 'FAQs').closest('section, .faq2_component, [class*="faq"]').remove();
  const cta = $('.section_contact5'); cta.find('h2').first().text(`Book a ${t.title} Consultation in Wexford`);
  cta.find('.text-rich-text').first().html(`<p>If you’d like to talk about ${t.title.toLowerCase()}, ${P.name} in Redmond Square, Wexford Town is here to help. Call <a href="${P.phoneHref}">${P.phone}</a> or <a href="/contact-us/">request an appointment online</a>.</p>`);
  cta.find('.w-richtext a[href*="google.com/maps"]').text(P.addressLine);
  emit(`services/${t.slug}`, $);
}

function buildPricelist() {
  const $ = tpl('services/specialty-services/dental-implants');
  common($, { title: `${C.pricelist.title} | ${P.name}`, description: `${C.pricelist.tagline}. ${C.pricelist.intro}`, pagePath: '/pricelist/' });
  const hero = $('.section_hero'); hero.find('.text-style-tagline').first().text(C.pricelist.tagline); hero.find('h1').first().text(C.pricelist.title); hero.find('p.text-size-medium').first().text(C.pricelist.intro);
  $('img.hero_image').attr({ src: owlImg('treat-3.jpg'), alt: 'Owl Dental pricelist' }).removeAttr('srcset').removeAttr('sizes');
  const rows = C.pricelist.items.map(([n, p, note]) => `<li><span>${n.replace(/^\*/, '')}${n.startsWith('*') ? '*' : ''}${note ? `<small>${note}</small>` : ''}</span><span>${p}</span></li>`).join('');
  $('.text-rich-text').first().html(`<h2><strong>Owl Dental Services &amp; Pricing 2026</strong></h2><ul class="owl-price">${rows}</ul><p>${C.pricelist.footnote}</p><p>Participating in the PRSI Scheme.</p>`);
  firstBy($, 'h2', 'FAQs').closest('section, .faq2_component, [class*="faq"]').remove();
  const cta = $('.section_contact5'); cta.find('h2').first().text('Questions About a Price?');
  cta.find('.text-rich-text').first().html(`<p>Every treatment starts with an examination and a personalized treatment plan, so you know the cost before we begin. Call <a href="${P.phoneHref}">${P.phone}</a> or <a href="/contact-us/">request an appointment online</a>.</p>`);
  cta.find('.w-richtext a[href*="google.com/maps"]').text(P.addressLine);
  emit('pricelist', $);
}

function buildContact() {
  const $ = tpl('contact-us');
  common($, { title: `Contact Us | ${P.name}, Redmond Square, Wexford`, description: C.contactPage.lead, pagePath: '/contact-us/' });
  const hero = $('.section_hero'); hero.find('.text-style-tagline').first().text(C.contactPage.tagline); hero.find('h1').first().text(C.contactPage.h1); hero.find('p.text-size-medium').first().text(C.contactPage.lead);
  $('img.hero_image').attr({ src: owlImg('contact-bg.jpg'), alt: 'Owl Dental, Wexford' }).removeAttr('srcset').removeAttr('sizes');
  const formSec = $('form').first().closest('section'); formSec.attr('id', 'appointment');
  firstBy(formSec, 'h2', 'Request an Appointment').text(C.contactPage.formH2); formSec.find('p.text-size-medium').first().text(C.contactPage.formP);
  firstBy($, 'h2', 'Office Information').text(C.contactPage.officeH2);
  firstBy($, 'h2', C.contactPage.officeH2).parent().parent().find('p.text-size-medium').first().text(C.contactPage.officeP);
  const ref = firstBy($, 'h2', 'Referring Providers'); ref.text(C.contactPage.hoursH2);
  const refSec = ref.closest('section'); refSec.find('p').first().text(C.contactPage.hoursP); refSec.find('a.button').attr('href', P.phoneHref).text(P.phone);
  emit('contact-us', $);
}

function buildThanks() {
  const $ = tpl('contact-us');
  common($, { title: `Thank You | ${P.name}`, description: 'Your message has been sent to Owl Dental.', pagePath: '/contact-us/thanks/' });
  const hero = $('.section_hero'); hero.find('.text-style-tagline').first().text('Message Sent'); hero.find('h1').first().text('Thank you, we’ll be in touch'); hero.find('p.text-size-medium').first().text(`Our team will follow up to confirm your appointment. If it’s urgent, call ${P.phone}.`);
  $('img.hero_image').attr({ src: owlImg('hero-wexford.jpg'), alt: 'Wexford Town' }).removeAttr('srcset').removeAttr('sizes');
  $('main > section').remove();
  emit('contact-us/thanks', $);
}

function build404() {
  const $ = tpl('blog'); // Webflow's not-found page as served to Prism
  common($, { title: `Page Not Found | ${P.name}`, description: 'That page does not exist.', pagePath: '/404/' });
  emit('404', $);
}

// ---------------------------------------------------------------- run
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
buildHome(); buildAbout(); buildServices(); for (const t of T) buildTreatment(t); buildPricelist(); buildContact(); buildThanks();
try { build404(); } catch (e) { console.warn('no 404 page:', e.message); }

for (const { dir, html } of pages) {
  const file = path.join(OUT, dir, dir.endsWith('404') ? '../404.html' : 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
// Owl assets
fs.mkdirSync(path.join(OUT, 'assets/owl'), { recursive: true });
for (const f of fs.readdirSync(ASSETS)) fs.copyFileSync(path.join(ASSETS, f), path.join(OUT, 'assets/owl', f));
// Prism assets: copy _ext, then prune whatever no page or stylesheet references (transitively through CSS).
const referenced = new Set();
const noteRefs = (text, baseDir) => {
  for (const m of text.matchAll(/(?:href|src|poster)="([^"]+)"|url\(\s*['"]?([^'")]+)['"]?\s*\)|srcset="([^"]+)"/g)) {
    const raw = m[1] ?? m[2] ?? (m[3] ? m[3].split(/,\s+/).map((c) => c.trim().split(/\s+/)[0]) : null);
    for (const v of [].concat(raw ?? [])) { if (!v || SKIP_URL.test(v)) continue; const clean = v.split(/[?#]/)[0]; const abs = clean.startsWith('/') ? clean.slice(1) : path.posix.normalize(path.posix.join(baseDir, clean)); referenced.add(decodeURIComponent(abs)); }
  }
};
for (const { dir, html } of pages) noteRefs(html, dir);
const copyTree = (from, to) => { for (const e of fs.readdirSync(from, { withFileTypes: true })) { const s = path.join(from, e.name), d = path.join(to, e.name); if (e.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copyTree(s, d); } else fs.copyFileSync(s, d); } };
copyTree(path.join(SRC, '_ext'), path.join(OUT, '_ext'));
// CSS files pull in fonts/images: follow those references too, from the CSS file's own directory.
let grew = true;
while (grew) { grew = false; for (const r of [...referenced]) if (/\.css$/.test(r) && fs.existsSync(path.join(OUT, r)) && !referenced.has(r + '#seen')) { referenced.add(r + '#seen'); noteRefs(fs.readFileSync(path.join(OUT, r), 'utf8'), path.posix.dirname(r)); grew = true; } }
let kept = 0, pruned = 0;
const prune = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) { prune(p); if (!fs.readdirSync(p).length) fs.rmdirSync(p); } else { const rel = path.relative(OUT, p).split(path.sep).join('/'); if (referenced.has(rel)) kept++; else { fs.unlinkSync(p); pruned++; } } } };
prune(path.join(OUT, '_ext'));
fs.writeFileSync(path.join(OUT, '_redirects'), '/404  /404.html  404\n');
console.log(`built ${pages.length} pages into ${path.relative(process.cwd(), OUT)}; Prism assets kept ${kept}, pruned ${pruned}`);
