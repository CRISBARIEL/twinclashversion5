import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy = ({ onBack }: PrivacyPolicyProps) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: December 19, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Twin Clash. We are committed to protecting your privacy and ensuring transparency
              about how we collect, use, and safeguard your information. This Privacy Policy explains our
              practices regarding data collection and usage when you access and play our game at{' '}
              <a href="https://twinclash.org" className="text-blue-600 hover:underline">
                https://twinclash.org
              </a>
              .
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using Twin Clash, you agree to the collection and use of information in accordance with
              this policy. If you do not agree with our policies and practices, please do not use our game.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Twin Clash does not require users to create an account or provide personal information to play
              the game. We do not directly collect names, email addresses, or other personally identifiable
              information unless you voluntarily contact us.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Automatically Collected Information</h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              When you access Twin Clash, we may automatically collect certain technical information,
              including:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 space-y-2 ml-4">
              <li>Device type and operating system</li>
              <li>Browser type and version</li>
              <li>IP address (anonymized)</li>
              <li>Gameplay events and interactions within the game</li>
              <li>Session duration and frequency of visits</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              This information is collected to improve game performance, understand user behavior, and
              provide a better gaming experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Advertising Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Twin Clash uses cookies and similar technologies to enhance your experience and deliver
              relevant advertisements. Cookies are small data files stored on your device that help us
              recognize your browser and capture certain information.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Advertising Partners</h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              We work with third-party advertising partners to display ads in our game:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 space-y-2 ml-4">
              <li>
                <strong>Google AdSense:</strong> Uses cookies to serve ads based on your prior visits to our
                site and other sites on the Internet. You can opt out of personalized advertising by
                visiting{' '}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google's Ads Settings
                </a>
                .
              </li>
              <li>
                <strong>GameMonetize:</strong> Provides in-game advertising and may use cookies and similar
                technologies to deliver relevant ads.
              </li>
              <li>
                <strong>TikTok Ads:</strong> May collect information about your interactions with ads to
                measure ad effectiveness and deliver personalized advertising.
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              These third-party vendors may use cookies, web beacons, and other technologies to collect
              information about your online activities across different websites and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics and Performance Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use Firebase Analytics, a service provided by Google, to collect and analyze information
              about how users interact with Twin Clash. Firebase Analytics helps us understand:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 space-y-2 ml-4">
              <li>How many users play our game</li>
              <li>Which features are most popular</li>
              <li>How long users engage with the game</li>
              <li>Technical performance and error tracking</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              The data collected through Firebase Analytics is anonymous and aggregated. It does not include
              personally identifiable information. For more information about how Google uses data from
              sites that use their services, please visit{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://policies.google.com/technologies/partner-sites
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Twin Clash is not specifically directed at children under the age of 13. We do not knowingly
              collect personal information from children under 13. If you are a parent or guardian and
              believe that your child has provided us with personal information, please contact us at{' '}
              <a href="mailto:contact@twinclash.org" className="text-blue-600 hover:underline">
                contact@twinclash.org
              </a>
              . We will take steps to remove such information from our systems.
            </p>
            <p className="text-gray-700 leading-relaxed">
              In compliance with the Children's Online Privacy Protection Act (COPPA), we do not require
              children to disclose more information than is reasonably necessary to participate in our game.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Information</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              The information we collect is used for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 space-y-2 ml-4">
              <li>To provide and maintain the Twin Clash game</li>
              <li>To improve game performance and user experience</li>
              <li>To understand how users interact with our game</li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To deliver personalized advertising through our partners</li>
              <li>To analyze trends and gather statistical information</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. Anonymous,
              aggregated data may be shared with partners to improve our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Privacy Policies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Twin Clash's Privacy Policy does not apply to other advertisers or websites. We advise you to
              consult the respective privacy policies of these third-party services for more detailed
              information:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 space-y-2 ml-4">
              <li>
                Google AdSense:{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://policies.google.com/privacy
                </a>
              </li>
              <li>
                Firebase (Google):{' '}
                <a
                  href="https://firebase.google.com/support/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://firebase.google.com/support/privacy
                </a>
              </li>
              <li>
                TikTok:{' '}
                <a
                  href="https://www.tiktok.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://www.tiktok.com/legal/privacy-policy
                </a>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You may opt out of personalized advertising by visiting the respective settings pages of these
              services or by using browser settings to disable cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">GDPR and Your Data Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you are located in the European Economic Area (EEA), you have certain data protection
              rights under the General Data Protection Regulation (GDPR). Twin Clash aims to take reasonable
              steps to allow you to correct, amend, delete, or limit the use of your data.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Your Rights Include:</h3>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 space-y-2 ml-4">
              <li>
                <strong>Right of Access:</strong> You have the right to request information about the
                personal data we hold about you.
              </li>
              <li>
                <strong>Right to Rectification:</strong> You have the right to have incomplete or inaccurate
                data corrected.
              </li>
              <li>
                <strong>Right to Erasure:</strong> You have the right to request that we delete your
                personal data under certain conditions.
              </li>
              <li>
                <strong>Right to Restrict Processing:</strong> You have the right to request that we
                restrict the processing of your personal data.
              </li>
              <li>
                <strong>Right to Object:</strong> You have the right to object to our processing of your
                personal data.
              </li>
              <li>
                <strong>Right to Data Portability:</strong> You have the right to request a copy of your
                data in a structured, machine-readable format.
              </li>
              <li>
                <strong>Right to Withdraw Consent:</strong> You have the right to withdraw your consent at
                any time where we rely on consent to process your data.
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:contact@twinclash.org" className="text-blue-600 hover:underline">
                contact@twinclash.org
              </a>
              . We will respond to your request within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Consent</h2>
            <p className="text-gray-700 leading-relaxed">
              By using Twin Clash, you hereby consent to our Privacy Policy and agree to its terms. Your
              continued use of the game following any changes to this policy will be deemed as acceptance of
              those changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the "Last updated" date. You are
              advised to review this Privacy Policy periodically for any changes. Changes to this Privacy
              Policy are effective when they are posted on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data
              practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:contact@twinclash.org" className="text-blue-600 hover:underline">
                  contact@twinclash.org
                </a>
              </p>
              <p className="text-gray-700">
                <strong>Website:</strong>{' '}
                <a
                  href="https://twinclash.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://twinclash.org
                </a>
              </p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              This Privacy Policy is effective as of December 19, 2025 and will remain in effect except with
              respect to any changes in its provisions in the future, which will be in effect immediately
              after being posted on this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
