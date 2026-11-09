// Builds Gambling_Disorder_9990.pptx (Cambridge 9990, gambling disorder).
// Run: python3 crop.py && node build.js
// Style: black text on white everywhere, one typeface (Century Gothic), photos never carry text.
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const SKILL_THEME = process.env.APPLY_THEME_JS; // optional: pptx skill's apply_theme.js
const OUT = path.join(__dirname, "Gambling_Disorder_9990.pptx");
const CROPS = path.join(__dirname, "img", "crops");
const img = (name) => path.join(CROPS, `${name}.jpg`);

// Palette and type
const BLACK = "000000", WHITE = "FFFFFF";
const FONT = "Century Gothic";
const LANG = "en-GB"; // British spelling: behaviour, desensitisation, licences
// Display type: leading ~1.1x and slight negative tracking (about -0.015 em), body text untouched
const HEAD_LEADING = 0.9, HEAD_TRACK = -0.5;
const W = 13.333, H = 7.5, M = 0.6;
const HEAD_Y = 0.5;               // every content headline starts here
const FOOT_Y = 6.4, FOOT_H = 0.6; // source box, bottom-anchored at 7.0
const NUM = { x: 12.43, y: 6.7, w: 0.4, h: 0.3 }; // slide number box, bottom at 7.0

const THEME = {
  name: "Gambling Disorder 9990",
  headFontFace: FONT,
  bodyFontFace: FONT,
  colors: {
    dk1: BLACK, lt1: WHITE, dk2: BLACK, lt2: WHITE,
    accent1: BLACK, accent2: "051C2C", accent3: "5F6B78", accent4: "E3A84A", accent5: "EEF1F5", accent6: "1A1F24",
    hlink: BLACK, folHlink: BLACK,
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
pres.title = "Gambling disorder";
pres.subject = "Cambridge International A Level Psychology 9990: clinical psychology, impulse control disorders";
pres.author = "Matis";

// ---------- layouts: one per slide frame, each with a positioned title placeholder ----------
function layout(name, t, fontSize = 32) {
  pres.defineSlideMaster({
    title: name,
    background: { color: WHITE },
    objects: [
      {
        placeholder: {
          options: {
            name: "title", type: "title", x: t.x, y: t.y, w: t.w, h: t.h,
            fontFace: FONT, fontSize, color: BLACK, bold: false,
            align: "left", valign: "top", margin: 0,
          },
          text: "",
        },
      },
    ],
  });
}
layout("Title hero", { x: M, y: 5.3, w: 12.133, h: 1.05 }, 60);
layout("Text 55 photo 45", { x: M, y: HEAD_Y, w: 6.23, h: 1.9 });
layout("Photo 50 text 50", { x: 7.267, y: HEAD_Y, w: 5.466, h: 1.9 });
layout("Photo band three columns", { x: M, y: HEAD_Y, w: 12.133, h: 1.2 });
layout("Text 60 photo 40", { x: M, y: HEAD_Y, w: 6.9, h: 1.9 });
layout("Photo 40 text 60", { x: 5.933, y: HEAD_Y, w: 6.8, h: 1.3 });
layout("Closing band", { x: M, y: HEAD_Y, w: 12.133, h: 1.2 });
layout("Appendix", { x: M, y: 0.85, w: 12.133, h: 0.7 });

// ---------- helpers ----------
function text(slide, content, o) {
  slide.addText(content, {
    isTextBox: true, margin: 0, fontFace: FONT, fontSize: 18, color: BLACK, lang: LANG,
    align: "left", valign: "top", ...o,
  });
}
// Headline. Pass an array from lines() to set balanced line breaks by hand.
function title(slide, t, o = {}) {
  // Line spacing only sticks on placeholder text when it is set on the runs themselves.
  const { lineSpacingMultiple = HEAD_LEADING, ...rest } = o;
  const runs = (typeof t === "string" ? [{ text: t, options: {} }] : t)
    .map((r) => ({ text: r.text, options: { ...r.options, lineSpacingMultiple } }));
  slide.addText(runs, { placeholder: "title", lang: LANG, charSpacing: HEAD_TRACK, ...rest });
}
const lines = (...ls) => ls.map((t, i) => ({ text: t, options: i ? { softBreakBefore: true } : {} }));
function photo(slide, name, x, y, w, h, alt) {
  slide.addImage({ path: img(name), x, y, w, h, altText: alt, objectName: `Photo ${name}` });
}
function source(slide, t, x, w) {
  text(slide, t, { x, y: FOOT_Y, w, h: FOOT_H, fontSize: 11, valign: "bottom", objectName: "Source" });
}
function slideNumber(slide) {
  slide.slideNumber = { ...NUM, fontFace: FONT, fontSize: 11, color: BLACK, align: "left", valign: "bottom", margin: 0 };
}
// Slide number where a photo reaches the bottom-right corner: a white notch keeps it black on white.
function slideNumberOnPhoto(slide) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 12.23, y: 6.6, w: W - 12.23, h: H - 6.6, fill: { color: WHITE }, line: { type: "none" }, objectName: "Slide number notch",
  });
  slideNumber(slide);
}
// A paragraph that starts with a bold label: [label] [rest]
const labelled = (label, rest, last, extra = {}) => [
  { text: label, options: { bold: true, ...extra } },
  { text: rest, options: last ? {} : { breakLine: true } },
];

