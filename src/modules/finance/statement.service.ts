import { FinancialStatement } from './statement.schema';
import { IFinancialStatement } from './statement.interface';

export const createStatement = async (data: Partial<IFinancialStatement>) => {
  return await FinancialStatement.create(data);
};

export const getAllStatements = async (publishedOnly = false) => {
  const filter: any = {};
  if (publishedOnly) filter.isPublished = true;
  return await FinancialStatement.find(filter)
    .populate('uploadedBy', 'name email profileImage')
    .sort({ createdAt: -1 });
};

export const getStatementById = async (id: string) => {
  return await FinancialStatement.findById(id)
    .populate('uploadedBy', 'name email profileImage');
};

export const updateStatement = async (id: string, data: Partial<IFinancialStatement>) => {
  return await FinancialStatement.findByIdAndUpdate(id, data, { new: true });
};

export const deleteStatement = async (id: string) => {
  return await FinancialStatement.findByIdAndUpdate(id, { isDeleted: true });
};
