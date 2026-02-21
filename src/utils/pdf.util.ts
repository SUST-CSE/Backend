import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import axios from 'axios';

export interface SignatureData {
  url: string;
  name: string;
  designation: string;
  date: Date;
}

/**
 * Generates an official department PDF from text content
 */
export const generateApplicationPDF = async (data: {
  title: string;
  description: string;
  studentName: string;
  studentId: string;
  email: string;
  date: Date;
}) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 850]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Header
  page.drawText('Department of Computer Science and Engineering', {
    x: 50,
    y: height - 50,
    size: 18,
    font: boldFont,
    color: rgb(0, 0.13, 0.28), // #002147
  });
  page.drawText('Shahjalal University of Science and Technology, Sylhet', {
    x: 50,
    y: height - 70,
    size: 12,
    font: font,
  });
  page.drawLine({
    start: { x: 50, y: height - 85 },
    end: { x: width - 50, y: height - 85 },
    thickness: 2,
    color: rgb(0, 0.13, 0.28),
  });

  // Date and Title
  page.drawText(`Date: ${data.date.toLocaleDateString()}`, {
    x: width - 150,
    y: height - 110,
    size: 10,
    font: font,
  });

  page.drawText(data.title.toUpperCase(), {
    x: 50,
    y: height - 150,
    size: 14,
    font: boldFont,
  });

  // Body
  const textLines = wrapText(data.description, 500, font, 11);
  let currentY = height - 180;
  let currentPage = page;

  for (const line of textLines) {
    if (currentY < 80) {
      // Add new page
      currentPage = pdfDoc.addPage([600, 850]);
      currentY = 800; // Reset Y for new page
    }

    currentPage.drawText(line, {
      x: 50,
      y: currentY,
      size: 11,
      font: font,
    });
    currentY -= 15;
  }

  // Footer / Student Info on the same page (or next if no space)
  if (currentY < 120) {
    currentPage = pdfDoc.addPage([600, 850]);
    currentY = 800;
  } else {
    currentY -= 30; // Extra spacing before footer
  }

  currentPage.drawText('Submitted By:', { x: 50, y: currentY, size: 10, font: boldFont });
  currentPage.drawText(data.studentName, { x: 50, y: currentY - 15, size: 10, font: font });
  currentPage.drawText(`ID: ${data.studentId}`, { x: 50, y: currentY - 30, size: 10, font: font });

  return await pdfDoc.save();
};

/**
 * Adds a signature to an existing PDF buffer.
 * Appends a new page if it's the first signature (L1), 
 * or adds to the existing signature page if it exists (L2).
 */
export const addSignatureToPDF = async (
  pdfBuffer: Buffer,
  signatureData: SignatureData,
  level: 'l1' | 'l2'
) => {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Fetch signature image
  console.log(`🖼️ Fetching signature image from: ${signatureData.url}`);
  const response = await axios.get(signatureData.url, { responseType: 'arraybuffer' });
  const sigImageBytes = response.data;
  console.log(`✅ Signature image downloaded: ${sigImageBytes.byteLength} bytes`);

  // Robust image format detection
  let sigImage;
  const urlLower = signatureData.url.toLowerCase();

  if (urlLower.includes('.png') || urlLower.includes('image/png')) {
    console.log('Detected PNG signature');
    sigImage = await pdfDoc.embedPng(sigImageBytes);
  } else {
    console.log('Attempting to embed as JPG signature (fallback)');
    try {
      sigImage = await pdfDoc.embedJpg(sigImageBytes);
    } catch (e) {
      console.log('JPG embedding failed, trying PNG fallback...');
      sigImage = await pdfDoc.embedPng(sigImageBytes);
    }
  }

  let page;
  const pageCount = pdfDoc.getPageCount();

  // Logic: L1 always starts a new "Approval Page". L2 looks for it.
  if (level === 'l1') {
    page = pdfDoc.addPage([600, 400]); // Dedicated approval page
    page.drawText('OFFICIAL ENDORSEMENT & APPROVAL', {
      x: 50,
      y: 350,
      size: 14,
      font: boldFont,
      color: rgb(0, 0.13, 0.28),
    });
    page.drawLine({
      start: { x: 50, y: 340 },
      end: { x: 550, y: 340 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
  } else {
    // Stage L2: Try to use the last page
    page = pdfDoc.getPage(pageCount - 1);
  }

  const xPos = level === 'l1' ? 70 : 330;
  const yPosBase = 150;

  // Draw Signature
  const dims = sigImage.scale(0.3); // Adjust scale
  page.drawImage(sigImage, {
    x: xPos + (150 - dims.width) / 2,
    y: yPosBase + 50,
    width: dims.width,
    height: dims.height,
  });

  page.drawLine({
    start: { x: xPos, y: yPosBase + 45 },
    end: { x: xPos + 200, y: yPosBase + 45 },
    thickness: 0.5,
  });

  page.drawText(signatureData.name, {
    x: xPos,
    y: yPosBase + 30,
    size: 10,
    font: boldFont,
  });
  page.drawText(signatureData.designation, {
    x: xPos,
    y: yPosBase + 15,
    size: 9,
    font: font,
  });
  page.drawText(`Date: ${signatureData.date.toLocaleDateString()}`, {
    x: xPos,
    y: yPosBase,
    size: 8,
    font: font,
  });

  return await pdfDoc.save();
};

// Helper to wrap text
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  // Strip \r characters (Windows line endings) — pdf-lib cannot encode them
  const cleanText = text.replace(/\r/g, '');
  // Split by explicit newlines first, then wrap each paragraph
  const paragraphs = cleanText.split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      lines.push(''); // Preserve blank lines
      continue;
    }
    const words = paragraph.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
  }
  return lines;
}
