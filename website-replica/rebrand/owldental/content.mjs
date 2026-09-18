// Owl Dental content, taken from https://www.owldental.ie (captured 2026-09-18 in sites/owldental.ie).
// Every fact here is on that site; nothing is invented. Wording was only tightened to fit the template.

export const practice = {
  name: 'Owl Dental',
  shortName: 'Owl Dental',
  tagline: 'Simply Dentistry made simple!',
  town: 'Wexford Town',
  addressLine: 'Owl Dental, Redmond Square, Wexford Town, Y35 NYR8',
  addressShort: 'Redmond Square, Wexford Town, Y35 NYR8',
  phone: '053 9122 364',
  phoneHref: 'tel:+353539122364',
  email: 'Owldental11@gmail.com',
  hoursHtml: 'Mon - Fri: 9:00 am – 6:00 pm (lunch 1:00 – 2:00 pm)<br>Some Saturdays: 9:00 am – 2:00 pm',
  hoursText: 'Mon - Fri: 9:00 am – 6:00 pm (lunch 1:00 – 2:00 pm). Some Saturdays: 9:00 am – 2:00 pm.',
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=Owl+Dental%2C+Redmond+Square%2C+Wexford%2C+Y35+NYR8',
  mapsEmbed: 'https://www.google.com/maps?q=Owl+Dental%2C+Redmond+Square%2C+Wexford%2C+Y35+NYR8&output=embed',
  dentist: 'Dr. Andre Lemos',
  dentistRole: 'Owl Dental Founder, Manager and General Dentist',
  domain: 'https://www.owldental.ie',
  copyright: 'Owl Dental. All rights reserved.',
};

export const intro = 'Owl Dental is your dental practice in the heart of Wexford, continuing the legacy of Redmond Square Dental with over 30 years of trusted care. Our skilled team provides high-quality, patient-focused services, from routine check-ups and Invisalign to root canals and extractions.';

export const about = {
  tagline: 'Formerly Redmond Square Dental. Over 30 Years in Wexford.',
  h1: 'About Owl Dental',
  lead: 'At Owl Dental, we are dedicated to providing exceptional care through state-of-the-art facilities and a team of highly skilled professionals. Formerly Redmond Square Dental, our practice has been a trusted part of the community for over 30 years. Now, as Owl Dental, we continue this legacy, delivering top-quality dental and oral healthcare to Wexford.',
  apart: [
    ['Over 30 Years of Trust', 'Formerly Redmond Square Dental, our practice has been a trusted part of the Wexford community for over 30 years.'],
    ['A Skilled, Enthusiastic Team', 'We are a young and enthusiastic team, yet well-established and highly knowledgeable in the latest technologies and treatment techniques available.'],
    ['Proactive, Preventative Care', 'We emphasize proactive, preventative care to keep our community healthier, from routine check-ups and hygiene visits to personalized treatment plans.'],
    ['Local Referrals When Needed', 'If specialized care is required, we offer referrals to trusted local experts, so you receive the best treatment without the hassle of long-distance travel.'],
  ],
  philosophy: 'Our mission is simple: to offer outstanding care in a safe and welcoming environment for all patients, both new and returning. From root canals and Invisalign to extractions, we provide personalized treatments to address a wide range of dental needs. Our team is highly trained and deeply committed to our core values, which center around helping people with any condition through personalized treatments.',
  dentistBlurb: 'Dr. Andre Lemos is the founder, manager and general dentist of Owl Dental. His view on tooth loss is direct: "Best treatment if you lose a tooth" is a dental implant, which is why the practice invests in Straumann implants, expertly placed and properly cared for, with the best aftercare and service possible.',
  staffIntro: 'Our team is highly trained and deeply committed to our core values, which center around helping people with any condition through personalized treatments. We are a young and enthusiastic team, yet well-established and highly knowledgeable in the latest technologies and treatment techniques available.',
  team: [
    ['Dr. Andre Lemos', 'Owl Dental Founder, Manager and General Dentist', 'team-andre-lemos.jpg'],
    ['Andreia Garcia', 'Manager and Nurse', 'team-andreia-garcia.jpg'],
    ['Lorraine Doyle', 'Hygienist', 'team-placeholder-smile.jpg'],
    ['Raquel Garcia', 'Operations Director and Dental Assistant', 'team-placeholder-smile.jpg'],
    ['Mary Dunne', 'Receptionist', 'team-placeholder-smile.jpg'],
    ['Joanne Cassidy', 'Receptionist', 'team-placeholder-smile.jpg'],
  ],
  visitH2: 'Visit Us in Wexford Town',
  visitP: 'We welcome new and returning patients from Wexford Town and across County Wexford. Whether you are here for a check-up, a second opinion, or a complete treatment plan, you will find a safe and welcoming environment.',
};

