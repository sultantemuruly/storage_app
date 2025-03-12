import { NextResponse, NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

type UploadFileParams = {
  Bucket: string;
  Key: string;
  Body: Buffer;
  ContentType: string;
};

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
  },
});

async function uploadFileToS3(
  file: Buffer,
  fileName: string,
  groupId: string
): Promise<string> {
  if (!process.env.AWS_S3_BUCKET_NAME) {
    throw new Error("AWS S3 Bucket name is not defined");
  }

  if (!groupId) {
    throw new Error("Group ID is required");
  }

  const params: UploadFileParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `images/group/${groupId}/filename/${fileName}`,
    Body: file,
    ContentType: "image/jpg",
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return fileName;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    // Retrieve the group ID directly from cookies (no decoding needed)
    const cookieHeader = req.headers.get("cookie");
    const groupId =
      cookieHeader
        ?.split("; ")
        .find((c) => c.startsWith("selectedGroup="))
        ?.split("=")[1] || "";

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is missing or invalid" },
        { status: 400 }
      );
    }

    console.log("Group ID:", groupId);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = await uploadFileToS3(buffer, file.name, groupId);

    return NextResponse.json({
      success: true,
      fileName,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
