import { CostRequest } from './cost.schema';
import { ICostRequest, CostStatus } from './cost.interface';
import { UserPermission } from '../user/user.interface';
import { AppError } from '../../utils/errors';
import { uploadToCloudinary } from '../../utils/cloudinary.util';
import { Transaction } from './finance.schema';
import { TransactionType, TransactionCategory } from './finance.types';

export const createCostRequest = async (
  data: Partial<ICostRequest>, 
  files: Express.Multer.File[], 
  userId: string
) => {
  const attachmentUrls: string[] = [];
  
  // Upload files if any
  if (files && files.length > 0) {
    for (const file of files) {
      const { secure_url } = await uploadToCloudinary(file, 'sust-cse/finance/costs');
      attachmentUrls.push(secure_url);
    }
  }
  
  const costRequest = await CostRequest.create({
    ...data,
    attachments: attachmentUrls,
    createdBy: userId,
    status: CostStatus.PENDING
  });
  
  return costRequest;
};

export const getMyCostRequests = async (userId: string) => {
  return await CostRequest.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email designation')
    .populate('approvedByL1.approvedBy', 'name')
    .populate('approvedByL2.approvedBy', 'name')
    .populate('approvedByFinal.approvedBy', 'name');
};

export const getPendingApprovals = async (permission: string) => {
  let statusFilter;
  
  if (permission === UserPermission.APPROVE_COST_L1) {
    statusFilter = CostStatus.PENDING;
  } else if (permission === UserPermission.APPROVE_COST_L2) {
    statusFilter = CostStatus.APPROVED_L1;
  } else if (permission === UserPermission.APPROVE_COST_FINAL) {
    statusFilter = CostStatus.APPROVED_L2;
  } else {
    return [];
  }
  
  return await CostRequest.find({ status: statusFilter })
    .sort({ createdAt: 1 })
    .populate('createdBy', 'name email designation')
    .populate('approvedByL1.approvedBy', 'name')
    .populate('approvedByL2.approvedBy', 'name');
};

export const getAllCosts = async () => {
  return await CostRequest.find()
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email')
    .populate('approvedByL1.approvedBy', 'name')
    .populate('approvedByL2.approvedBy', 'name')
    .populate('approvedByFinal.approvedBy', 'name');
};

export const approveCostRequest = async (
  id: string, 
  userId: string, 
  userPermissions: string[],
  comment?: string
) => {
  const costRequest = await CostRequest.findById(id);
  if (!costRequest) {
    throw new AppError('Cost request not found', 404);
  }
  
  if (costRequest.status === CostStatus.PENDING && userPermissions.includes(UserPermission.APPROVE_COST_L1)) {
    costRequest.status = CostStatus.APPROVED_L1;
    costRequest.approvedByL1 = { approvedBy: userId as any, approvedAt: new Date(), comment };
  } else if (costRequest.status === CostStatus.APPROVED_L1 && userPermissions.includes(UserPermission.APPROVE_COST_L2)) {
    costRequest.status = CostStatus.APPROVED_L2;
    costRequest.approvedByL2 = { approvedBy: userId as any, approvedAt: new Date(), comment };
  } else if (costRequest.status === CostStatus.APPROVED_L2 && userPermissions.includes(UserPermission.APPROVE_COST_FINAL)) {
    costRequest.status = CostStatus.APPROVED_FINAL;
    costRequest.approvedByFinal = { approvedBy: userId as any, approvedAt: new Date(), comment };

  } else {
    throw new AppError('Invalid approval attempt or insufficient permissions', 400);
  }
  
  await costRequest.save();
  return costRequest;
};

export const rejectCostRequest = async (id: string, userId: string, reason: string) => {
  const costRequest = await CostRequest.findById(id);
  if (!costRequest) {
    throw new AppError('Cost request not found', 404);
  }
  
  costRequest.status = CostStatus.REJECTED;
  costRequest.rejectedBy = {
    user: userId as any,
    rejectedAt: new Date(),
    reason
  };
  
  await costRequest.save();
  return costRequest;
};

export const addCheckNumber = async (id: string, checkNumber: string, userId: string) => {
  const costRequest = await CostRequest.findById(id);
  if (!costRequest) {
    throw new AppError('Cost request not found', 404);
  }
  
  if (costRequest.status !== CostStatus.APPROVED_FINAL) {
    throw new AppError('Cost request must be fully approved to add check number', 400);
  }
  
  costRequest.checkNumber = checkNumber;
  costRequest.checkDate = new Date();
  
  await costRequest.save();

  // AUTO-CREATE FINANCE TRANSACTION WHEN CHECK NUMBER IS ADDED
  const populated = await costRequest.populate('createdBy', 'name');
  console.log(`[Finance Sync] Creating transaction for cost: ${costRequest.title} (${costRequest.amount} BDT)`);
  
  await Transaction.create({
    title: `[Cost Request] ${costRequest.title}`,
    amount: costRequest.amount,
    type: TransactionType.EXPENSE,
    category: TransactionCategory.COST_MANAGEMENT,
    description: `Approved cost request by ${(populated.createdBy as any).name}: ${costRequest.description} (Check No: ${checkNumber})`,
    date: new Date(),
    addedBy: userId,
    proofUrls: costRequest.attachments || [],
  });

  return costRequest;
};

export const syncApprovedCostsToFinance = async (userId: string) => {
  const approvedCosts = await CostRequest.find({
    status: CostStatus.APPROVED_FINAL,
    checkNumber: { $exists: true, $ne: '' }
  });

  let syncedCount = 0;
  for (const cost of approvedCosts) {
    const existing = await Transaction.findOne({
      title: `[Cost Request] ${cost.title}`,
      amount: cost.amount,
      category: TransactionCategory.COST_MANAGEMENT
    });

    if (!existing) {
      const populatedCost = await cost.populate('createdBy', 'name');
      await Transaction.create({
        title: `[Cost Request] ${cost.title}`,
        amount: cost.amount,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.COST_MANAGEMENT,
        description: `Synced approved cost request by ${(populatedCost.createdBy as any).name}: ${cost.description} (Check No: ${cost.checkNumber})`,
        date: cost.checkDate || new Date(),
        addedBy: userId,
        proofUrls: cost.attachments || [],
      });
      syncedCount++;
    }
  }

  return { syncedCount };
};