// Treatments. `body` is the rich text of the detail page. `price` lines come from the 2026 price list.
export const treatments = [
  {
    slug: 'dental-implants', title: 'Dental Implants', short: 'Dental Implants',
    tagline: '"Best Treatment if you lose a tooth", Dr. Andre Lemos',
    card: 'Artificial tooth roots, usually made of titanium, that look, feel and function like natural teeth: the most reliable and long-lasting solution for missing teeth.',
    intro: 'At our dental practice, we focus on preserving the natural lifespan of your teeth through a variety of treatments aimed at controlling decay and gum disease. When a tooth cannot be saved, a dental implant, expertly placed and properly cared for, offers the most durable and long-lasting solution, without question.',
    hero: 'implants-1.jpg', image: 'implants-2.jpg',
    body: `
<h2><strong>What Are Dental Implants?</strong></h2>
<p>Dental implants are artificial tooth roots, usually made of titanium, that are placed into the jawbone to support a replacement tooth or bridge. They look, feel, and function like natural teeth, making them the most reliable and long-lasting solution for missing teeth. With proper care, dental implants can restore your smile, improve chewing and speaking, and help maintain healthy jawbone structure.</p>
<h2><strong>Our Goal</strong></h2>
<p>Our goal is to offer our patients the possibility of having this treatment in our practice, easily accessible, with the best materials and with the best aftercare and service possible. Several replacement options are available when a tooth is lost; when recommended, a dental implant is the most durable of them.</p>
<h2><strong>Straumann Implants – The World’s Leading Choice</strong></h2>
<p>We use Straumann implants, trusted globally for their precision, durability, and natural-looking results, helping you achieve a healthy, confident smile that lasts. For all these reasons, we are investing heavily in Straumann implants, which are world-renowned for being top-class in their durability, advanced material, and high success rates.</p>
<h2><strong>Related Treatments</strong></h2>
<ul>
<li><a href="/services/extractions/">Extractions</a> and surgical extractions when a tooth cannot be saved</li>
<li><a href="/services/crowns-and-veneers/">Crowns and bridges</a> for the final restoration</li>
<li><a href="/services/hygiene/">Hygiene</a> visits to keep implants and gums healthy</li>
</ul>`,
    price: [],
  },
  {
    slug: 'invisalign', title: 'Invisalign', short: 'Invisalign',
    tagline: 'Clear Aligners in Wexford',
    card: 'Straightens teeth comfortably and discreetly using clear aligners, a modern alternative to braces without metal wires or brackets.',
    intro: 'Invisalign straightens teeth comfortably and discreetly using clear aligners. It’s a modern alternative to braces that fits easily into your lifestyle, helping you achieve a confident smile without metal wires or brackets.',
    hero: 'treat-5.jpg', image: 'treat-5.jpg',
    body: `
<h2><strong>Invisalign at Owl Dental</strong></h2>
<p>Invisalign straightens teeth comfortably and discreetly using clear aligners. It’s a modern alternative to braces that fits easily into your lifestyle, helping you achieve a confident smile without metal wires or brackets.</p>
<h2><strong>After Treatment</strong></h2>
<p>An Essix retainer helps maintain tooth position after orthodontic treatment.</p>`,
    price: [['Invisalign treatment*', 'starting at €4000', 'Single arch treatment available for €3000.'], ['Essix retainer', '€120', 'Helps maintain tooth position after orthodontic treatment.']],
  },
  {
    slug: 'root-canal-treatments', title: 'Root Canal Treatments', short: 'Root Canal',
    tagline: 'Saving Teeth in Wexford',
    card: 'Gently removes infection and restores the tooth from the inside, relieving pain and keeping your natural smile.',
    intro: 'Root canal treatments have a bad reputation in Ireland for being painful treatments and easily failing. These statements couldn’t be further from the truth.',
    hero: 'treat-3.jpg', image: 'treat-3.jpg',
    body: `
<h2><strong>What Is a Root Canal?</strong></h2>
<p>The goal of a root canal is to save a tooth that is badly decayed or infected. By gently removing the infection and restoring the tooth from the inside, this treatment relieves pain and helps keep your natural smile and health.</p>
<h2><strong>Does It Hurt?</strong></h2>
<p>Root canal treatments have a bad reputation in Ireland for being painful treatments and easily failing. These statements couldn’t be further from the truth. When well done and cared for, this treatment can be done with minimal to no pain and save a tooth for many years.</p>
<h2><strong>After the Root Canal</strong></h2>
<p>A fiber post may be recommended after a root canal procedure, and a <a href="/services/crowns-and-veneers/">crown</a> is often the best way to protect the restored tooth.</p>`,
    price: [['Root canal treatment*', '€560 - €780', 'Cost varies by tooth type and difficulty level.'], ['Fiber post*', '€160', 'May be recommended after a root canal procedure.']],
  },
  {
    slug: 'crowns-and-veneers', title: 'Crowns and Veneers', short: 'Crowns & Veneers',
    tagline: 'Restore Beauty and Function',
    card: 'Crowns protect and strengthen damaged teeth; veneers are thin custom shells that fix stains, gaps or misalignment.',
    intro: 'Crowns and veneers restore both beauty and function to your smile. Crowns, or ‘caps’, protect and strengthen damaged teeth while enhancing their look. Veneers are thin, custom shells that cover the front of teeth to fix stains, gaps, or misalignment.',
    hero: 'treat-4.jpg', image: 'treat-4.jpg',
    body: `
<h2><strong>Crowns</strong></h2>
<p>Crowns, or ‘caps’, protect and strengthen damaged teeth while enhancing their look. They are often the final step after a <a href="/services/root-canal-treatments/">root canal treatment</a>.</p>
<h2><strong>Veneers</strong></h2>
<p>Veneers are thin, custom shells that cover the front of teeth to fix stains, gaps, or misalignment. Both options deliver a natural, confident smile.</p>
<h2><strong>Bridges and Dentures</strong></h2>
<p>When teeth are missing, bridges, acrylic dentures and chrome cobalt (metal) dentures are also available, alongside <a href="/services/dental-implants/">dental implants</a>.</p>`,
    price: [['Crowns / veneers*', '€750 - €850', 'Cost will depend on difficulty and materials chosen.'], ['Bridges*', '€1200+', ''], ['Acrylic dentures', '€460 - €760', 'Full dentures starting at €1200.'], ['Chrome cobalt dentures', '€1200', 'Metal dentures available.']],
  },
  {
    slug: 'dental-restorations', title: 'Dental Restorations', short: 'Restorations',
    tagline: 'White Fillings and Composite Restorations',
    card: 'Composite restorations repair teeth while maintaining a natural appearance, for fillings, veneers and more.',
    intro: 'Dental restorations using composite materials are an effective solution for repairing teeth while maintaining a natural appearance.',
    hero: 'treat-2.jpg', image: 'treat-2.jpg',
    body: `
<h2><strong>Composite Restorations</strong></h2>
<p>Dental restorations using composite materials are an effective solution for repairing teeth while maintaining a natural appearance. They can be used for fillings, veneers, and other treatments, offering both aesthetic and durable results.</p>
<h2><strong>Long-Lasting Results</strong></h2>
<p>With proper care, composite restorations can last for many years, helping to enhance dental health and smiles. Fissure seals, typically for children, help protect teeth before decay starts.</p>`,
    price: [['Composite fillings (white)', '€100 - €180', 'Cost varies based on size and complexity.'], ['Fissure seals', '€40', 'Per tooth, typically for children.']],
  },
  {
    slug: 'hygiene', title: 'Hygiene', short: 'Hygiene',
    tagline: 'Healthy Teeth and Gums',
    card: 'Professional cleanings remove buildup that brushing alone can’t, helping prevent problems and keeping your smile fresh and bright.',
    intro: 'Regular visits to the dental hygienist keep your teeth and gums healthy. Professional cleanings remove buildup that brushing alone can’t, helping prevent problems and keeping your smile fresh and bright.',
    hero: 'treat-hygiene.jpg', image: 'treat-hygiene.jpg',
    body: `
<h2><strong>Dental Hygiene Visits</strong></h2>
<p>Regular visits to the dental hygienist keep your teeth and gums healthy. Professional cleanings remove buildup that brushing alone can’t, helping prevent problems and keeping your smile fresh and bright. A scale and polish is available under local anesthesia if preferred.</p>
<h2><strong>Periodontal Treatment</strong></h2>
<p>Deep cleaning with hand scaling, always under local anesthesia, for gums that need more than a routine clean.</p>
<h2><strong>Examinations</strong></h2>
<p>A routine examination includes a thorough examination, cancer screening, diagnosis, a personalized treatment plan, and x-rays if necessary. We participate in the PRSI scheme.</p>`,
    price: [['Dental hygiene treatment', '€75 - €85', 'Scale and polish, available under local anesthesia if preferred.'], ['Periodontal treatment', '€150', 'Deep cleaning with hand scaling, always under local anesthesia.'], ['Adult routine examination', '€50+', 'Includes examination, cancer screening, diagnosis, treatment plan, and x-rays if necessary.'], ['U16 / student examination', '€40 - €60', '']],
  },
  {
    slug: 'extractions', title: 'Extractions', short: 'Extractions',
    tagline: 'Gentle Tooth Removal',
    card: 'Sometimes the best step to protect your overall oral health, done with care to keep you comfortable.',
    intro: 'Dental extractions are sometimes the best step to protect your overall oral health. Whether removing a damaged or crowded tooth, extractions are done with care to keep you comfortable and set the stage for a healthier smile.',
    hero: 'treat-1.jpg', image: 'treat-1.jpg',
    body: `
<h2><strong>When Is an Extraction Needed?</strong></h2>
<p>Dental extractions are sometimes the best step to protect your overall oral health. Whether removing a damaged or crowded tooth, extractions are done with care to keep you comfortable and set the stage for a healthier smile.</p>
<h2><strong>Emergency Visits</strong></h2>
<p>An emergency dental visit includes an emergency assessment, small x-rays, and prescriptions if needed.</p>
<h2><strong>Replacing the Tooth</strong></h2>
<p>If a tooth has to go, a <a href="/services/dental-implants/">dental implant</a> is, in Dr. Lemos’s words, the best treatment if you lose a tooth.</p>`,
    price: [['Tooth extractions', '€100 - €180', ''], ['Surgical extractions', '€180 - €350', ''], ['Emergency dental visit', '€50 - €80', 'Includes emergency assessment, small x-rays, and prescriptions if needed.']],
  },
];

