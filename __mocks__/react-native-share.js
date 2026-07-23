module.exports = {
  shareSingle: jest.fn(() => Promise.resolve({ success: true, message: '' })),
  open: jest.fn(() => Promise.resolve({ success: true, message: '' })),
  Social: {
    FACEBOOK: 'facebook',
    TWITTER: 'twitter',
    WHATSAPP: 'whatsapp',
    INSTAGRAM: 'instagram',
  },
};
