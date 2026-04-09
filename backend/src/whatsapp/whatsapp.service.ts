import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  async sendMessage(phoneNumber: string, message: string) {
    // Conceptual Twilio / WhatsApp Business API connection mock
    this.logger.log(
      `\n======================================\n[WHATSAPP MESSAGE SENT to ${phoneNumber}]\nPayload: ${message}\n======================================`,
    );
    return { success: true, timestamp: new Date() };
  }

  async sendAppointmentReminder(
    phoneNumber: string,
    patientName: string,
    date: string,
  ) {
    const text = `Hello ${patientName}, this is a reminder from MedCare Plus for your appointment on ${date}. Please reply YES to confirm.`;
    return this.sendMessage(phoneNumber, text);
  }

  async sendLabResultLink(
    phoneNumber: string,
    patientName: string,
    safeLink: string,
  ) {
    const text = `Hello ${patientName}, your lab results are ready. View securely using your dynamic token access: ${safeLink}`;
    return this.sendMessage(phoneNumber, text);
  }

  async sendBillingAlert(
    phoneNumber: string,
    patientName: string,
    amount: number,
    status: string,
  ) {
    const text = `Hello ${patientName}, your Medicare/Medicaid Claim for $${amount} has been ${status}. Please visit the portal for details.`;
    return this.sendMessage(phoneNumber, text);
  }
}
