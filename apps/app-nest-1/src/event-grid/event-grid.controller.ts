import {
  AzureKeyCredential,
  EventGridPublisherClient,
  SendEventGridEventInput,
} from '@azure/eventgrid';
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

@Controller('event-grid')
export class EventGridController {
  private client: EventGridPublisherClient<'EventGrid'>;

  constructor() {
    const endpoint = process.env['AZURE_EVENT_GRID_TOPIC_ENDPOINT']!;
    const key = process.env['AZURE_EVENT_GRID_TOPIC_ACCESS_KEY']!;
    console.log({ endpoint, key });

    this.client = new EventGridPublisherClient(
      endpoint,
      'EventGrid',
      new AzureKeyCredential(key),
    );
  }

  @Post('send-event')
  public async sendEvent(): Promise<void> {
    const event: SendEventGridEventInput<any> = {
      eventType: 'message',
      subject: 'example/subject',
      dataVersion: '1.0',
      data: {
        message: 'Hello, World!',
      },
    };
    await this.client.send([event]);

    console.log('Event sent');
  }

  // NOTE: Set as a WebHook endpoint in the Event Grid subscription
  // NOTE: Use tunneling service like ngrok to expose the local server to the internet
  @Post('handle-event')
  public callback(
    @Body() body: any[] | undefined,
    @Headers('aeg-subscription-name')
    eventGridSubscriptionName: string | undefined,
    @Res() response: Response,
  ) {
    console.log({
      events: JSON.stringify(body, null, 2),
      eventGridSubscriptionName,
    });

    // NOTE: Uncomment for validating the webhook when creating an event grid subscription
    // {
    //   return this.handleSubscriptionValiationEvent(
    //     body,
    //     eventGridSubscriptionName,
    //     response,
    //   );
    // }
  }

  private handleSubscriptionValiationEvent(
    events: any[] | undefined,
    eventGridSubscriptionName: string | undefined,
    response: Response,
  ) {
    if (!events || events.length === 0) {
      const errorMessage = 'Missing event data';
      console.log(errorMessage);
      throw new BadRequestException(errorMessage);
    }

    const event = events[0];
    if (
      eventGridSubscriptionName?.toLowerCase() !==
      'PERSONAL--EVENT-GRID--SUBSCRIPTION'.toLowerCase()
    ) {
      const errorMessage = `Missing or invalid subscription name: "${eventGridSubscriptionName}"`;
      console.log(errorMessage);
      throw new BadRequestException(errorMessage);
    }

    const eventType = event?.eventType;
    if (
      eventType?.toLowerCase() !==
      'Microsoft.EventGrid.SubscriptionValidationEvent'.toLowerCase()
    ) {
      const errorMessage = `Missing or invalid event type: "${eventType}"`;
      console.log(errorMessage);
      throw new BadRequestException(errorMessage);
    }

    const validationCode = event?.data?.validationCode;
    const validationUrl = event?.data?.validationUrl;

    return response.status(200).json({ validationResponse: validationCode });
  }
}
