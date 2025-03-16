import { NextResponse, NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid Content-Type" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      console.error("❌ File is missing or invalid");
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Extract group ID from cookie
    const groupId = req.cookies.get("selectedGroup")?.value;
    if (!groupId) {
      console.error("❌ Group ID is missing");
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || `file-${Date.now()}.jpg`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: `images/group/${groupId}/${fileName}`,
      Body: buffer,
      ContentType: file.type,
    };

    console.log("Uploading file:", params.Key);

    // Upload file to S3
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    console.log("✅ Upload successful");

    return NextResponse.json({ success: true, fileName });
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
