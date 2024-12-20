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
