import { Schema, model } from 'mongoose';
import { IFinancialStatement, StatementType } from './statement.interface';

const financialStatementSchema = new Schema<IFinancialStatement>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    fiscalYear: { type: String, required: true, trim: true },
    statementType: {
      type: String,
      enum: Object.values(StatementType),
      required: true,
    },
    documentUrls: [{ type: String, required: true }],
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

financialStatementSchema.pre(/^find/, function (next) {
  (this as any).find({ isDeleted: { $ne: true } });
  next();
});

export const FinancialStatement = model<IFinancialStatement>('FinancialStatement', financialStatementSchema as any);
