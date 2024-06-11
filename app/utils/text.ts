export const splitTextIntoParagraphs = (text: string) => {
  return text.split('\n\n').filter((paragraph) => paragraph.trim() !== '');
};