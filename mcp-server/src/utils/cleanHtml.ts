const MAX_CONTENT_LENGTH = 15000;

export const cleanHtml = (rawHtml: string): string => {
  return rawHtml
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CONTENT_LENGTH);
};

export const limitTextSize = (text: string, maxLength = MAX_CONTENT_LENGTH): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength);
};
