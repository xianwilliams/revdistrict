import { Motion } from "@/components/motion";
import type { Metadata } from "next";
import { site } from "@/lib/site";
export const metadata: Metadata = { title: "Privacy Policy" };
export default function PrivacyPage() {
  return (
    <section className="legal-page section" data-motion-section>
      <p className="eyebrow">YOUR INFORMATION, RESPECTED</p>
      <h1>Privacy Policy.</h1>
      <p className="legal-intro">
        This notice describes how information is handled on the RevDistrict
        website, formerly The Used Car Factory. Contact us if you have questions
        about your information.
      </p>
      <article>
        <h2>Information you provide</h2>
        <p>
          When you contact us, ask about a vehicle, request a test drive, or
          submit a vehicle for valuation or consignment, you may provide your
          name, email, phone number, message, preferred appointment time, and
          vehicle information. We use this information to respond to your
          request and help with the services you ask about.
        </p>
        <h2>Financing applications</h2>
        <p>
          When online applications are available, the on-site credit application
          collects identity and contact details, residence and employment
          history, income, and optional co-applicant, vehicle and trade
          information. Only after you authorize and submit it, the application
          is forwarded through an authenticated connection to the approved
          financing processor. Unsubmitted applications are not saved by this
          website. Application contents are not stored in this website’s
          database, browser storage or application logs. The dealership and
          financing providers retain received applications under their
          applicable policies. Do not send Social Security numbers, bank
          information, or copies of identity documents through the general
          contact form.
        </p>
        <h2>Service providers and sharing</h2>
        <p>
          We may share information with the providers needed to operate our
          website, manage inquiries and inventory, and process financing
          requests you authorize. We may also disclose information when required
          by law. Contact the dealership for details about how information in a
          financing application is handled.
        </p>
        <h2>Saved vehicles and site functionality</h2>
        <p>
          Saved vehicles are stored in your browser’s local storage on this
          device. They are not an account and do not automatically transfer
          between devices. Clear your browser’s site data to remove this list.
          The payment calculator runs in your browser; calculator inputs are not
          submitted as a credit application.
        </p>
        <h2>Third-party content and links</h2>
        <p>
          Vehicle photographs may load from our inventory provider. The contact
          page includes a Google map. Loading third-party resources can disclose
          standard connection information, such as your IP address, to those
          providers. Links to CARFAX, social platforms, and maps are governed by
          those services’ policies.
        </p>
        <h2>Text messages</h2>
        <p>
          If you choose to receive text messages about your request, message and
          data rates may apply. You can reply STOP to opt out. Consent to text
          messages is not required to purchase a vehicle. Contact the team for
          help or to change how we communicate with you.
        </p>
        <h2>Your choices</h2>
        <p>
          You can contact us to ask about information you provided, request a
          correction or deletion, or ask us to stop contacting you. Some
          information may need to be retained to fulfill a transaction or meet
          applicable obligations.
        </p>
        <h2>Security</h2>
        <p>
          We use safeguards appropriate to the information we handle. No online
          transmission or storage system can be guaranteed completely secure.
          Please use the designated secure financing application for sensitive
          financial information.
        </p>
        <h2>Updates and contact</h2>
        <p>
          This notice may be updated as the website and services change. For
          privacy questions, email{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>, call{" "}
          <a href={site.phoneHref}>{site.phone}</a>, or write to {site.address},{" "}
          {site.city}.
        </p>
      </article>
      <Motion />
    </section>
  );
}
