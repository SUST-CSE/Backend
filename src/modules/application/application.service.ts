import { Application } from './application.schema';
import { IApplication } from './application.interface';
import { ApplicationStatus } from './application.types';
import { sendEmail } from '../../utils/email.util';
import { AppError } from '../../utils/errors';

export const submitApplication = async (data: Partial<IApplication>) => {
  return await Application.create(data);
};

export const getMyApplications = async (userId: string) => {
  return await Application.find({ submittedBy: userId, isDeleted: false })
    .sort({ createdAt: -1 });
};

export const getAllApplications = async (filter: any = {}) => {
  return await Application.find({ ...filter, isDeleted: false })
    .populate('submittedBy', 'name studentId email profileImage')
    .sort({ createdAt: -1 });
};

export const getApplicationById = async (id: string) => {
  const result = await Application.findById(id).populate('submittedBy', 'name studentId email');
  if (!result) throw new AppError('Application not found', 404);
  return result;
};

export const updateApplicationStatus = async (id: string, status: ApplicationStatus, feedback?: string) => {
  const application = await Application.findById(id).populate('submittedBy', 'name email');
  if (!application) throw new AppError('Application not found', 404);

  application.status = status;
  if (feedback) application.feedback = feedback;
  await application.save();

  // Send Email Notification
  if (application.submittedBy) {
    const user = application.submittedBy as any;
    const color = status === ApplicationStatus.APPROVED ? '#16a34a' : '#dc2626';

    await sendEmail({
      to: user.email,
      subject: `Application ${status}: ${application.title}`,
      type: 'APPLICATION_STATUS',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-bottom: 16px;">Application Update</h2>
          <p style="color: #475569; font-size: 16px; line-height: 24px;">
            Hello <strong>${user.name}</strong>,
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 24px;">
            Your application "<strong>${application.title}</strong>" has been <span style="color: ${color}; font-weight: 700;">${status}</span> by the department administration.
          </p>
          ${feedback ? `
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #cbd5e1;">
            <p style="margin: 0; font-weight: 700; color: #0f172a;">Admin Feedback:</p>
            <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">${feedback}</p>
          </div>
          ` : ''}
          <p style="color: #475569; font-size: 14px; margin-top: 24px;">
            Please log in to your dashboard to view the full details of your application.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            SUST CSE Department Dashboard
          </p>
        </div>
      `,
    });
  }

  return application;
};
