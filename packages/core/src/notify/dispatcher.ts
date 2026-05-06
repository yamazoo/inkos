import type { NotifyChannel } from "../models/project.js";
import { sendFeishu } from "./feishu.js";
import { sendWechatWork } from "./wechat-work.js";
import { sendWebhook, type WebhookPayload } from "./webhook.js";

export interface NotifyMessage {
  readonly title: string;
  readonly body: string;
}

export async function dispatchNotification(
  channels: ReadonlyArray<NotifyChannel>,
  message: NotifyMessage,
): Promise<void> {
  const fullText = `**${message.title}**\n\n${message.body}`;

  const tasks = channels.map(async (channel) => {
    try {
      switch (channel.type) {
        case "telegram": {
          const url = `https://api.telegram.org/bot${channel.botToken}/sendMessage`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: channel.chatId, text: fullText, parse_mode: "Markdown" }),
          });
          if (!res.ok) throw new Error(`Telegram API error ${res.status}: ${await res.text()}`);
          break;
        }
        case "feishu":
          await sendFeishu(
            { webhookUrl: channel.webhookUrl },
            message.title,
            message.body,
          );
          break;
        case "wechat-work":
          await sendWechatWork(
            { webhookUrl: channel.webhookUrl },
            fullText,
          );
          break;
        case "webhook":
          // Webhook channels are handled by dispatchWebhookEvent for structured events.
          // For generic text notifications, send as a pipeline-complete event.
          await sendWebhook(
            { url: channel.url, secret: channel.secret, events: channel.events },
            {
              event: "pipeline-complete",
              bookId: "",
              timestamp: new Date().toISOString(),
              data: { title: message.title, body: message.body },
            },
          );
          break;
      }
    } catch (e) {
      // Log but don't throw — notification failure shouldn't block pipeline
      process.stderr.write(
        `[notify] ${channel.type} failed: ${e}\n`,
      );
    }
  });

  await Promise.all(tasks);
}

/** Dispatch a structured webhook event to all webhook channels. */
export async function dispatchWebhookEvent(
  channels: ReadonlyArray<NotifyChannel>,
  payload: WebhookPayload,
): Promise<void> {
  const webhookChannels = channels.filter((ch) => ch.type === "webhook");
  if (webhookChannels.length === 0) return;

  const tasks = webhookChannels.map(async (channel) => {
    if (channel.type !== "webhook") return;
    try {
      await sendWebhook(
        { url: channel.url, secret: channel.secret, events: channel.events },
        payload,
      );
    } catch (e) {
      process.stderr.write(`[webhook] ${channel.url} failed: ${e}\n`);
    }
  });

  await Promise.all(tasks);
}
