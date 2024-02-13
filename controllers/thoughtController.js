const { Thought, User } = require('../models');

const handleResponse = async (promise, res) => {
  try {
    const data = await promise;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

const thoughtController = {
  async createThought(req, res) {
    try {
      const thoughtData = await Thought.create(req.body);

      const userData = await User.findOneAndUpdate(
        { _id: req.body.userId },
        { $push: { thoughts: thoughtData._id } },
        { new: true }
      );

      if (!userData) {
        return res.status(404).json({ message: 'no user with this id, the thought is in thin air' });
      }

      res.json({ message: 'Thought created' });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  async updateThought(req, res) {
    const { thoughtId } = req.params;
    handleResponse(
      Thought.findOneAndUpdate({ _id: thoughtId }, { $set: req.body }, { runValidators: true, new: true }),
      res
    );
  },

  async getThoughts(req, res) {
    handleResponse(Thought.find().sort({ createdAt: -1 }), res);
  },

  async getOneThought(req, res) {
    const { thoughtId } = req.params;
    handleResponse(Thought.findOne({ _id: thoughtId }), res);
  },

  async deleteThought(req, res) {
    const { thoughtId } = req.params;
    const thoughtData = await Thought.findOneAndDelete({ _id: thoughtId });

    if (!thoughtData) {
      return res.status(404).json({ message: 'No thoughts, no thinking here' });
    }
    const userData = await User.findOneAndUpdate(
      { thoughts: thoughtId },
      { $pull: { thoughts: thoughtId } },
      { new: true }
    );
    handleResponse(userData, res);
  },

  async addReaction(req, res) {
    const { thoughtId } = req.params;
    handleResponse(
      Thought.findOneAndUpdate(
        { _id: thoughtId },
        { $addToSet: { reactions: req.body } },
        { runValidators: true, new: true }
      ),
      res
    );
  },

  async removeReaction(req, res) {
    const { thoughtId, reactionId } = req.params;
    handleResponse(
      Thought.findOneAndUpdate(
        { _id: thoughtId },
        { $pull: { reactions: { reactionId } } },
        { runValidators: true, new: true }
      ),
      res
    );
  },
};

module.exports = thoughtController;