// Full 2026 price list, in the order the live site lists it. Entries with `med2: true` are marked * on the live site.
export const pricelist = {
  title: 'Owl Dental Services & Pricing 2026',
  tagline: 'Transparent Dental Pricing – No Hidden Costs',
  intro: 'We participate in the PRSI scheme. Treatments marked with * are eligible for 20% tax relief under the Med 2 scheme.',
  items: [
    ['Adult Routine Examination', '€50+', 'Includes thorough examination, cancer screening, diagnosis, personalized treatment plans, and x-rays if necessary.'],
    ['U16/Student Examination', '€40 - €60', 'Comprehensive examination, cancer screening, diagnosis, treatment plan, and x-rays as required.'],
    ['Emergency Dental Visit', '€50 - €80', 'Includes emergency assessment, small x-rays, and prescriptions if needed.'],
    ['Dental Hygiene Treatment', '€75 - €85', 'Scale and Polish (S&P) available under local anesthesia if preferred.'],
    ['Periodontal Treatment', '€150', 'Deep cleaning with hand scaling always under local anesthesia.'],
    ['Composite Fillings (White)', '€100 - €180', 'Cost varies based on size and complexity.'],
    ['Tooth Extractions', '€100 - €180', ''],
    ['*Root Canal Treatment', '€560 - €780', 'Cost varies by tooth type and difficulty level.'],
    ['*Fiber Post', '€160', 'May be recommended after a root canal procedure.'],
    ['*Crowns / Veneers', '€750 - €850', 'Cost will depend on difficulty and materials chosen.'],
    ['*Bridges', '€1200+', ''],
    ['Acrylic Dentures', '€460 - €760', 'Full Dentures starting at €1200.'],
    ['Chrome Cobalt Dentures', '€1200', 'Metal dentures available.'],
    ['Teeth Whitening', '€300', 'Includes bleaching trays with syringes.'],
    ['Fissure Seals', '€40', 'Per tooth, typically for children.'],
    ['Essix Retainer', '€120', 'Helps maintain tooth position after orthodontic treatment.'],
    ['Dual Arch B Splint', '€420', 'Protects teeth from grinding during sleep.'],
    ['*Invisalign Treatment', 'starting at €4000', 'Single arch treatment available for €3000.'],
    ['Surgical Extractions', '€180 - €350', ''],
    ['Michigan Splint', '€750', ''],
  ],
  footnote: 'Treatments marked with * are eligible for 20% tax relief under the Med 2 Scheme.',
};