// ---------- speaker notes, verbatim ----------
const NOTES = {
  1: `SAY [~15s] Today I'm presenting gambling disorder, the only non-substance addiction in our impulse control disorders topic. I'll cover what it is, how common it is, why it happens and how it's treated.`,
  2: `SAY [~50s] In ICD-11, the WHO classes gambling disorder as a disorder due to addictive behaviour, code 6C50. There's no drug: the bet itself is the drug. It has three core features. One, impaired control: the person can't control when, how often or how much they gamble. Two, priority: gambling crowds out the rest of their life. Three, they keep going despite the damage, like debt or lying to family. It's usually evident for at least 12 months. DSM-5 is similar: four or more of nine symptoms in a year, such as chasing losses and withdrawal. It's measured with self-report scales like the K-SAS, which are quick but rely on honesty, and gamblers often hide their losses.

EXTRA (if asked) ICD-11 also requires significant distress or impairment; the 12 months can be shorter if severe; online (6C50.1) or offline (6C50.0). DSM-5 severity: mild 4–5, moderate 6–7, severe 8–9; excluded if better explained by a manic episode. K-SAS is the syllabus measure (11 items, built for kleptomania). Gambling trials use the G-SAS and PG-YBOCS.`,
  3: `SAY [~30s] This isn't rare. In 2024 the Lancet Public Health Commission estimated about 80 million adults worldwide have gambling disorder or problematic gambling, and it says that's probably an underestimate. That's about 1.4% of adults overall. But it depends on the product: among people who use online casinos or slots, it could be roughly one in six. So the design of the game matters, which leads into the explanations.

EXTRA (if asked) 15.8% of adults and 26.4% of adolescents using online casino or slot products; 8.9% of adults and 16.3% of adolescents using sports betting. About 448.7 million adults experience some level of risk gambling.`,
  4: `SAY [~90s] The syllabus gives three explanations. Biological: dopamine. Reuter and colleagues in 2005 used fMRI to compare 12 pathological gamblers with 12 controls. The gamblers had less activity in the brain's reward centre when they won, and the lower it was, the worse their gambling. So they may gamble more to get the same high. But it's correlational, so this could be an effect of gambling rather than a cause. Behavioural: positive reinforcement. Wins come at random, on a variable ratio schedule, which makes the habit very hard to break. Clark and colleagues in 2009 found that near-misses activate the same brain circuits as real wins, and make people want to keep playing. Cognitive: Miller's feeling-state theory, from 2010. A strong positive feeling, like "I'm a winner", gets linked to gambling. Later, when the person feels low, they gamble to get that feeling back. They're chasing a feeling, not money. On its own, each explanation is reductionist. The best account combines all three.

EXTRA (if asked) Reuter: reduced ventral striatum and ventromedial prefrontal activity during a guessing game. Clark: 15 volunteers who were not problem gamblers; near-misses felt less pleasant than full misses but increased the desire to play. Griffiths (1994) supports the cognitive side: 30 regular vs 30 occasional fruit machine players; regular players made significantly more irrational statements ("the machine hates me") and thought they were more skilled, but weren't. Debates: nature vs nurture, determinism vs free will, individual vs situational.`,
  5: `SAY [~60s] The biological treatment is opiate antagonists. Drugs like naltrexone block opioid receptors, which dampens the dopamine high. The key study is Grant and colleagues, 2008. They combined data on 284 gamblers from two double-blind, placebo-controlled trials, one of nalmefene and one of naltrexone. They wanted to know who these drugs help most. The strongest predictor was a family history of alcoholism. In the naltrexone trial alone, nearly 40% stopped gambling for at least a month, compared with about 10% on placebo. These are double-blind trials with a large sample, so they're reliable. But the drugs have side effects, and they treat the symptoms, not the reasons someone started.

EXTRA (if asked) Key study: Grant, Kim, Hollander & Potenza (2008), Psychopharmacology 200(4). 48% women; nalmefene 16 weeks (n = 207), naltrexone 18 weeks (n = 77); 214 on medication, 70 on placebo. Response = at least a 35% drop in PG-YBOCS score for at least a month. Placebo responders tended to be younger. Don't confuse it with Grant, Kim & Hartman (2008), J Clin Psychiatry, the naltrexone-only trial with 77 adults. Side effects: nausea, dizziness, insomnia.`,
  6: `SAY [~60s] The psychological treatments are cognitive-behavioural. The first is imaginal desensitisation, from Blaszczynski and Nower, 2003. Urges come with rising tension, so if you stay relaxed when you face a trigger, the urge loses its power. The client learns muscle relaxation, imagines a trigger like walking past a casino, then imagines walking away calmly. In a 1983 study, gamblers treated this way had bigger drops in their urges a year later than gamblers given aversion therapy. Covert sensitisation does the opposite: the client imagines gambling and then something disgusting, so the urge brings disgust instead of excitement. These therapies are brief and cheap. But the evidence comes from small samples and self-reports.

EXTRA (if asked) McConaghy et al. (1983): 20 compulsive gamblers randomly assigned to aversion-relief therapy or imaginal desensitisation; at one year the desensitisation group had significantly bigger drops in urges and behaviour, and lower anxiety. Clients practise at home and log urges in monitoring tables. Glover (1985): a 56-year-old woman with 14 years of daily shoplifting, four sessions of nausea imagery, one lapse at 19-month follow-up. It's a kleptomania case, so it applies to gambling only by analogy. Some past papers date it Glover (2011).`,
  7: `SAY [~35s] To conclude: gambling disorder is a real addiction, just without a substance. No single cause explains it, so treatment works best combined. Drugs have the strongest trial evidence, therapy tackles the triggers, and Grant himself suggested using both together. And the Lancet Commission argues gambling should be treated as a public health issue, like alcohol and tobacco, because the design of the products matters as much as the individual. Thank you. Any questions?`,
};

