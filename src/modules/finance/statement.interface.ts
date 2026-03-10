import { Types } from 'mongoose';

export interface IFinancialStatement {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  fiscalYear: string; // e.g. "2023-2024"
  statementType: string; // BANK_STATEMENT, AUDIT_REPORT, BALANCE_SHEET, CUSTOM
  documentUrls: string[];
  uploadedBy: Types.ObjectId;
  isPublished: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum StatementType {
  BANK_STATEMENT = 'BANK_STATEMENT',
  AUDIT_REPORT = 'AUDIT_REPORT',
  BALANCE_SHEET = 'BALANCE_SHEET',
  INCOME_STATEMENT = 'INCOME_STATEMENT',
  CUSTOM = 'CUSTOM',
}
