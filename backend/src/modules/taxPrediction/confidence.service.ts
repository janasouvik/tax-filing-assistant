import prisma from '../../config/prisma';

export const calculateConfidence = async (taxReturnId: string) => {
  const documents = await prisma.document.findMany({
    where: { taxReturnId },
    include: { extractedFields: true }
  });

  let totalFields = 0;
  let verifiedFields = 0;
  let highConfidenceFields = 0;

  for (const doc of documents) {
    for (const field of doc.extractedFields) {
      totalFields++;
      if (field.isVerified) verifiedFields++;
      if ((field.confidence || 0) > 0.8) highConfidenceFields++;
    }
  }

  // Base confidence on proportion of verified or high-confidence fields
  let overallScore = 100;
  if (totalFields > 0) {
    const rawScore = ((verifiedFields * 1.0) + (highConfidenceFields * 0.5)) / (totalFields * 1.5) * 100;
    overallScore = Math.min(100, Math.round(rawScore));
  } else if (documents.length === 0) {
    // If no documents, we rely purely on manual entry, confidence is medium-high assuming user knows what they are doing, but can't be 100% without proof
    overallScore = 70;
  }

  return {
    overallScore,
    documentConfidence: overallScore,
    isHighConfidence: overallScore >= 80,
    metrics: {
      totalFields,
      verifiedFields,
      highConfidenceFields
    }
  };
};