// Each slide adds its headline first so screen readers and the outline read it first.

// ---------- 1. Title ----------
pres.addSection({ title: "Introduction" });
{
  const s = pres.addSlide({ masterName: "Title hero", sectionTitle: "Introduction" });
  title(s, "Gambling disorder", { lineSpacingMultiple: 1, charSpacing: -1.2 });
  text(s, "CLINICAL PSYCHOLOGY · IMPULSE CONTROL DISORDERS", {
    x: M, y: 4.95, w: 12.133, h: 0.3, fontSize: 14, bold: true, charSpacing: 2, objectName: "Label",
  });
  text(s, "What it is, why it happens, how we treat it · Matis", {
    x: M, y: 6.45, w: 12.133, h: 0.4, fontSize: 20, objectName: "Subtitle",
  });
  photo(s, "s1_A", 0, 0, W, 4.6, "Rows of brightly lit slot machines on a casino floor");
  s.addNotes(NOTES[1]);
}

// ---------- 2. What it is ----------
pres.addSection({ title: "Definition and prevalence" });
{
  const s = pres.addSlide({ masterName: "Text 55 photo 45", sectionTitle: "Definition and prevalence" });
  title(s, lines("An addiction with no", "substance: the bet", "itself is the drug"));
  const p = { paraSpaceAfter: 20 };
  text(s, [
    ...labelled("Impaired control:", " can't control when, how often or how much", false, p),
    ...labelled("Priority:", " gambling crowds out the rest of life", false, p),
    ...labelled("Harm ignored:", " keeps going despite the damage", true, p),
  ], { x: M, y: 2.6, w: 6.45, h: 2.8, fontSize: 19, objectName: "Core features" });
  text(s, "Usually 12+ months · DSM-5: 4 or more of 9 symptoms", {
    x: M, y: 5.0, w: 6.23, h: 0.35, fontSize: 16, objectName: "Criteria note",
  });
  source(s, "Source: WHO, ICD-11 6C50 Gambling disorder; APA (2013), DSM-5", M, 6.3);
  photo(s, "s2_B", 7.333, 0, W - 7.333, H, "Hands pressing the buttons of a row of slot machines");
  slideNumberOnPhoto(s);
  s.addNotes(NOTES[2]);
}

