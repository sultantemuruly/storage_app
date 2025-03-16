import { NextResponse, NextRequest } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
  },
});

async function deleteFilesFromS3(prefix: string): Promise<void> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("AWS S3 Bucket name is not defined");
  }

  let continuationToken: string | undefined = undefined;

  try {
    do {
      // List objects (handles pagination)
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const listedObjects: {
        Contents?: { Key?: string }[];
        NextContinuationToken?: string;
      } = await s3Client.send(listCommand);

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        console.log(`No files found under prefix: ${prefix}`);
        return;
      }

      // Prepare objects for deletion (handle potential undefined keys)
      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: listedObjects.Contents?.map((obj) =>
            obj.Key ? { Key: obj.Key } : null
          ).filter(Boolean) as { Key: string }[],
        },
      };

      if (deleteParams.Delete.Objects.length > 0) {
        // Delete objects in bulk
        const deleteCommand = new DeleteObjectsCommand(deleteParams);
        await s3Client.send(deleteCommand);
        console.log(
          `Deleted ${deleteParams.Delete.Objects.length} files under prefix: ${prefix}`
        );
      }

      continuationToken = listedObjects.NextContinuationToken ?? undefined;
    } while (continuationToken);
  } catch (error) {
    console.error("S3 Deletion Error:", error);
    throw error;
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { groupId } = await req.json();

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    const prefix = `images/group/${groupId}/`;

    // Delete all files under the group folder
    await deleteFilesFromS3(prefix);

    return NextResponse.json({
      success: true,
      message: `All files under ${prefix} have been deleted.`,
    });
  } catch (error) {
    console.error("Deletion Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
