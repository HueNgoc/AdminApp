import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { strToU8, zipSync } from 'fflate';

const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const spreadsheetFiles = {
  '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
  '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
  'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Người dùng" sheetId="1" r:id="rId1"/></sheets></workbook>`,
  'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
};

function xmlEscape(value) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function toBase64(bytes) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const hasSecond = index + 1 < bytes.length;
    const hasThird = index + 2 < bytes.length;
    const second = hasSecond ? bytes[index + 1] : 0;
    const third = hasThird ? bytes[index + 2] : 0;
    output += alphabet[first >> 2];
    output += alphabet[((first & 3) << 4) | (second >> 4)];
    output += hasSecond ? alphabet[((second & 15) << 2) | (third >> 6)] : '=';
    output += hasThird ? alphabet[third & 63] : '=';
  }
  return output;
}

function makeWorkbook(users) {
  const rows = [
    ['Họ và tên', 'Email', 'Đường dẫn ảnh'],
    ...users.map((user) => [user.name || '', user.email || '', user.image || '']),
  ];
  const columnNames = ['A', 'B', 'C'];
  const sheetRows = rows.map((row, rowIndex) => {
    const rowNumber = rowIndex + 1;
    const cells = row.map((value, columnIndex) => {
      const cellRef = `${columnNames[columnIndex]}${rowNumber}`;
      return `<c r="${cellRef}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
    }).join('');
    return `<row r="${rowNumber}">${cells}</row>`;
  }).join('');
  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`;
  const files = { ...spreadsheetFiles, 'xl/worksheets/sheet1.xml': strToU8(worksheet) };
  return zipSync(Object.fromEntries(Object.entries(files).map(([name, content]) => [name, typeof content === 'string' ? strToU8(content) : content])));
}

export async function exportUsersToExcel(users) {
  const bytes = makeWorkbook(users);
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `danh-sach-nguoi-dung-${date}.xlsx`;

  if (Platform.OS === 'web') {
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return;
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Chức năng chia sẻ tệp không khả dụng trên thiết bị này.');
  }
  const base64 = toBase64(bytes);
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  await Sharing.shareAsync(fileUri, { mimeType, dialogTitle: 'Xuất danh sách người dùng' });
}