// ---------- 3. How common it is ----------
{
  const s = pres.addSlide({ masterName: "Photo 50 text 50", sectionTitle: "Definition and prevalence" });
  title(s, "Around 80 million adults worldwide have a gambling problem");
  const X = 7.267, CW = 5.466, C2 = 2.25;
  text(s, "80M", { x: X, y: 1.95, w: CW, h: 1.75, fontSize: 130, charSpacing: -2.5, objectName: "Big number" });
  text(s, "adults with gambling disorder or problematic gambling", { x: X, y: 3.88, w: CW, h: 0.65, objectName: "Big number label" });
  text(s, "1.4%", { x: X, y: 4.55, w: C2 - 0.2, h: 0.9, fontSize: 60, charSpacing: -1, objectName: "Stat 1" });
  text(s, "of all adults", { x: X, y: 5.45, w: C2 - 0.2, h: 0.35, objectName: "Stat 1 label" });
  text(s, "≈1 in 6", { x: X + C2, y: 4.55, w: CW - C2, h: 0.9, fontSize: 60, charSpacing: -1, objectName: "Stat 2" });
  text(s, "online casino and slots players may have the disorder", { x: X + C2, y: 5.45, w: CW - C2, h: 0.9, objectName: "Stat 2 label" });
  source(s, "Source: Wardle et al. (2024), Lancet Public Health Commission; Tran et al. (2024), Lancet Public Health", X, 4.95);
  photo(s, "s3_C", 0, 0, W / 2, H, "Hands holding a phone running a mobile slot machine game");
  slideNumber(s);
  s.addNotes(NOTES[3]);
}

