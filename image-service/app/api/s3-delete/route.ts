import { NextResponse, NextRequest } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
  },
});

// Helper function to delete files from S3
async function deleteFilesFromS3(keys: string[]) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;
  if (!bucketName) {
    throw new Error("AWS S3 Bucket name is not defined");
  }

  if (keys.length === 0) {
    console.warn("No files provided for deletion.");
    return;
  }

  try {
    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    };

    console.log(`Deleting ${keys.length} file(s) from S3...`);
    await s3Client.send(new DeleteObjectsCommand(deleteParams));

    console.log("Deletion successful.");
  } catch (error) {
    console.error("S3 Deletion Error:", error);
    throw error;
  }
}

// API Handler for DELETE request
export async function DELETE(req: NextRequest) {
  try {
    const { groupId, filePath } = await req.json();

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    if (!bucketName) {
      throw new Error("S3 Bucket name is not configured");
    }

    if (filePath) {
      // Delete a single file
      await deleteFilesFromS3([filePath]);
      return NextResponse.json({
        success: true,
        message: `File deleted: ${filePath}`,
      });
    } else {
      // Delete all files in the group folder
      const prefix = `images/group/${groupId}/`;
      let continuationToken: string | undefined = undefined;

      let allKeys: Array<string> = [];

      do {
        const listCommand = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        });

        const listedObjects: {
          Contents?: { Key?: string }[];
          NextContinuationToken?: string;
        } = await s3Client.send(listCommand);

        if (listedObjects.Contents && listedObjects.Contents.length > 0) {
          const fileKeys: string[] = listedObjects.Contents.map(
            (obj) => obj.Key || ""
          ).filter((key) => key !== ""); // Remove empty keys

          allKeys = [...allKeys, ...fileKeys];
        }

        continuationToken = listedObjects.NextContinuationToken ?? undefined;
      } while (continuationToken);

      if (allKeys.length > 0) {
        await deleteFilesFromS3(allKeys);
      }

      return NextResponse.json({
        success: true,
        message: `All files under ${prefix} have been deleted.`,
      });
    }
  } catch (error) {
    console.error("Deletion Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
