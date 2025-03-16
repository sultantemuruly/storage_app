import { NextResponse } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
  },
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      );
    }

    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: path,
    });

    const { Contents } = await s3Client.send(command);

    if (!Contents || Contents.length === 0) {
      return NextResponse.json({ images: [] });
    }

    // Generate presigned URLs and extract metadata
    const imageUrls = await Promise.all(
      Contents.map(async (file) => {
        const fileName = file.Key!.split("/").pop() || "Unknown"; // Extract file name
        const lastModified = file.LastModified
          ? new Date(file.LastModified).toISOString().split("T")[0]
          : "Unknown"; // Extract last modified date

        const getObjectCommand = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: file.Key!,
        });

        const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
          expiresIn: 3600, // 1-hour expiration
        });

        return {
          url: signedUrl,
          key: file.Key,
          name: fileName,
          date: lastModified,
        };
      })
    );

    return NextResponse.json({ images: imageUrls });
  } catch (error) {
    console.error("Error retrieving images:", error);
    return NextResponse.json(
      { error: "Failed to retrieve images" },
      { status: 500 }
    );
  }
}
