const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    upvoterIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isAnswered: {
      type: Boolean,
      default: false,
    },
    answer: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
