const { User, Thought } = require('../models');

const handleResponse = async (promise, res) => {
  try {
    const data = await promise;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

const userController = {
  async createUser(req, res) {
    handleResponse(User.create(req.body), res);
  },

  async updateUser(req, res) {
    const { userId } = req.params;
    handleResponse(
      User.findOneAndUpdate({ _id: userId }, { $set: req.body }, { runValidators: true, new: true }),
      res
    );
  },

  async getAllUsers(req, res) {
    handleResponse(User.find(), res);
  },

  async getOneUser(req, res) {
    const { userId } = req.params;
    handleResponse(
      User.findOne({ _id: userId }).populate('friends').populate('thoughts'),
      res
    );
  },

  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
  
      // Step 1: Find the user's thoughts
      const userData = await User.findOne({ _id: userId });
      if (!userData) {
        return res.status(404).json({ message: 'no user found' });
      }
  
      const userThoughts = userData.thoughts;
  
      // Step 2: Delete the user and their thoughts
      await User.deleteOne({ _id: userId });
      await Thought.deleteMany({ _id: { $in: userThoughts } });
  
      // Step 3: Send response
      res.json({ message: 'user and baggage deleted, like they were never here' });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  async addFriend(req, res) {
    const { userId, friendId } = req.params;
    handleResponse(User.findOneAndUpdate({ _id: userId }, { $addToSet: { friends: friendId } }, { new: true }), res);
  },

  async removeFriend(req, res) {
    const { userId, friendId } = req.params;
    handleResponse(User.findOneAndUpdate({ _id: userId }, { $pull: { friends: friendId } }, { new: true }), res);
  },
};

module.exports = userController;
