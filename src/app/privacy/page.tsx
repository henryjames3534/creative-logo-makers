import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/LegalDocument";
import { brand } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${brand.name} collects, uses, and protects personal information — accounts, projects, analytics, live chat, and cookies.`,
  path: "/privacy",
  keywords: [
    "privacy policy",
    "data protection",
    "Creative Logo Makers privacy",
    "cookies",
  ],
});

const updated = "September 25, 2026";

const sections: LegalSection[] = [
  {
    id: "intro",
    title: "1. Introduction",
    content: (
      <>
        <p>
          This Privacy Policy explains how {brand.name} (“{brand.shortName},”
          “we,” “us,” or “our”) collects, uses, shares, and protects personal
          information when you visit{" "}
          <a href={brand.url} target="_blank" rel="noreferrer">
            {brand.url.replace(/^https?:\/\//, "")}
          </a>
          , create an account, start a contest or project, chat with us, or
          otherwise use our Services.
        </p>
        <p>
          By using the Services, you acknowledge this Policy. For how the
          platform itself works contractually, see our{" "}
          <Link href="/terms">Terms and Conditions</Link>.
        </p>
      </>
    ),
  },
  {
    id: "controller",
    title: "2. Who controls your data",
    content: (
      <>
        <p>
          {brand.name} is the controller of personal data processed through the
          Services unless noted otherwise (for example, when a payment processor
          acts as an independent controller for card data).
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
            <strong>Postal:</strong> {brand.addressFull}
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "collect",
    title: "3. Information we collect",
    content: (
      <>
        <p>
          <strong>You provide:</strong>
        </p>
        <ul>
          <li>
            Account details — name, email, password, profile info, company name
          </li>
          <li>
            Project data — briefs, brand assets, messages, feedback, file uploads
          </li>
          <li>
            Billing details — name, billing address, and payment tokens handled
            by our processors (we do not store full card numbers on our servers)
          </li>
          <li>
            Support communications — emails, contact forms, and live chat
            transcripts
          </li>
          <li>
            Designer portfolio materials, rates, and payout-related details when
            you apply or work as a designer
          </li>
        </ul>
        <p>
          <strong>Collected automatically:</strong>
        </p>
        <ul>
          <li>
            Device and usage data — IP address, browser type, pages viewed, referrer,
            approximate timestamps, and session activity
          </li>
          <li>
            Approximate location derived from IP (country / city) to show local
            currency, improve security, and understand traffic
          </li>
          <li>
            Cookies and similar technologies (see Section 7)
          </li>
        </ul>
        <p>
          <strong>From others:</strong> We may receive information from payment
          providers, authentication partners (e.g., Google sign-in), analytics
          tools, or designers/clients interacting with you on the platform.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "4. How we use information",
    content: (
      <>
        <p>We use personal information to:</p>
        <ul>
          <li>Provide, operate, and improve contests, projects, and Studio services</li>
          <li>Create and secure accounts, and authenticate users</li>
          <li>Process payments, prevent fraud, and handle refunds</li>
          <li>Match clients with designers and facilitate messaging</li>
          <li>
            Personalize currency display and relevant product experiences based
            on location
          </li>
          <li>Respond to live chat, email, and support requests</li>
          <li>
            Send service emails (receipts, project updates). Marketing emails are
            sent only where allowed, and you can unsubscribe
          </li>
          <li>Analyze site performance, fix bugs, and protect against abuse</li>
          <li>Comply with law and enforce our Terms</li>
        </ul>
        <p>
          Legal bases (where GDPR/UK GDPR apply) include contract performance,
          legitimate interests (security, product improvement, limited marketing),
          consent (where required), and legal obligation.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "5. When we share information",
    content: (
      <>
        <p>We may share information with:</p>
        <ul>
          <li>
            <strong>Designers / clients</strong> as needed to run your project
            (briefs, messages, selected files)
          </li>
          <li>
            <strong>Service providers</strong> — hosting, analytics, email,
            customer support, payment processing, security, and CDN partners
            under appropriate contracts
          </li>
          <li>
            <strong>Professional advisors</strong> — lawyers, accountants,
            insurers when needed
          </li>
          <li>
            <strong>Authorities</strong> when required by law or to protect
            rights, safety, and security
          </li>
          <li>
            <strong>Business transfers</strong> — if we merge, sell, or
            reorganize, information may transfer subject to this Policy or notice
          </li>
        </ul>
        <p>
          We do not sell your personal information for money. We do not allow
          third-party advertising networks to track you across sites for their
          own ads unless we clearly disclose and obtain any required consent.
        </p>
      </>
    ),
  },
  {
    id: "international",
    title: "6. International transfers",
    content: (
      <>
        <p>
          We operate from the United States and work with designers and vendors
          worldwide. Your information may be processed in the U.S. and other
          countries that may have different data-protection laws than your home
          country. Where required, we use appropriate safeguards (such as
          standard contractual clauses) for cross-border transfers.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "7. Cookies & similar technologies",
    content: (
      <>
        <p>We use cookies and local storage to:</p>
        <ul>
          <li>Keep you signed in and remember preferences (language, currency)</li>
          <li>Maintain chat sessions and visitor analytics on-device / in-session</li>
          <li>Measure traffic and improve performance</li>
          <li>
            Support optional translation features (e.g., Google Translate cookie
            when you choose another language)
          </li>
        </ul>
        <p>
          You can control cookies through your browser settings. Blocking some
          cookies may limit account or preference features. Essential cookies
          required for security and core functionality may still be set.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "8. Retention",
    content: (
      <>
        <p>
          We keep personal information only as long as needed for the purposes
          above — including project records, legal compliance, dispute
          resolution, and security. Retention periods vary by data type (for
          example, billing records may be kept longer than live-chat drafts).
          When no longer needed, we delete or anonymize information where
          feasible.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "9. Security",
    content: (
      <>
        <p>
          We use administrative, technical, and organizational measures designed
          to protect personal information (access controls, encrypted transport,
          least-privilege practices). No method of transmission or storage is
          100% secure; please use strong passwords and protect your devices.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "10. Your privacy rights",
    content: (
      <>
        <p>
          Depending on where you live (including the EEA, UK, California, and
          other regions), you may have rights to:
        </p>
        <ul>
          <li>Access a copy of personal information we hold about you</li>
          <li>Correct inaccurate information</li>
          <li>Delete information (subject to legal exceptions)</li>
          <li>Object to or restrict certain processing</li>
          <li>Data portability</li>
          <li>Withdraw consent where processing is consent-based</li>
          <li>
            Opt out of certain “sharing” / targeted advertising if we ever
            engage in it as defined by local law
          </li>
        </ul>
        <p>
          To exercise rights, email{" "}
          <a href={`mailto:${brand.email}`}>{brand.email}</a> with the subject
          “Privacy Request.” We may need to verify your identity. You may also
          lodge a complaint with your local data-protection authority.
        </p>
        <p>
          <strong>California residents:</strong> We do not sell personal
          information as defined by the CCPA/CPRA. You may request know/delete
          rights as described above. We will not discriminate against you for
          exercising privacy rights.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "11. Children’s privacy",
    content: (
      <>
        <p>
          The Services are not directed to children under 16 (or under 13 where
          that is the applicable threshold). We do not knowingly collect personal
          information from children. If you believe a child provided information,
          contact us and we will take appropriate steps to delete it.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "12. Third-party sites",
    content: (
      <>
        <p>
          Our site may link to third-party websites or embed tools (payment,
          social, translation). Their privacy practices are their own. Review
          their policies before providing information to them.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "13. Changes to this Policy",
    content: (
      <>
        <p>
          We may update this Privacy Policy periodically. The “Last updated”
          date reflects the latest revision. Significant changes may be
          highlighted on the site or sent by email when appropriate. Continued
          use after an update means you acknowledge the revised Policy.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "14. Contact us",
    content: (
      <>
        <p>Privacy questions or requests:</p>
        <ul>
          <li>
            Email: <a href={`mailto:${brand.email}`}>{brand.email}</a>
          </li>
          <li>
            Form: <Link href="/contact">Contact page</Link>
          </li>
          <li>Mail: {brand.addressFull}</li>
        </ul>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy Policy"
      updated={updated}
      intro={`We respect your privacy. This Policy describes what we collect, why we collect it, and the choices you have when you use ${brand.name}.`}
      sections={sections}
      relatedHref="/terms"
      relatedLabel="Terms and Conditions"
    />
  );
}
