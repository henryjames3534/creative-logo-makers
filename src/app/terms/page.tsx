import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/LegalDocument";
import { brand } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms and Conditions",
  description: `Terms of use for ${brand.name} — contests, 1-to-1 projects, Studio services, payments, IP ownership, and account rules.`,
  path: "/terms",
  keywords: [
    "terms and conditions",
    "terms of service",
    "Creative Logo Makers terms",
    "design contest terms",
  ],
});

const updated = "September 25, 2026";

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "1. Agreement to these Terms",
    content: (
      <>
        <p>
          These Terms and Conditions (“Terms”) govern your access to and use of
          the websites, products, and services operated by {brand.name}{" "}
          (“{brand.shortName},” “we,” “us,” or “our”), including design contests,
          1-to-1 designer projects, Studio engagements, accounts, live chat, and
          related tools (collectively, the “Services”).
        </p>
        <p>
          By creating an account, starting a project, submitting a brief, posting
          a contest, bidding or delivering design work, or otherwise using the
          Services, you agree to these Terms and our{" "}
          <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do
          not use the Services.
        </p>
        <p>
          If you use the Services on behalf of a company or other entity, you
          represent that you have authority to bind that entity, and “you”
          includes that entity.
        </p>
      </>
    ),
  },
  {
    id: "who-we-are",
    title: "2. Who we are",
    content: (
      <>
        <p>
          {brand.name} is a creative marketplace and studio platform that helps
          businesses obtain logos, branding, websites, packaging, and related
          design work through contests, private projects, or Studio packages.
        </p>
        <ul>
          <li>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
          </li>
          <li>
            <strong>Phone:</strong> {brand.phone} · {brand.phoneAlt}
          </li>
          <li>
            <strong>Address:</strong> {brand.addressFull}
          </li>
          <li>
            <strong>Website:</strong>{" "}
            <a href={brand.url} target="_blank" rel="noreferrer">
              {brand.url.replace(/^https?:\/\//, "")}
            </a>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "3. Eligibility & accounts",
    content: (
      <>
        <p>
          You must be at least 18 years old (or the age of majority where you
          live) to use the Services. You agree to provide accurate registration
          information and to keep your login credentials secure. You are
          responsible for all activity under your account.
        </p>
        <p>We may refuse, suspend, or terminate accounts that:</p>
        <ul>
          <li>Provide false or misleading information</li>
          <li>Abuse designers, clients, or our staff</li>
          <li>Attempt fraud, chargebacks in bad faith, or payment abuse</li>
          <li>Violate intellectual property, publicity, or privacy rights</li>
          <li>Circumvent platform fees or safety features</li>
        </ul>
      </>
    ),
  },
  {
    id: "services",
    title: "4. How our services work",
    content: (
      <>
        <p>
          <strong>Design contests.</strong> You publish a brief and invite
          designers to submit concepts. You may provide feedback, shortlist
          entries, and select a winner according to the package you purchase.
          Contest mechanics, guaranteed awards, and timelines are described on
          the contest / package pages at the time of purchase.
        </p>
        <p>
          <strong>1-to-1 projects.</strong> You hire a specific designer for
          scoped work with milestones, messaging, and revisions as described in
          the project package or agreement.
        </p>
        <p>
          <strong>Studio.</strong> Brand strategy, full identity systems, and
          launch packages may be delivered by our Studio team or designated
          senior creatives under a separate statement of work or package
          description.
        </p>
        <p>
          We provide the platform, matching, tooling, and facilitation. Except
          where Studio expressly delivers the creative work, individual designers
          are independent creators — not our employees — unless we state
          otherwise in writing.
        </p>
      </>
    ),
  },
  {
    id: "briefs",
    title: "5. Briefs, feedback & client responsibilities",
    content: (
      <>
        <p>As a client you agree to:</p>
        <ul>
          <li>
            Provide a clear brief, brand assets you have rights to use, and
            timely feedback
          </li>
          <li>
            Not request illegal, defamatory, hateful, or infringing content
          </li>
          <li>
            Not ask designers to copy another brand’s logo or protected assets
          </li>
          <li>
            Evaluate entries fairly and communicate through the platform where
            required
          </li>
        </ul>
        <p>
          Delays in feedback, incomplete briefs, or scope changes outside the
          purchased package may extend timelines or require additional fees.
        </p>
      </>
    ),
  },
  {
    id: "designers",
    title: "6. Designer responsibilities",
    content: (
      <>
        <p>If you participate as a designer, you agree that:</p>
        <ul>
          <li>
            All submissions are original or you have full rights to use every
            element (fonts, stock, illustrations, photos)
          </li>
          <li>
            You will not use AI-generated or third-party work in a way that
            misrepresents authorship or violates licenses
          </li>
          <li>
            You will not spam contests, scrape the platform, or harass clients
          </li>
          <li>
            Winning or selected work will be transferred as described in Section
            8 after payment conditions are met
          </li>
        </ul>
        <p>
          Non-winning contest entries generally remain the designer’s property,
          except where a package or written agreement states otherwise.
        </p>
      </>
    ),
  },
  {
    id: "payments",
    title: "7. Pricing, payments & taxes",
    content: (
      <>
        <p>
          Prices are shown on the site and may be displayed in different
          currencies for convenience. Unless stated otherwise, charges are
          processed in the billing currency selected at checkout. Promotional
          discounts (including limited-time offers) are subject to stated
          conditions and may end without notice.
        </p>
        <p>
          You authorize us and our payment processors to charge your selected
          payment method for packages, upgrades, tips, Studio fees, and
          applicable taxes. You are responsible for any VAT, sales tax, or
          similar obligations arising from your purchase where required by law.
        </p>
        <p>
          Platform fees, designer payouts, and holding periods (if any) are
          governed by the applicable package, payout schedule, or designer
          agreement shown at the time of the transaction.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "8. Refunds & guarantees",
    content: (
      <>
        <p>
          Certain contest packages may include a money-back or satisfaction
          guarantee as described on the package page at purchase. Guarantees
          typically require that you followed contest rules, provided a
          reasonable brief, and requested help from support before demanding a
          refund.
        </p>
        <p>Refunds are generally not available when:</p>
        <ul>
          <li>
            You have already selected a winner or downloaded final files for
            commercial use
          </li>
          <li>
            You changed your mind after substantial designer work was delivered
            under a 1-to-1 or Studio scope
          </li>
          <li>
            The request is based on subjective preference alone after extensive
            revisions outside package limits
          </li>
          <li>You violated these Terms or contest rules</li>
        </ul>
        <p>
          Contact{" "}
          <a href={`mailto:${brand.email}`}>{brand.email}</a> or use{" "}
          <Link href="/contact">Contact</Link> to start a refund review. We may
          offer brief revisions, package adjustments, or a partial credit where
          appropriate.
        </p>
      </>
    ),
  },
  {
    id: "ip",
    title: "9. Intellectual property & ownership",
    content: (
      <>
        <p>
          <strong>Platform IP.</strong> The {brand.name} name, logos, site
          design, software, and content we publish are owned by us or our
          licensors. You may not copy, scrape, or reverse engineer the Services
          except as allowed by law.
        </p>
        <p>
          <strong>Client materials.</strong> You retain ownership of materials
          you upload (briefs, logos, photos). You grant us and participating
          designers a license to use them solely to perform the Services.
        </p>
        <p>
          <strong>Selected / winning designs.</strong> When you fully pay for a
          package and a design is designated as the winner or final deliverable,
          the designer assigns to you the rights described in that package
          (commonly including commercial use of the final logo/files), subject to
          any third-party license limitations (e.g., fonts or stock that require
          their own licenses). Until payment clears and selection is confirmed,
          ownership does not transfer.
        </p>
        <p>
          You are responsible for trademark searches, filings, and clearance in
          your markets. We do not guarantee that a design is available for
          trademark registration worldwide.
        </p>
      </>
    ),
  },
  {
    id: "conduct",
    title: "10. Acceptable use",
    content: (
      <>
        <p>You may not use the Services to:</p>
        <ul>
          <li>Break any law or infringe others’ rights</li>
          <li>Upload malware, scrape data, or overload our systems</li>
          <li>Impersonate others or misrepresent your affiliation</li>
          <li>
            Solicit designers or clients to take payments or work off-platform in
            order to avoid fees, where our rules prohibit it
          </li>
          <li>Post adult, violent, or hateful content beyond legal limits</li>
        </ul>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "11. Third-party tools & links",
    content: (
      <>
        <p>
          The Services may integrate payment processors, analytics, translation,
          chat, authentication, or hosting providers. Their terms and privacy
          practices apply to their processing. We are not responsible for
          third-party websites linked from our pages.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "12. Disclaimers",
    content: (
      <>
        <p>
          THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM
          EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR
          IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          AND NON-INFRINGEMENT.
        </p>
        <p>
          We do not warrant uninterrupted uptime, that every designer submission
          will meet your taste, or that results will achieve specific business
          outcomes (sales, rankings, or trademark approval).
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "13. Limitation of liability",
    content: (
      <>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, {brand.name.toUpperCase()} AND
          ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE
          DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS
          OPPORTUNITIES.
        </p>
        <p>
          OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THE SERVICES WILL NOT
          EXCEED THE AMOUNTS YOU PAID TO US FOR THE SPECIFIC PROJECT OR PACKAGE
          GIVING RISE TO THE CLAIM IN THE TWELVE (12) MONTHS BEFORE THE EVENT.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "14. Indemnification",
    content: (
      <>
        <p>
          You agree to defend and indemnify {brand.name} against claims, damages,
          losses, and expenses (including reasonable attorneys’ fees) arising
          from your content, your use of the Services, your violation of these
          Terms, or your infringement of any third-party right.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "15. Governing law & disputes",
    content: (
      <>
        <p>
          These Terms are governed by the laws of the State of Delaware, USA,
          without regard to conflict-of-law rules. Courts located in Delaware
          will have exclusive jurisdiction, unless applicable consumer law
          requires otherwise in your place of residence.
        </p>
        <p>
          Before filing a claim, please contact us so we can try to resolve the
          issue informally.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "16. Changes to these Terms",
    content: (
      <>
        <p>
          We may update these Terms from time to time. The “Last updated” date
          will change when we do. Continued use of the Services after changes
          become effective constitutes acceptance of the revised Terms. Material
          changes may also be communicated by email or a site notice when
          appropriate.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "17. Contact",
    content: (
      <>
        <p>Questions about these Terms?</p>
        <ul>
          <li>
            Email: <a href={`mailto:${brand.email}`}>{brand.email}</a>
          </li>
          <li>
            Contact form: <Link href="/contact">/contact</Link>
          </li>
          <li>Mail: {brand.addressFull}</li>
        </ul>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms and Conditions"
      updated={updated}
      intro={`Please read these Terms carefully. They explain your rights and responsibilities when you use ${brand.name} for design contests, 1-to-1 projects, and Studio services.`}
      sections={sections}
      relatedHref="/privacy"
      relatedLabel="Privacy Policy"
    />
  );
}
