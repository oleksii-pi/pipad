// src/services/openaiApi-voice.ts
export async function transcribeAudio(
  openaiSecretKey: string,
  audioBlob: Blob
): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", "whisper-1");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + openaiSecretKey,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(
      "Audio transcription error: " +
        (errorResponse.error?.message || response.statusText)
    );
  }

  const json = await response.json();
  return json.text;
}

export async function streamAnswer(
  abortController: AbortController,
  openaiSecretKey: string,
  text: string,
  imagesBase64Array: string[],
  temperature: number,
  onPartialResponse: (text: string) => void,
  onError: (error: string) => void,
  aiModel: string,
  systemPrompt: string,
  textToSpeech: boolean
) {
  try {
    let messages = [];

    if (systemPrompt && systemPrompt.trim() !== "") {
      messages.push({
        role: "system",
        content: systemPrompt,
      });
    }

    if (imagesBase64Array && imagesBase64Array.length > 0) {
      const imageMessages = imagesBase64Array.map((imageContent) => ({
        type: "image_url",
        image_url: {
          url: imageContent,
        },
      }));

      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: text,
          },
          ...imageMessages,
        ],
      });
    } else {
      messages.push({ role: "user", content: text });
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

    const speakText = async function (text: string) {
      if (!textToSpeech || !text.trim()) return;

      try {
        const ttsResponse = await fetch(
          "https://api.openai.com/v1/audio/speech",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + openaiSecretKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "tts-1",
              input: text,
              voice: "alloy",
            }),
          }
        );

        if (!ttsResponse.ok) {
          onError(`TTS failed: ${ttsResponse.statusText}`);
          return;
        }

        const audioData = await ttsResponse.arrayBuffer();

        const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audio.play().catch((err) => {
          onError("Audio playback failed: " + err.message);
        });
      } catch (err: any) {
        onError("Text-to-speech error: " + err.message);
      }
    };

    let accumulated = "";
    let fullText = "";

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
              fullText += partialText;
            }
          } catch (error) {
            onError("Can not parse json: " + line);
          }
        }
      }

      if (accumulated.includes("data: [DONE]")) break;
    }

    if (textToSpeech) {
      speakText(fullText);
    }
  } catch (error: any) {
    if (error.name !== "AbortError") {
      onError(error.toString());
    }
  }
}
