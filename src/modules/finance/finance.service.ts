import { Transaction } from './finance.schema';
import { ITransaction } from './finance.interface';
import { TransactionType } from './finance.types';
import { AppError } from '../../utils/errors';

export const addTransaction = async (data: Partial<ITransaction>) => {
  return await Transaction.create(data);
};

export const getTransactions = async (filter: any = {}) => {
  return await Transaction.find({ ...filter, isDeleted: false })
    .populate('addedBy', 'name email profileImage')
    .populate({
      path: 'relatedCostRequest',
      populate: [
        { path: 'createdBy', select: 'name email designation avatar' },
        { path: 'approvedByL1.approvedBy', select: 'name' },
        { path: 'approvedByL2.approvedBy', select: 'name' },
        { path: 'approvedByFinal.approvedBy', select: 'name' }
      ]
    })
    .sort({ date: -1 });
};

export const getFinancialSummary = async () => {
  const transactions = await Transaction.find({ isDeleted: false });
  
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryBreakdown: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((tx) => {
    if (!categoryBreakdown[tx.category]) {
      categoryBreakdown[tx.category] = { income: 0, expense: 0 };
    }

    if (tx.type === TransactionType.INCOME) {
      totalIncome += tx.amount;
      categoryBreakdown[tx.category].income += tx.amount;
    } else {
      totalExpense += tx.amount;
      categoryBreakdown[tx.category].expense += tx.amount;
    }
  });

  const balance = totalIncome - totalExpense;

  // Monthly summary (current month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyTX = transactions.filter(tx => tx.date >= startOfMonth);
  let monthlyIncome = 0;
  let monthlyExpense = 0;

  monthlyTX.forEach(tx => {
    if (tx.type === TransactionType.INCOME) monthlyIncome += tx.amount;
    else monthlyExpense += tx.amount;
  });

  return {
    totalIncome,
    totalExpense,
    balance,
    monthlyIncome,
    monthlyExpense,
    categoryBreakdown,
  };
};

export const deleteTransaction = async (id: string) => {
  const result = await Transaction.findByIdAndUpdate(id, { isDeleted: true });
  if (!result) throw new AppError('Transaction not found', 404);
  return result;
};