export const home = {
  tagline: 'Simply Dentistry made simple!',
  h1: 'Your Dental Practice in the Heart of Wexford',
  lead: 'Dentistry is more than just care for your teeth: it’s a vital step toward better health and well-being, giving you the confidence to smile and the comfort to live without pain or discomfort. Owl Dental continues the legacy of Redmond Square Dental with over 30 years of trusted care in Wexford Town.',
  meetH2: 'Meet the Founder: Dr. Andre Lemos',
  meetP: about.dentistBlurb,
  meetButton: 'Meet the Team',
  servicesH2: 'Your Smile, Your Confidence',
  servicesP: 'We provide crowns, restorations, extractions, root canals, Invisalign, and hygiene services, all with expert care and a gentle touch:',
  servicesButton: 'Explore All Treatments',
  // The template's "Advanced Technology" strip: five image + line items.
  techH2: 'Trusted Care, Made Simple',
  techP: 'Our skilled team is dedicated to your health and wellbeing, providing high-quality, patient-focused services. We emphasize proactive, preventative care to keep our community healthier:',
  techItems: [
    ['Over 30 years in Wexford', 'formerly Redmond Square Dental', 'hero-wexford.jpg'],
    ['Straumann implants', 'world-renowned for durability and high success rates', 'implants-1.jpg'],
    ['PRSI scheme', 'we participate, and eligible treatments qualify for 20% Med 2 tax relief', 'treat-hygiene.jpg'],
    ['Transparent pricing', 'no hidden costs, published for every treatment', 'treat-3.jpg'],
    ['Referrals to local specialists', 'when specialized care is required, without long-distance travel', 'treat-1.jpg'],
  ],
  whyH3: 'Why Patients Choose Owl Dental',
  whyItems: [
    ['Over 30 Years of Trust', 'Formerly Redmond Square Dental, a trusted part of the Wexford community for over 30 years.'],
    ['Personalised Treatments', 'Our core values center around helping people with any condition through personalized treatments.'],
    ['Latest Techniques', 'A young and enthusiastic team, well-established and highly knowledgeable in the latest technologies and treatment techniques.'],
    ['Comfort First', 'Hygiene and periodontal treatments under local anesthesia if preferred, and gentle care for every extraction and root canal.'],
  ],
  newH2: 'New Patients Welcome',
  newP: 'Visiting for the first time? Start here. We welcome new and returning patients from Wexford Town and across County Wexford, and we participate in the PRSI scheme.',
  newButton: 'See Our Pricelist',
  newLinks: [['View the 2026 Pricelist', '/pricelist/'], ['Book an Appointment', '/contact-us/#appointment'], ['Explore Our Treatments', '/services/'], ['Dental Implants at Owl Dental', '/services/dental-implants/']],
  contactH2: 'Contact us',
  contactP: 'Whether you’re due a check-up, considering implants or Invisalign, or just looking for answers, we’re here to help. Call, email or send us a message and our team will get back to you.',
};

