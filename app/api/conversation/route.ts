import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });


export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages  } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

   
    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }


    const freeTrial = await checkApiLimit();

    if (!freeTrial ) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }
   

    const response = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-3.5-turbo",
      });

      await incrementApiLimit();

    return new NextResponse(JSON.stringify(response));
  } catch (error) {
    console.log('[CONVERSATION_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};