// ---------- 4. Why it happens ----------
pres.addSection({ title: "Explanations" });
{
  const s = pres.addSlide({ masterName: "Photo band three columns", sectionTitle: "Explanations" });
  title(s, lines("Three forces keep people gambling:", "the brain, reinforcement and thinking"));
  const cols = [
    ["Biological", "Weaker dopamine response to wins", "Reuter et al. (2005)"],
    ["Behavioural", "Random wins and near-misses reinforce betting", "Clark et al. (2009)"],
    ["Cognitive", "Chasing a feeling linked to past wins", "Miller (2010)"],
  ];
  const GAP = 0.45, CW = (W - 2 * M - 2 * GAP) / 3, CY = 4.35;
  cols.forEach(([h, line, cite], i) => {
    const x = M + i * (CW + GAP);
    text(s, h, { x, y: CY, w: CW, h: 0.45, fontSize: 24, bold: true, objectName: `${h} heading` });
    text(s, line, { x, y: CY + 0.6, w: CW, h: 0.7, fontSize: 18, objectName: `${h} text` });
    text(s, cite, { x, y: CY + 1.4, w: CW, h: 0.3, fontSize: 14, italic: true, objectName: `${h} citation` });
  });
  source(s, "Source: Reuter et al. (2005), Nature Neuroscience; Clark et al. (2009), Neuron; Miller (2010), Traumatology", M, 11.5);
  photo(s, "s4_D", 0, 1.95, W, 2.0, "Close-up of slot machine reels showing three sevens");
  slideNumber(s);
  s.addNotes(NOTES[4]);
}

// ---------- 5. Treatment: drugs ----------
pres.addSection({ title: "Treatment" });
{
  const s = pres.addSlide({ masterName: "Text 60 photo 40", sectionTitle: "Treatment" });
  title(s, "Drugs that block the high work best for gamblers with a family history of alcoholism");
  const stats = [
    ["284", "gamblers across two\ndouble-blind placebo trials"],
    ["2 drugs", "nalmefene and naltrexone,\nboth opiate antagonists"],
    ["p = .006", "family history of alcoholism\npredicted who responded"],
  ];
  const LX = 3.6;
  stats.forEach(([n, label], i) => {
    const y = 2.55 + i * 0.98;
    text(s, n, { x: M, y, w: LX - M - 0.15, h: 0.85, fontSize: 52, charSpacing: -1, valign: "middle", objectName: `Stat ${i + 1}` });
    text(s, label, { x: LX, y, w: 7.45 - LX, h: 0.85, fontSize: 18, valign: "middle", objectName: `Stat ${i + 1} label` });
  });
  text(s, "Naltrexone alone: ≈40% stopped gambling for 1+ month vs 10.5% on placebo", {
    x: M, y: 5.65, w: 6.85, h: 0.55, fontSize: 16, objectName: "Naltrexone note",
  });
  source(s, "Source: Grant, Kim, Hollander & Potenza (2008), Psychopharmacology; Grant, Kim & Hartman (2008), J Clin Psychiatry", M, 6.85);
  photo(s, "s5_E", 8.0, 0, W - 8.0, H, "Hands placing stacks of chips on a roulette table");
  slideNumberOnPhoto(s);
  s.addNotes(NOTES[5]);
}

// ---------- 6. Treatment: therapy ----------
{
  const s = pres.addSlide({ masterName: "Photo 40 text 60", sectionTitle: "Treatment" });
  title(s, "Therapy retrains how gamblers react to their triggers");
  const X = 5.933, CW = 6.8;
  text(s, "Imaginal desensitisation · Blaszczynski & Nower (2003)", {
    x: X, y: 1.95, w: CW, h: 0.35, fontSize: 16, bold: true, objectName: "Therapy label",
  });
  const steps = [["Relax", "muscle relaxation"], ["Imagine", "a trigger, eg a casino"], ["Walk away", "stay calm and leave"]];
  const SW = 2.1, SG = (CW - 3 * SW) / 2;
  steps.forEach(([word, line], i) => {
    const x = X + i * (SW + SG);
    text(s, String(i + 1), { x, y: 2.5, w: 0.8, h: 1.0, fontSize: 60, objectName: `Step ${i + 1} number` });
    if (i < 2) text(s, "→", { x: x + 1.25, y: 2.5, w: 0.6, h: 1.0, fontSize: 32, valign: "middle", objectName: `Arrow ${i + 1}` });
    text(s, word, { x, y: 3.55, w: SW, h: 0.4, fontSize: 20, bold: true, objectName: `Step ${i + 1} word` });
    text(s, line, { x, y: 3.98, w: SW, h: 0.65, fontSize: 18, objectName: `Step ${i + 1} text` });
  });
  text(s, labelled("Covert sensitisation:", " imagine gambling, then imagine a disgusting outcome · Glover (1985)", true),
    { x: X, y: 5.05, w: CW, h: 0.65, fontSize: 18, objectName: "Covert sensitisation" });
  source(s, "Source: Blaszczynski & Nower (2003); McConaghy et al. (1983), Br J Psychiatry; Glover (1985), Br J Clinical Psychology", X, 6.3);
  photo(s, "s6_F", 0, 0, 5.333, H, "Dimly lit casino room lined with slot machines");
  slideNumber(s);
  s.addNotes(NOTES[6]);
}

