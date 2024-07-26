const bcrypt = require('bcrypt');
const db = require('../models');

exports.changePin = async (req, res) => {
  const { username, oldPin, newPin } = req.body;

  try {
    // Dapatkan user dari database
    const user = await db.User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Periksa PIN lama
    const isMatch = await bcrypt.compare(oldPin, user.pin);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old PIN is incorrect' });
    }

    // Hash PIN baru
    const hashedNewPin = await bcrypt.hash(newPin, 10);

    // Update PIN di database
    user.pin = hashedNewPin;
    await user.save();

    return res.status(200).json({ message: 'PIN changed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
