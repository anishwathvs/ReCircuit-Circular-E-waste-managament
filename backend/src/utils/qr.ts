import QRCode from 'qrcode';

export const generateProductQR = async (
  productId: string,
  customId: string,
  clientUrl: string = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173'
) => {
  const passportUrl = `${clientUrl}/passport/${customId}`;
  
  const qrSvg = await QRCode.toString(passportUrl, {
    type: 'svg',
    color: {
      dark: '#084D36', // Forest green QR modules matching design!
      light: '#FFFFFF'
    },
    margin: 2,
    width: 280
  });

  const qrDataUrl = await QRCode.toDataURL(passportUrl, {
    color: {
      dark: '#084D36',
      light: '#FFFFFF'
    },
    margin: 2,
    width: 400
  });

  return { passportUrl, qrSvg, qrDataUrl };
};