// ---------- 7. Conclusion ----------
pres.addSection({ title: "Conclusion" });
{
  const s = pres.addSlide({ masterName: "Closing band", sectionTitle: "Conclusion" });
  title(s, lines("There is no single cause,", "so the best treatment combines approaches"));
  const p = { paraSpaceAfter: 14 };
  text(s, [
    ...labelled("Drugs:", " strongest trial evidence", false, p),
    ...labelled("Therapy:", " tackles the triggers", false, p),
    ...labelled("Regulation:", " product design matters too", true, p),
  ], { x: M, y: 1.95, w: 9, h: 1.6, fontSize: 20, objectName: "Takeaways" });
  photo(s, "s7_G", 0, 4.0, W, H - 4.0, "Roulette wheel and stacks of chips at a casino table");
  slideNumberOnPhoto(s);
  s.addNotes(NOTES[7]);
}

// ---------- 8. References (appendix, hidden: skipped in the show, reachable with 8 + Enter) ----------
pres.addSection({ title: "Appendix" });
{
  const s = pres.addSlide({ masterName: "Appendix", sectionTitle: "Appendix" });
  s.hidden = true;
  title(s, "References");
  text(s, "APPENDIX", { x: M, y: 0.5, w: 4, h: 0.3, fontSize: 12, bold: true, charSpacing: 2, objectName: "Label" });
  // [reference, part set in italics per APA 7: book title, or journal name + volume]
  const refs = [
    ["American Psychiatric Association (2013). Diagnostic and statistical manual of mental disorders (5th ed.).", "Diagnostic and statistical manual of mental disorders"],
    ["Blaszczynski, A. & Nower, L. (2003). Imaginal desensitisation: a relaxation-based technique for impulse control disorders. J. Clinical Activities, Assignments & Handouts in Psychotherapy Practice, 2(4), 1–14.", "J. Clinical Activities, Assignments & Handouts in Psychotherapy Practice, 2"],
    ["Clark, L. et al. (2009). Gambling near-misses enhance motivation to gamble and recruit win-related brain circuitry. Neuron, 61(3), 481–490.", "Neuron, 61"],
    ["Glover, J. H. (1985). A case of kleptomania treated by covert sensitization. British Journal of Clinical Psychology, 24(3), 213–214.", "British Journal of Clinical Psychology, 24"],
    ["Grant, J. E., Kim, S. W. & Hartman, B. K. (2008). A double-blind, placebo-controlled study of the opiate antagonist naltrexone in the treatment of pathological gambling urges. J. Clinical Psychiatry, 69(5), 783–789.", "J. Clinical Psychiatry, 69"],
    ["Grant, J. E., Kim, S. W., Hollander, E. & Potenza, M. N. (2008). Predicting response to opiate antagonists and placebo in the treatment of pathological gambling. Psychopharmacology, 200(4), 521–527.", "Psychopharmacology, 200"],
    ["Griffiths, M. (1994). The role of cognitive bias and skill in fruit machine gambling. British Journal of Psychology, 85, 351–369.", "British Journal of Psychology, 85"],
    ["McConaghy, N. et al. (1983). Controlled comparison of aversive therapy and imaginal desensitization in compulsive gambling. British Journal of Psychiatry, 142, 366–372.", "British Journal of Psychiatry, 142"],
    ["Miller, R. (2010). The feeling-state theory of impulse-control disorders and the impulse-control disorder protocol. Traumatology, 16(3), 2–10.", "Traumatology, 16"],
    ["Reuter, J. et al. (2005). Pathological gambling is linked to reduced activation of the mesolimbic reward system. Nature Neuroscience, 8(2), 147–148.", "Nature Neuroscience, 8"],
    ["Tran, L. T. et al. (2024). The prevalence of gambling and problematic gambling: a systematic review and meta-analysis. Lancet Public Health, 9(8), e594–e613.", "Lancet Public Health, 9"],
    ["Wardle, H. et al. (2024). The Lancet Public Health Commission on gambling. Lancet Public Health, 9(11).", "Lancet Public Health, 9"],
    ["World Health Organization. ICD-11, 6C50 Gambling disorder.", null],
  ];
  const runs = (items) => items.flatMap(([ref, it], i) => {
    const para = { paraSpaceAfter: 9 };
    const last = i === items.length - 1;
    const k = it ? ref.indexOf(it) : -1;
    if (it && (k < 0 || ref.indexOf(it, k + 1) >= 0)) throw new Error(`italic part not unique in: ${ref}`);
    const parts = k < 0 ? [[ref, false]] : [[ref.slice(0, k), false], [it, true], [ref.slice(k + it.length), false]];
    return parts.filter(([t]) => t).map(([t, italic], j, arr) => ({
      text: t, options: { ...para, italic, ...(j === arr.length - 1 && !last ? { breakLine: true } : {}) },
    }));
  });
  const CW = (W - 2 * M - 0.5) / 2;
  text(s, runs(refs.slice(0, 7)), { x: M, y: 1.9, w: CW, h: 4.4, fontSize: 11, objectName: "References left" });
  text(s, runs(refs.slice(7)), { x: M + CW + 0.5, y: 1.9, w: CW, h: 4.4, fontSize: 11, objectName: "References right" });
  source(s, "Photos: Unsplash and Pexels (free licences)", M, 8);
  slideNumber(s);
}

