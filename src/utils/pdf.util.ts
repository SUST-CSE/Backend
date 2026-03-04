import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

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
  const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Embed SUST Logo
  try {
    const logoPath = '/media/ridoy-pc/New Volume/CSE Society/Frontend/public/sust.png';
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const logoDims = logoImage.scale(0.12);
      page.drawImage(logoImage, {
        x: 50,
        y: height - 90,
        width: logoDims.width,
        height: logoDims.height,
      });
    }
  } catch (err) {
    console.error('Error embedding logo in PDF:', err);
  }

  // Header - Centered Department Text
  const deptText = 'Department of Computer Science and Engineering';
  const deptWidth = boldFont.widthOfTextAtSize(deptText, 16);
  page.drawText(deptText, {
    x: (width - deptWidth) / 2 + 20, // Offset for logo
    y: height - 55,
    size: 16,
    font: boldFont,
    color: rgb(0, 0.13, 0.28), // #002147
  });

  const uniText = 'Shahjalal University of Science and Technology, Sylhet';
  const uniWidth = font.widthOfTextAtSize(uniText, 11);
  page.drawText(uniText, {
    x: (width - uniWidth) / 2 + 20,
    y: height - 72,
    size: 11,
    font: font,
    color: rgb(0, 0.13, 0.28),
  });

  const docLabel = 'Official Application Document';
  const docWidth = font.widthOfTextAtSize(docLabel, 9);
  page.drawText(docLabel, {
    x: (width - docWidth) / 2 + 20,
    y: height - 85,
    size: 9,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawLine({
    start: { x: 50, y: height - 100 },
    end: { x: width - 50, y: height - 100 },
    thickness: 1.5,
    color: rgb(0, 0.13, 0.28),
  });

  // Date (Right Aligned)
  const dateStr = `Date: ${data.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  const dateWidth = font.widthOfTextAtSize(dateStr, 11);
  page.drawText(dateStr, {
    x: width - 50 - dateWidth,
    y: height - 130,
    size: 11,
    font: font,
  });

  // Recipient Block
  page.drawText('To,', { x: 50, y: height - 160, size: 11, font: font });
  page.drawText('The Head of the Department,', { x: 50, y: height - 175, size: 11, font: boldFont });
  page.drawText('Department of Computer Science and Engineering,', { x: 50, y: height - 190, size: 11, font: font });
  page.drawText('SUST, Sylhet-3114.', { x: 50, y: height - 205, size: 11, font: font });

  // Subject (Bold and Underlined)
  const subjectText = `Subject: ${data.title}`;
  page.drawText(subjectText, {
    x: 50,
    y: height - 235,
    size: 12,
    font: boldFont,
  });
  const subjectWidth = boldFont.widthOfTextAtSize(subjectText, 12);
  page.drawLine({
    start: { x: 50, y: height - 238 },
    end: { x: 50 + subjectWidth, y: height - 238 },
    thickness: 1,
  });

  // Salutation
  page.drawText('Sir/Madam,', { x: 50, y: height - 265, size: 11, font: font });

  // Body Content (Times Roman for professional look)
  const bodyText = data.description || '';
  const bodyLines = wrapText(bodyText, 500, timesFont, 11);
  let currentY = height - 290;
  let currentPage = page;

  for (const line of bodyLines) {
    if (currentY < 120) {
      // Add new page
      currentPage = pdfDoc.addPage([600, 850]);
      currentY = 800; // Reset Y for new page
    }

    currentPage.drawText(line, {
      x: 50,
      y: currentY,
      size: 11,
      font: timesFont,
    });
    currentY -= 18;
  }

  // Footer / Student Info
  if (currentY < 150) {
    currentPage = pdfDoc.addPage([600, 850]);
    currentY = 800;
  } else {
    currentY -= 40; // Extra spacing before footer
  }

  currentPage.drawText('Yours faithfully,', { x: 50, y: currentY, size: 11, font: timesFont });
  currentY -= 35;
  currentPage.drawText(data.studentName, { x: 50, y: currentY, size: 11, font: timesBold });
  currentPage.drawText(`ID: ${data.studentId}`, { x: 50, y: currentY - 15, size: 11, font: timesFont });
  currentPage.drawText(`Dept. of CSE, SUST.`, { x: 50, y: currentY - 30, size: 11, font: timesFont });

  // Add a placeholder for digital signatures
  currentPage.drawLine({
    start: { x: 50, y: 80 },
    end: { x: width - 50, y: 80 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
    dashArray: [2, 2],
  });

  const signatureNote = 'Digital signatures will be appended here upon official approval.';
  const noteWidth = font.widthOfTextAtSize(signatureNote, 8);
  currentPage.drawText(signatureNote, {
    x: (width - noteWidth) / 2,
    y: 65,
    size: 8,
    font: font,
    color: rgb(0.6, 0.6, 0.6),
  });

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
