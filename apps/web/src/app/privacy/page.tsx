import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | PawsEsport",
    description: "Privacy Policy for PawsEsport Transfer Simulator - How we collect and protect your data.",
};

export default function PrivacyPage() {
    return (
        <div className="container-custom py-12 max-w-4xl">
            <h1 className="text-4xl font-display font-bold mb-8">Privacy Policy</h1>

            <div className="prose prose-invert max-w-none space-y-8 text-foreground/80">
                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                    <p>
                        Welcome to PawsEsport ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                        This Privacy Policy explains what information we collect, how we use it, and your rights in relation to it.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
                    <p>We collect personal information that you voluntarily provide to us when you register on the website.</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li><strong>Personal Information:</strong> Includes your name, email address, and profile picture (via OAuth providers like Google/Discord).</li>
                        <li><strong>Account Data:</strong> We store your simulation progress, coins balance, betting history, and friend connections.</li>
                        <li><strong>Log Data:</strong> Like many websites, we collect information that your browser sends whenever you visit our Site ("Log Data"). This may include information such as your computer's Internet Protocol ("IP") address, browser type, and browser version.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
                    <p>We use the information we collect or receive:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>To facilitate account creation and logon process.</li>
                        <li>To maintain your game state and simulation progress.</li>
                        <li>To enable user-to-user interactions (friend requests, leaderboards).</li>
                        <li>To protect our services (e.g., preventing betting fraud or abuse).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">4. Cookies and Tracking Technologies</h2>
                    <p>
                        We use cookies primarily for <strong>authentication and security</strong> purposes. These are "essential" cookies necessary for the website to function.
                        We do not use third-party tracking cookies for advertising purposes without your explicit consent.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">5. Your Data Rights (GDPR)</h2>
                    <p>Under the General Data Protection Regulation (GDPR), you have the following rights:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li><strong>Right to Access:</strong> You can request a copy of the personal data we hold about you. You can do this directly from your Profile settings.</li>
                        <li><strong>Right to Rectification:</strong> You can update your profile information at any time.</li>
                        <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You can request that we delete your account and all associated data. This action is irreversible and available in your Profile settings.</li>
                        <li><strong>Right to Restrict Processing:</strong> You have the right to ask us to restrict the processing of your personal information.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">6. Data Retention</h2>
                    <p>
                        We keep your information for as long as necessary to fulfill the purposes outlined in this privacy policy unless otherwise required by law.
                        If you delete your account, your personal information is removed from our active databases immediately.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">7. Contact Us</h2>
                    <p>
                        If you have questions or comments about this policy, you may contact us via the support channels on our platform.
                    </p>
                </section>

                <div className="pt-8 border-t border-card-border text-sm text-muted-foreground">
                    Last updated: December 19, 2025
                </div>
            </div>
        </div>
    );
}