// ---------- post-processing pptxgenjs cannot do itself ----------
// 1. Every language tag en-GB (pptxgenjs hard-codes en-US in places, e.g. notes and empty paragraphs).
// 2. APA hanging indent (0.2 in) on the reference paragraphs.
// 3. pptxgenjs 3.12 repeats <a:pPr> before every run of a multi-run paragraph; the schema allows
//    it only as the paragraph's first child, so keep the first one and drop the rest.
async function finish(file) {
  const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const hanging = (xml) => xml.replace(/<p:sp>[\s\S]*?<\/p:sp>/g, (sp) =>
    /name="References (left|right)"/.test(sp) ? sp.replace(/indent="0" marL="0"/g, 'indent="-182880" marL="182880"') : sp);
  const singlePPr = (xml) => xml.replace(/<a:p>([\s\S]*?)<\/a:p>/g, (_, inner) => {
    const kept = inner.replace(/<a:pPr\b[^>]*?(?:\/>|>[\s\S]*?<\/a:pPr>)/g, (pPr, at) => (at === 0 ? pPr : ""));
    return `<a:p>${kept}</a:p>`;
  });
  for (const name of Object.keys(zip.files)) {
    if (!name.endsWith(".xml")) continue;
    const xml = await zip.file(name).async("string");
    let out = xml.replace(/lang="en-US"/g, `lang="${LANG}"`);
    if (/^ppt\/slides\/slide\d+\.xml$/.test(name)) out = singlePPr(hanging(out));
    if (out !== xml) zip.file(name, out, { createFolders: false });
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  if (SKILL_THEME) {
    const { applyTheme } = require(SKILL_THEME);
    await applyTheme(OUT, THEME);
  }
  await finish(OUT);
  console.log("Wrote", OUT);
})();
