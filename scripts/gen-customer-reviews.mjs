import fs from "node:fs";

const first = [
  "Emma","Liam","Olivia","Noah","Ava","James","Sophia","Lucas","Isabella","Mason",
  "Mia","Ethan","Charlotte","Logan","Amelia","Benjamin","Harper","Alexander","Evelyn","Michael",
  "Abigail","Daniel","Emily","Henry","Elizabeth","Jackson","Sofia","Sebastian","Avery","Jack",
  "Ella","Aiden","Scarlett","Owen","Grace","Samuel","Chloe","Matthew","Camila","Joseph",
  "Penelope","Levi","Riley","Mateo","Layla","David","Lillian","John","Nora","Wyatt",
  "Zoey","Carter","Mila","Julian","Aubrey","Luke","Hannah","Grayson","Lily","Isaac",
  "Addison","Jayden","Eleanor","Gabriel","Natalie","Anthony","Luna","Dylan","Savannah","Leo",
  "Brooklyn","Lincoln","Leah","Joshua","Zoe","Andrew","Stella","Christopher","Hazel","Theodore",
  "Ellie","Caleb","Paisley","Ryan","Audrey","Asher","Skylar","Nathan","Violet","Thomas",
  "Claire","Bella","Charles","Lucy","Eli","Anna","Isaiah","Caroline","Aaron","Genesis",
  "Adrian","Kennedy","Nolan","Samantha","Hunter","Maya","Connor","Naomi","Jordan","Elena",
  "Ian","Ariana","Adam","Allison","Jason","Gabriella","Kevin","Ruby","Brandon","Eva",
  "Eric","Madelyn","Tyler","Piper","Jose","Rylee","Justin","Serenity","Kyle","Kaylee",
  "Brian","Brianna","Mark","Alexa","Jeffrey","Peyton","Scott","Autumn","Patrick","Sienna",
  "Derek","Mackenzie","Travis","Melanie","Shane","Brooke","Cole","Jasmine","Blake","Faith",
  "Chase","Morgan","Colin","Reese","Marcus","Quinn","Miles","Sydney","Nathaniel","Kimberly",
  "Victor","Paige","Max","Haley","Ivan","Omar","George","Nicole","Edward","Lauren",
  "Frank","Michelle","Oscar","Stephanie","Luis","Katherine","Carl","Christina","Tony","Rachel",
  "Vincent","Jennifer","Roy","Heather","Alan","Amy","Louis","Angela","Jesse","Melissa",
  "Sean","Rebecca","Craig","Laura","Todd","Amanda","Joel","Sarah","Peter","Jessica",
  "Wayne","Ashley","Gary","Megan","Bruce","Katie","Randy","Erin","Jerry","Kelly",
  "Roger","Christine","Lawrence","Andrea","Keith","Marie","Gerald","Diana","Ralph","Julie",
  "Dale","Monica","Vernon","Tiffany","Glenn","Crystal","Hugh","Wendy","Clyde","Dawn",
  "Nelson","Holly","Earl","Tammy","Floyd","Sherry","Lester","Jill","Harvey","Tracy",
  "Wallace","Dana","Dwight","Kim","Marshall","Robin","Forrest","Leslie","Clarence","Shannon",
];

const last = [
  "Anderson","Bennett","Brooks","Carter","Collins","Cooper","Davis","Edwards","Foster","Garcia",
  "Gonzalez","Gray","Green","Hall","Harris","Hayes","Henderson","Hughes","Jackson","James",
  "Jenkins","Johnson","Jones","Kelly","King","Lee","Lewis","Lopez","Martin","Martinez",
  "Miller","Mitchell","Moore","Morgan","Morris","Murphy","Nelson","Nguyen","Parker","Patel",
  "Perez","Phillips","Powell","Price","Reed","Richardson","Rivera","Roberts","Robinson","Rodriguez",
  "Rogers","Ross","Russell","Sanchez","Sanders","Scott","Simmons","Smith","Stewart","Taylor",
  "Thomas","Thompson","Torres","Turner","Walker","Ward","Watson","White","Williams","Wilson",
  "Wood","Wright","Young","Bailey","Barnes","Bell","Butler","Campbell","Clark","Coleman",
  "Cox","Cruz","Diaz","Ellis","Evans","Flores","Ford","Graham","Griffin","Gutierrez",
  "Hamilton","Hansen","Harvey","Hoffman","Howard","Hunt","Kim","Knight","Long","Marshall",
  "Mason","McDonald","Myers","Ortiz","Owens","Palmer","Perry","Peterson","Ramirez","Reyes",
  "Reynolds","Richards","Schmidt","Schneider","Shaw","Silva","Singh","Sullivan","Tucker","Vargas",
  "Wagner","Wallace","Walsh","Warren","Washington","Watkins","Webb","Wells","West","Wheeler",
  "Wong","Zimmerman","Abbott","Bishop","Blake","Bowman","Brady","Brennan","Bryant","Burns",
  "Chambers","Chapman","Chen","Cohen","Curtis","Dawson","Delgado","Duncan","Elliott","Fischer",
  "Fleming","Freeman","Fuller","Gardner","Gibson","Gordon","Grant","Guerrero","Hale","Hart",
  "Hawkins","Heller","Holland","Holmes","Hopkins","Horne","Howell","Hudson","Ingram","Jacobs",
  "Jensen","Joseph","Kane","Keller","Kennedy","Khan","Klein","Lambert","Lane","Larson",
  "Lawson","Leonard","Little","Lowe","Lyons","Mack","Maldonado","Malone","Mann","Manning",
  "Marquez","Matthews","Maxwell","May","McCarthy","McCormick","McGee","Medina","Mendez","Mendoza",
  "Meyer","Miles","Mills","Miranda","Montgomery","Morales","Moreno","Morton","Moss","Munoz",
  "Murray","Nash","Navarro","Newton","Nichols","Nixon","Norman","Norris","Norton","Oliver",
  "Olsen","Olson","Osborne","Owen","Page","Parks","Parsons","Paul","Payne","Pearson",
  "Pena","Perkins","Peters","Porter","Potter","Pratt","Quinn","Ramsey","Ray","Reeves",
  "Reid","Reilly","Rios","Robbins","Romero","Rose","Rowe","Ruiz","Salazar","Santana",
  "Santos","Saunders","Schultz","Serrano","Sharp","Shelton","Sherman","Short","Simon","Simpson",
  "Snyder","Soto","Sparks","Spencer","Stanley","Steele","Stevens","Stone","Summers","Sutton",
  "Tate","Todd","Townsend","Tran","Tyler","Underwood","Valdez","Vargas","Vega","Wade",
  "Walters","Wang","Warner","Weaver","Weber","Welch","Whitaker","Wilcox","Willis","Winters",
  "Wolfe","Woods","Wyatt","Yates","York","Yu","Zamora",
];

