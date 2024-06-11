export const calculateSceneDuration = (paragraph: string, speechRate: number) => {
  const wordCount = paragraph.split(' ').length;
  const wordsPerMinute = speechRate;
  const durationInMinutes = wordCount / wordsPerMinute;
  const durationInSeconds = durationInMinutes * 60;
  return durationInSeconds;
};