const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema(
  {
    requestedItem: {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      image: String,
    },
    offeredItem: {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      name: String,
      price: {
        type: Number,
        min: 0,
      },
      image: String,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tradeType: {
      type: String,
      required: true,
      enum: ['BarterOnly', 'MoneyOnly', 'BarterPlusMoney'],
    },
    moneyAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    offeringValue: {
      type: Number,
      required: true,
      min: 0,
    },
    requestingValue: {
      type: Number,
      required: true,
      min: 0,
    },
    valueDifference: {
      type: Number,
    },
    fairnessScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    needsReview: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedDate: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedDate: Date,
    rejectionReason: String,
    completedDate: Date,
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
tradeSchema.index({ buyer: 1, status: 1 });
tradeSchema.index({ seller: 1, status: 1 });
tradeSchema.index({ status: 1, needsReview: 1 });
tradeSchema.index({ createdAt: -1 });

// Calculate fairness percentage before validation
tradeSchema.pre('validate', function (next) {
  // Always calculate these values
  this.valueDifference = this.offeringValue - this.requestingValue;
  
  const diffPercentage = this.requestingValue > 0 
    ? Math.abs((this.valueDifference / this.requestingValue) * 100) 
    : 0;
  
  this.fairnessScore = Math.max(0, 100 - diffPercentage);
  this.needsReview = diffPercentage > 30;
  
  next();
});

module.exports = mongoose.model('Trade', tradeSchema);
