export const splitTextIntoParagraphs = (text: string) => {
  return text.split('\n').filter((paragraph) => paragraph.trim() !== '');
};