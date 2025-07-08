
"use client";

import { AboutForm } from "./page-forms/about-form";
import { ContactForm } from "./page-forms/contact-form";
import { FaqForm } from "./page-forms/faq-form";
import { LegalPagesForm } from "./page-forms/legal-pages-form";

export function PagesSettingsForm() {
    return (
        <div className="space-y-6">
            <AboutForm />
            <ContactForm />
            <FaqForm />
            <LegalPagesForm />
        </div>
    );
}
