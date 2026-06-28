import React from 'react';
import { motion } from 'motion/react';
import { Language, translations } from '../translations';

interface PolicyPageProps {
  lang: Language;
}

type LegalSection = {
  title: string;
  body: string;
};

const LegalPageShell = ({ title, sections }: { title: string; sections: LegalSection[] }) => (
  <div className="min-h-screen bg-white pb-32">
    <section className="icare-index-section icare-legal-section">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="icare-legal-section__inner"
      >
        <h1 className="icare-legal-section__title">
          {title}
        </h1>

        <div className="icare-legal-section__content">
          {sections.map((section) => (
            <section key={section.title} className="icare-legal-section__block">
              <h2 className="icare-legal-section__heading">
                {section.title}
              </h2>
              <p className="icare-legal-section__body">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </motion.div>
    </section>
  </div>
);

export const PrivacyPolicy: React.FC<PolicyPageProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <LegalPageShell
      title={t.legal.privacyPolicy.title}
      sections={[
        { title: t.legal.privacyPolicy.section1Title, body: t.legal.privacyPolicy.section1Body },
        { title: t.legal.privacyPolicy.section2Title, body: t.legal.privacyPolicy.section2Body },
        { title: t.legal.privacyPolicy.section3Title, body: t.legal.privacyPolicy.section3Body },
        { title: t.legal.privacyPolicy.section4Title, body: t.legal.privacyPolicy.section4Body },
      ]}
    />
  );
};

export const TermsOfService: React.FC<PolicyPageProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <LegalPageShell
      title={t.legal.termsOfService.title}
      sections={[
        { title: t.legal.termsOfService.section1Title, body: t.legal.termsOfService.section1Body },
        { title: t.legal.termsOfService.section2Title, body: t.legal.termsOfService.section2Body },
        { title: t.legal.termsOfService.section3Title, body: t.legal.termsOfService.section3Body },
        { title: t.legal.termsOfService.section4Title, body: t.legal.termsOfService.section4Body },
      ]}
    />
  );
};

export const AccessibilityStatement: React.FC<PolicyPageProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <LegalPageShell
      title={t.legal.accessibility.title}
      sections={[
        { title: t.legal.accessibility.commitmentTitle, body: t.legal.accessibility.commitmentBody },
        { title: t.legal.accessibility.conformanceTitle, body: t.legal.accessibility.conformanceBody },
        { title: t.legal.accessibility.feedbackTitle, body: t.legal.accessibility.feedbackBody },
      ]}
    />
  );
};
