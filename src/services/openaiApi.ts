export async function streamAnswer(
  abortController: AbortController,
  openaiSecretKey: string,
  text: string,
  imagesBase64Array: string[],
  temperature: number,
  onPartialResponse: (text: string) => void,
  onError: (error: string) => void,
  aiModel: string
) {
  try {
    let messages;
    if (imagesBase64Array && imagesBase64Array.length > 0) {
      const imageMessages = imagesBase64Array.map((imageContent) => ({
        type: "image_url",
        image_url: {
          url: imageContent,
        },
      }));

      messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: text,
            },
            ...imageMessages,
          ],
        },
      ];
    } else {
      messages = [{ role: "user", content: text }];
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + openaiSecretKey,
      },
      body: JSON.stringify({
        model: aiModel,
        messages: messages,
        temperature: temperature,
        n: 1,
        stream: true,
      }),
      signal: abortController?.signal,
    });

    if (!response.ok) {
      switch (response.status) {
        case 429:
          onError(
            "Rate limit exceeded. Please wait before making another request."
          );
          break;
        case 401:
          const responseBody = await response.json();
          onError(responseBody.error.message);
          break;
        default:
          onError(`Fetch failed. Status code: ${response.status}`);
      }
      return;
    }

    const reader = response!.body!.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      const sseString = decoder.decode(value);
      accumulated += sseString;

      let newlineIndex;
      while ((newlineIndex = accumulated.indexOf("\n")) !== -1) {
        const line = accumulated.slice(0, newlineIndex);
        accumulated = accumulated.slice(newlineIndex + 1);

        if (line.startsWith("data:") && !line.includes("data: [DONE]")) {
          try {
            const parsed = JSON.parse(line.substring(6).trim());
            const partialText = parsed.choices[0].delta.content;
            if (partialText) {
              onPartialResponse(partialText);
            }
          } catch (error) {
            onError("Can not parse json: " + line);
          }
        }
      }

      if (accumulated.includes("data: [DONE]")) break;
    }
  } catch (error: any) {
    if (error.name !== "AbortError") {
      onError(error);
    }
  }
}
