import Purchase from '../models/Purchase.js';

export const getMyPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases
    });
  } catch {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases
    });
  } catch {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
