import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env.local"
    );
  }

  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers");
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  // Get body
  const payload = await req.json();
  if (!payload) {
    console.error("Error: Empty request body");
    return new Response("Error: Request body is empty", { status: 400 });
  }

  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Error: Verification error", { status: 400 });
  }

  if (evt.type === "user.created") {
    try {
      const { id, email_addresses, first_name, last_name } = evt.data;

      // Create user with a default group in a transaction
      await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            clerkId: id,
            email: email_addresses[0]?.email_address || "no-email@example.com",
            name: first_name ? `${first_name} ${last_name || ""}` : null,
          },
        });

        // Create a default group for the user
        await tx.group.create({
          data: {
            name: "My First Group",
            userId: user.id,
          },
        });
      });

      console.log("User and default group created successfully");
    } catch (dbError) {
      console.error("Database error:", dbError);
      return new Response("Error: Failed to save user and group", {
        status: 500,
      });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
