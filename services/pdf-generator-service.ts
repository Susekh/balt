'use server';

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const pdfGenerator = async (
  name: string,
  collegeName: string,
  branch: string,
) => {
  const cert1Path = path.resolve('./private_image/cert_page1.jpg');
  const cert2Path = path.resolve('./private_image/cert_page2.jpg');
  const image1Bytes = fs.readFileSync(cert1Path);
  const image2Bytes = fs.readFileSync(cert2Path);

  const resizedImage1 = await sharp(image1Bytes)
    .resize({ width: 1000 })
    .jpeg({ quality: 60 })
    .toBuffer();

  const resizedImage2 = await sharp(image2Bytes)
    .resize({ width: 1000 })
    .jpeg({ quality: 60 })
    .toBuffer();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([1000, 700]);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const nameWidth = font.widthOfTextAtSize(name, 16);
  const branchWidth = font.widthOfTextAtSize(branch, 16);
  const collegeWidth = font.widthOfTextAtSize(collegeName, 16);

  const nfs = 72 * 3.14;
  const nfw = 9.75 * 72;

  const bfs = 72 * 2.62;
  const bfw = 72 * 3.09;

  const cfs = 72 * 7.2;
  const cfw = 72 * 5.94;

  const nx = nfs + (nfw - nameWidth) / 2;
  const bx = bfs + (bfw - branchWidth) / 2;
  const cx = cfs + (cfw - collegeWidth) / 2;

  const jpgImage = await pdfDoc.embedJpg(resizedImage1);
  const jpgImage2 = await pdfDoc.embedJpg(resizedImage2);
  page.drawImage(jpgImage, {
    x: 0,
    y: 0,
    width: 1000,
    height: 700,
  });

  page.drawText(name, {
    x: nx,
    y: 350,
    size: 16,
    color: rgb(0, 0, 0),
    font,
  });

  page.drawText(collegeName, {
    x: cx,
    y: 305,
    size: 16,
    color: rgb(0, 0, 0),
    font,
  });

  page.drawText(branch, {
    x: bx,
    y: 305,
    size: 16,
    color: rgb(0, 0, 0),
    font,
  });

  const page2 = pdfDoc.addPage([1000, 700]);
  page2.drawImage(jpgImage2, {
    x: 0,
    y: 0,
    width: 1000,
    height: 700,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
