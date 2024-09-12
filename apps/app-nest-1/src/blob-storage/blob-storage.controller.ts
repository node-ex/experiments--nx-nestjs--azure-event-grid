import { Controller, Post } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BlobServiceClient } from '@azure/storage-blob';

@Controller('blob-storage')
export class BlobStorageController {
  @Post('upload')
  async uploadFileToAzure() {
    const filePath = join(process.cwd(), 'uploads', 'google.pdf');
    const filename = `${uuidv4()}.pdf`;

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env['AZURE_STORAGE_ACCOUNT_CONNECTION_STRING']!,
    );
    const containerClient =
      blobServiceClient.getContainerClient('uploaded-files');
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    const fileStream = createReadStream(filePath);

    try {
      await blockBlobClient.uploadStream(fileStream);
      return { message: `Uploaded file's URL: ${blockBlobClient.url}` };
    } catch (error) {
      console.error('Failed to upload to Azure:', error);
      throw new Error('Azure upload failed');
    }
  }
}