const cities = [
  "Austin, TX","Dallas, TX","Houston, TX","San Antonio, TX","New York, NY","Brooklyn, NY",
  "Los Angeles, CA","San Diego, CA","San Francisco, CA","Seattle, WA","Portland, OR","Denver, CO",
  "Phoenix, AZ","Chicago, IL","Atlanta, GA","Miami, FL","Orlando, FL","Tampa, FL",
  "Charlotte, NC","Raleigh, NC","Nashville, TN","Boston, MA","Philadelphia, PA","Detroit, MI",
  "Minneapolis, MN","Kansas City, MO","St. Louis, MO","Indianapolis, IN","Columbus, OH","Cleveland, OH",
  "Pittsburgh, PA","Baltimore, MD","Washington, DC","Richmond, VA","Louisville, KY","New Orleans, LA",
  "Oklahoma City, OK","Salt Lake City, UT","Las Vegas, NV","Albuquerque, NM","Boise, ID","Omaha, NE",
  "Milwaukee, WI","Madison, WI","Buffalo, NY","Honolulu, HI","Toronto, ON","Vancouver, BC",
  "London, UK","Manchester, UK","Sydney, AU","Melbourne, AU","Dublin, IE","Singapore","Dubai, UAE",
];

const services = [
  "Logo design","Brand identity","Website design","Packaging design","Business cards",
  "Social media kit","App icon","Book cover","Merchandise design","Rebrand",
  "Logo contest","Studio branding","Landing page","Menu design","Signage design",
];

const titles = [
  "Exactly what we needed","Exceeded expectations","Smooth and professional","Worth every dollar",
  "Fast turnaround","Our brand finally clicks","Designers crushed it","Clear process, great results",
  "Impressed from day one","Would hire again","Top-tier creative work","Simple and stress-free",
  "Game changer for our launch","Polished and on-brief","Loved the options","Clean and modern result",
  "Professional without the fluff","Happy we started here","Great value during the sale","On brand and on time",
];

