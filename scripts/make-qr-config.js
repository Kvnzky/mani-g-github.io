import fs from 'fs';

const gcashPath = 'public/images/gcash-qr.jpg';
const maribankPath = 'public/images/maribank-qr.png';

const gcashBuf = fs.readFileSync(gcashPath);
const maribankBuf = fs.readFileSync(maribankPath);

const gcashMime = gcashBuf.slice(0, 4).toString('hex') === '89504e47' ? 'image/png' : 'image/jpeg';
const maribankMime = maribankBuf.slice(0, 4).toString('hex') === '89504e47' ? 'image/png' : 'image/jpeg';

const gcashBase64 = `data:${gcashMime};base64,` + gcashBuf.toString('base64');
const maribankBase64 = `data:${maribankMime};base64,` + maribankBuf.toString('base64');

const code = `export const DEFAULT_GCASH_QR = ${JSON.stringify(gcashBase64)};
export const DEFAULT_MARIBANK_QR = ${JSON.stringify(maribankBase64)};
export const GCASH_NUMBER = "09055182263";
`;

fs.writeFileSync('src/config/qrConfig.js', code, 'utf8');
console.log('✅ src/config/qrConfig.js generated successfully!');
