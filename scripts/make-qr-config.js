import fs from 'fs';

const gcashPath = 'public/images/gcash-qr.jpg';
const maribankPath = 'public/images/maribank-qr.png';

const gcashBase64 = 'data:image/jpeg;base64,' + fs.readFileSync(gcashPath).toString('base64');
const maribankBase64 = 'data:image/png;base64,' + fs.readFileSync(maribankPath).toString('base64');

const code = `export const DEFAULT_GCASH_QR = ${JSON.stringify(gcashBase64)};
export const DEFAULT_MARIBANK_QR = ${JSON.stringify(maribankBase64)};
export const GCASH_NUMBER = "09055182263";
`;

fs.writeFileSync('src/config/qrConfig.js', code, 'utf8');
console.log('✅ src/config/qrConfig.js generated successfully!');
