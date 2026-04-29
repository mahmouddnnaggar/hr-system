const asyncHandler = require('../../utils/asyncHandler');
const { User } = require('../../models');

const login = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({
    where: { email },
    attributes: ['id', 'name', 'email', 'role']
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

module.exports = {
  login
};
