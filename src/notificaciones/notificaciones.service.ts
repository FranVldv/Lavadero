import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface DatosNuevoTurno {
  nombreCliente: string;
  telefono: string;
  patente: string;
  fecha: string;
  franja: string;
}

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);
  private readonly phoneNumberId: string;
  private readonly accessToken: string;
  private readonly ownerPhone: string;

  constructor(private config: ConfigService) {
    this.phoneNumberId = config.get<string>('WHATSAPP_PHONE_NUMBER_ID', '');
    this.accessToken   = config.get<string>('WHATSAPP_ACCESS_TOKEN', '');
    this.ownerPhone    = config.get<string>('OWNER_WHATSAPP_NUMBER', '');
  }

  async notificarNuevoTurno(datos: DatosNuevoTurno): Promise<void> {
    const mensaje =
      `🚗 *Nuevo turno reservado*\n\n` +
      `👤 *Cliente:* ${datos.nombreCliente}\n` +
      `📞 *Teléfono:* ${datos.telefono}\n` +
      `🔢 *Patente:* ${datos.patente}\n` +
      `📅 *Fecha:* ${datos.fecha}\n` +
      `🕐 *Horario:* ${datos.franja}`;

    await this.enviarWhatsApp(this.ownerPhone, mensaje);
  }

  async notificarAutoListo(datos: {
    telefono: string;
    nombreCliente: string;
    patente: string;
    total: number;
    alias?: string;
  }): Promise<void> {
    const aliasTexto = datos.alias ? `\n💳 *Alias transferencia / MP:* \`${datos.alias}\`` : '';
    const mensaje =
      `¡Hola ${datos.nombreCliente || 'Estimado cliente'}! 👋🚗\n\n` +
      `Tu vehículo patente *${datos.patente.toUpperCase()}* ya está *LISTO PARA RETIRAR* en nuestro lavadero.\n\n` +
      `💰 *Total a abonar:* $${datos.total.toLocaleString('es-AR')}${aliasTexto}\n\n` +
      `¡Te esperamos! Muchas gracias por confiar en nosotros. ✨`;

    await this.enviarWhatsApp(datos.telefono, mensaje);
  }

  async notificarCierreDiario(resumen: string): Promise<void> {
    await this.enviarWhatsApp(this.ownerPhone, resumen);
  }

  async enviarMensajeGenerico(destino: string, texto: string): Promise<void> {
    await this.enviarWhatsApp(destino, texto);
  }

  private async enviarWhatsApp(destino: string, texto: string): Promise<void> {
    if (!this.phoneNumberId || !this.accessToken || !destino) {
      this.logger.warn(
        'WhatsApp no configurado — variables WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN y OWNER_WHATSAPP_NUMBER deben estar en .env',
      );
      this.logger.debug(`[WhatsApp simulado → ${destino}]\n${texto}`);
      return;
    }

    try {
      await axios.post(
        `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: destino,
          type: 'text',
          text: { body: texto },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`WhatsApp enviado a ${destino}`);
    } catch (err: any) {
      this.logger.error(
        `Error al enviar WhatsApp: ${err?.response?.data?.error?.message ?? err.message}`,
      );
    }
  }
}
