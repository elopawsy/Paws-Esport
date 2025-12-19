/**
 * Email Templates
 * 
 * Modern, responsive email templates for Paws Esport authentication flows
 */

interface EmailTemplateProps {
    url: string;
    userName?: string;
    appName?: string;
}

// Paws Esport Brand Colors
const BRAND = {
    primary: "#22c55e",  // Green 500
    primaryHover: "#16a34a",  // Green 600
    background: "#09090b",  // Zinc 950
    card: "#18181b",  // Zinc 900
    cardBorder: "#27272a",  // Zinc 800
    text: "#f4f4f5",  // Zinc 100
    textMuted: "#a1a1aa",  // Zinc 400
    textSubtle: "#71717a",  // Zinc 500
};

const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: ${BRAND.background};
    color: ${BRAND.text};
`;

/**
 * Verification Email Template
 */
export function verificationEmailTemplate({
    url,
    userName = "User",
    appName = "Paws Esport"
}: EmailTemplateProps): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email - ${appName}</title>
</head>
<body style="margin: 0; padding: 0; ${baseStyles}">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: ${BRAND.card}; border-radius: 12px; border: 1px solid ${BRAND.cardBorder};">
                    <!-- Header with Logo -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                            <div style="margin-bottom: 24px;">
                                <span style="font-size: 32px; font-weight: 800; color: ${BRAND.text}; letter-spacing: 0.05em; text-transform: uppercase;">🐾 PAWS ESPORT</span>
                            </div>
                            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
                                Verify your email
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: ${BRAND.textMuted};">
                                Hey ${userName},
                            </p>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 24px; color: ${BRAND.textMuted};">
                                Thanks for signing up for <strong style="color: ${BRAND.text};">${appName}</strong>! 
                                Please verify your email address by clicking the button below.
                            </p>
                            
                            <!-- Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; font-size: 14px; line-height: 20px; color: ${BRAND.textSubtle};">
                                If you didn't create an account, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; border-top: 1px solid ${BRAND.cardBorder};">
                            <p style="margin: 0; font-size: 12px; color: ${BRAND.textSubtle}; text-align: center;">
                                This link will expire in 24 hours.
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; color: ${BRAND.textSubtle}; text-align: center;">
                                If the button doesn't work, copy and paste this link:<br>
                                <a href="${url}" style="color: ${BRAND.textMuted}; word-break: break-all;">${url}</a>
                            </p>
                            <p style="margin: 20px 0 0; font-size: 12px; color: ${BRAND.textSubtle}; text-align: center;">
                                © ${new Date().getFullYear()} Paws Esport · <a href="https://paws-esport.com" style="color: ${BRAND.primary}; text-decoration: none;">paws-esport.com</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

/**
 * Password Reset Email Template
 */
export function passwordResetEmailTemplate({
    url,
    userName = "User",
    appName = "Paws Esport"
}: EmailTemplateProps): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your password - ${appName}</title>
</head>
<body style="margin: 0; padding: 0; ${baseStyles}">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: ${BRAND.card}; border-radius: 12px; border: 1px solid ${BRAND.cardBorder};">
                    <!-- Header with Logo -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                            <div style="margin-bottom: 24px;">
                                <span style="font-size: 32px; font-weight: 800; color: ${BRAND.text}; letter-spacing: 0.05em; text-transform: uppercase;">🐾 PAWS ESPORT</span>
                            </div>
                            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
                                Reset your password
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: ${BRAND.textMuted};">
                                Hey ${userName},
                            </p>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 24px; color: ${BRAND.textMuted};">
                                We received a request to reset the password for your <strong style="color: ${BRAND.text};">${appName}</strong> account. 
                                Click the button below to choose a new password.
                            </p>
                            
                            <!-- Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; font-size: 14px; line-height: 20px; color: ${BRAND.textSubtle};">
                                If you didn't request a password reset, you can safely ignore this email. 
                                Your password will remain unchanged.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; border-top: 1px solid ${BRAND.cardBorder};">
                            <p style="margin: 0; font-size: 12px; color: ${BRAND.textSubtle}; text-align: center;">
                                This link will expire in 1 hour for security reasons.
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; color: ${BRAND.textSubtle}; text-align: center;">
                                If the button doesn't work, copy and paste this link:<br>
                                <a href="${url}" style="color: ${BRAND.textMuted}; word-break: break-all;">${url}</a>
                            </p>
                            <p style="margin: 20px 0 0; font-size: 12px; color: ${BRAND.textSubtle}; text-align: center;">
                                © ${new Date().getFullYear()} Paws Esport · <a href="https://paws-esport.com" style="color: ${BRAND.primary}; text-decoration: none;">paws-esport.com</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

