/**
 * Resend Email Service
 * 
 * Handles sending emails via Resend API
 */

import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Sender email - uses verified paws-esport.com domain
const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || "Paws Esport <noreply@paws-esport.com>";

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
    try {
        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM,
            to,
            subject,
            html,
            text: text || stripHtml(html),
        });

        if (error) {
            console.error("[Resend] Error sending email:", error);
            throw error;
        }

        console.log("[Resend] Email sent successfully:", data?.id);
        return { success: true, id: data?.id };
    } catch (error) {
        console.error("[Resend] Failed to send email:", error);
        throw error;
    }
}

/**
 * Simple HTML to text conversion for fallback
 */
function stripHtml(html: string): string {
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
