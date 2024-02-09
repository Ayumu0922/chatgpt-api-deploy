import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = "edge";

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// POST api/analyzeImage
export async function POST(request: Request) {
  const { image } = await request.json();
  const response = await openai.createChatCompletion({
    model: "gpt-4-vision-preview",
    // これがあると一度に受け取らずに部分部分で受け取れる
    stream: true,
    // これを指定しないととても短い文書を返すようになる
    max_tokens: 500,
    messages: [
      {
        role: "user",
        // @ts-ignore
        content: [
          { type: "text", text: "この画像を説明してください" },
          {
            type: "image_url",
            image_url: image,
          },
        ],
      },
    ],
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
