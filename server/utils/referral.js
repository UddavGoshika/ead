const User = require('../models/User');

const generateReferralCode = async () => {
    let code;
    let exists = true;
    while (exists) {
        const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
        code = `LEX-${randomStr}`;
        const existing = await User.findOne({ myReferralCode: code });
        if (!existing) exists = false;
    }
    return code;
};

module.exports = { generateReferralCode };