export const servicesPage = {
  tagline: 'Your Smile, Your Confidence',
  h1: 'Dental Treatments at Owl Dental',
  lead: 'We provide crowns, restorations, extractions, root canals, Invisalign, dental implants and hygiene services, all with expert care and a gentle touch. Every treatment is personalized, and if specialized care is required we refer you to trusted local experts.',
  gridH2: 'Explore Our Treatments',
  expectH2: 'What to Expect at Owl Dental',
  expect: [
    ['A Skilled, Established Team', 'A young and enthusiastic team, yet well-established and highly knowledgeable in the latest technologies and treatment techniques available.'],
    ['Comfort Options', 'Hygiene and periodontal treatments are available under local anesthesia if preferred, and every extraction and root canal is done with care to keep you comfortable.'],
    ['Transparent Pricing', 'Every treatment is on our published price list, with no hidden costs. We participate in the PRSI scheme and eligible treatments qualify for Med 2 tax relief.'],
    ['Referrals When Needed', 'If specialized care is required, we offer referrals to trusted local experts for convenient access to comprehensive oral healthcare.'],
  ],
  ctaH2: 'Not Sure Where to Start?',
  ctaP: 'Book a routine examination: it includes a thorough examination, cancer screening, diagnosis, a personalized treatment plan, and x-rays if necessary. Our team is here to listen and guide you toward the best solution for your smile.',
};

export const contactPage = {
  tagline: 'We’re Here to Help',
  h1: 'Contact Owl Dental',
  lead: 'Whether you’re booking a check-up, have questions about a treatment, or need follow-up support, we’re just a call or message away.',
  formH2: 'Request an Appointment',
  formP: 'Use the form below and our team will follow up to confirm your appointment and answer any questions.',
  officeH2: 'Practice Information',
  officeP: 'Owl Dental is in Redmond Square in the heart of Wexford Town. We offer routine and emergency care in a safe, welcoming environment, with clear pricing and personalized treatment.',
  hoursH2: 'Opening Hours',
  hoursP: 'Monday to Friday, 9:00 am to 6:00 pm, with lunch from 1:00 pm to 2:00 pm. Some Saturdays, 9:00 am to 2:00 pm. Emergency dental visits are available; call us on 053 9122 364.',
};
