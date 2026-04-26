import fs from "fs/promises";
import pdf from "pdf-parse/lib/pdf-parse.js";

export interface ParsedPdfDocument {
  text: string;
  pageCount: number;
}

export const parsePdfDocument = async (
  absoluteFilePath: string
): Promise<ParsedPdfDocument> => {
  const buffer = await fs.readFile(absoluteFilePath);
  const parsed = await pdf(buffer);

  return {
    text: parsed.text || "",
    pageCount: parsed.numpages || 0,
  };
};