const bodies = [
  "I was nervous about hiring online, but the brief form made it easy. We got several strong concepts and picked a winner in under two weeks.",
  "Our old logo looked dated. The new mark is clean, scalable, and already looks great on packaging and the site header.",
  "Communication was clear the whole way. Revisions were handled quickly without attitude — rare and appreciated.",
  "Ran a contest for our cafe rebrand. Seeing so many unique directions helped us decide who we are as a brand.",
  "Hired for a full brand kit. Logo, colors, and social templates arrived organized and ready for day-to-day use.",
  "As a solo founder I needed something affordable that still looked legit. This hit the sweet spot.",
  "The designers understood our industry without me over-explaining. Final files included SVG and print-ready PDFs.",
  "We compared three agencies. Creative Logo Makers moved faster and the concepts felt more original.",
  "Used the Free Logomaker first for ideas, then upgraded to a contest. Best of both worlds.",
  "Website design package was structured well. Mobile layout looks sharp and the hierarchy is clear.",
  "Packaging mockups sold our product at a trade show. Vendors asked who did the design.",
  "Second project with them — book cover this time. Same reliable process as our logo last year.",
  "Star ratings aside, the files and ownership terms were clear. No weird licensing surprises.",
  "My team is picky. We still landed on a logo everyone liked after a couple of revision rounds.",
  "For a law firm we needed something trustworthy, not trendy. They nailed the tone.",
  "Startup pitch deck looks so much better with the new identity. Investors noticed immediately.",
  "Customer support answered in hours, not days. That alone kept the project on schedule.",
  "I liked that I could see designer levels and portfolios before choosing a path.",
  "Rebrand felt scary. They kept it practical — we refreshed the mark without losing recognition.",
  "Social templates match the logo perfectly. Finally consistent across Instagram and LinkedIn.",
  "Pricing was transparent with the sale. No upsell pressure after we paid.",
  "Got more concepts than expected on the Gold package. Hard to choose — in a good way.",
  "English communication was clear even with designers abroad. Deadlines were met.",
  "The process page set expectations correctly. We knew what would happen each week.",
  "App icon redesign helped our store listing look more premium within a month.",
  "Menu design for our restaurant came with print specs that our printer loved.",
  "Not a perfect five only because we wanted one more round — still very happy with the outcome.",
  "Would have given five earlier if onboarding emails were a bit clearer. Design quality is excellent though.",
  "Solid work. Minor delay on final files, but the creative direction was spot on.",
  "Realistic expectations: you still need a clear brief. Once we clarified ours, results jumped.",
  "Our nonprofit needed donor-ready branding on a budget. They delivered with care.",
  "E-commerce packaging set feels premium without looking generic. Customers compliment it.",
  "Contest format was fun for the team — watching concepts roll in kept everyone engaged.",
  "Studio identity package went deeper than a logo. The guidelines document is actually useful.",
  "Hired for signage and logo. Cohesive system from storefront to Instagram.",
  "I manage marketing for three locations. Assets were organized so each site can use them.",
  "Compared to DIY tools, this looks like a real brand. Clients stopped asking if we are new.",
  "Designer took feedback calmly and improved each revision. Professional throughout.",
  "Landing page conversion improved after the redesign. Cleaner hierarchy and CTAs.",
  "Merchandise mockups helped us greenlight apparel before manufacturing.",
  "We are a B2B SaaS. Logo feels modern without the neon-gradient cliche.",
  "Brief wizard asked the right questions. Saved us from a vague kickoff call.",
  "Files exported correctly for embroidery and vinyl — our vendor confirmed.",
  "Took a chance during the package sale. Quality did not feel discounted.",
  "My spouse and I disagreed on styles. Multiple options helped us compromise.",
  "International brand — needed a mark that works in small favicon sizes. Done.",
  "Account dashboard made tracking concepts simple for our remote team.",
  "I appreciated honest feedback when my first brief was too broad.",
  "Aftercare was better than expected — they answered a file format question weeks later.",
  "Not flashy marketing speak — just good design and a calm process. That is rare.",
];

const notes = [
  " Highly recommend for small businesses.",
  " Sharing this with two founder friends.",
  " Will be back for packaging next.",
  " Screenshot of the logo is already our Slack avatar.",
  " Print shop approved the files on first try.",
  " Felt like a real agency without the retainer.",
  " Mobile site looks especially sharp.",
  " Color palette guidance was a nice bonus.",
  " Onboarding took maybe 20 minutes.",
  " Clear ownership language in the docs.",
  " Our accountant even complimented the invoice branding.",
  " Used the mark on a trade-show booth the next week.",
];

function pick(arr, i) {
  return arr[i % arr.length];
}

function dateFor(i) {
  const start = Date.parse("2024-01-08T12:00:00Z");
  return new Date(start + i * 86400000 * 2.7).toISOString().slice(0, 10);
}

const used = new Set();
const reviews = [];

for (let i = 0; i < 120; i++) {
  let name = `${pick(first, i * 3)} ${pick(last, i * 7)}`;
  for (let t = 0; t < 40 && used.has(name); t++) {
    name = `${pick(first, i * 3 + t + 1)} ${pick(last, i * 7 + t * 2 + 3)}`;
  }
  used.add(name);

  const rating = i % 17 === 0 ? 3 : i % 5 === 0 ? 4 : 5;
  const titleBase = pick(titles, i * 5);
  const title =
    i % 4 === 0 ? titleBase : titleBase + (i % 3 === 0 ? " for our brand" : "");

  reviews.push({
    id: `r${i + 1}`,
    name,
    location: pick(cities, i * 2),
    service: pick(services, i),
    rating,
    title,
    body: pick(bodies, i * 3) + pick(notes, i),
    date: dateFor(i),
    verified: i % 9 !== 0,
  });
}

const lines = [
  "export type CustomerReview = {",
  "  id: string;",
  "  name: string;",
  "  location: string;",
  "  service: string;",
  "  rating: 3 | 4 | 5;",
  "  title: string;",
  "  body: string;",
  "  date: string;",
  "  verified: boolean;",
  "};",
  "",
  "export const customerReviews: CustomerReview[] = " +
    JSON.stringify(reviews, null, 2) +
    ";",
  "",
  "export const customerReviewStats = {",
  "  average: 4.8,",
  '  totalLabel: "37,648",',
  "  shown: customerReviews.length,",
  "} as const;",
  "",
];

fs.writeFileSync("src/data/customer-reviews.ts", lines.join("\n"));
console.log("wrote", reviews.length, "unique names", used.size);
