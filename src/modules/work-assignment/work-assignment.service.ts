import { WorkAssignment } from './work-assignment.schema';
import { IWorkAssignment } from './work-assignment.interface';
import { WorkStatus, WorkVisibility } from './work-assignment.types';
import { User } from '../user/user.schema';
import { sendEmail } from '../../utils/email.util';
import { AppError } from '../../utils/errors';
import { Types } from 'mongoose';
import { validateAssignmentHierarchy } from '../../utils/hierarchy.util';
import { UserRole } from '../user/user.types';

export const createWorkAssignment = async (data: Partial<IWorkAssignment>, assignerRole?: string) => {
  // If not global admin, validate hierarchy
  if (assignerRole !== UserRole.ADMIN && data.assignedBy && data.assignedTo && data.society) {
    await validateAssignmentHierarchy(
      data.assignedBy.toString(),
      data.assignedTo.toString(),
      data.society.toString()
    );
  }

  const assignment = await WorkAssignment.create(data);

  // Populate user and society for email
  const populated = await WorkAssignment.findById(assignment._id)
    .populate('assignedTo', 'name email')
    .populate('assignedBy', 'name')
    .populate('society', 'name');

  if (populated && populated.assignedTo) {
    const user = populated.assignedTo as any;
    const author = populated.assignedBy as any;
    const society = populated.society as any;

    await sendEmail({
      to: user.email,
      subject: `New Work Assigned: ${populated.title}`,
      type: 'WORK_ASSIGNMENT',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-bottom: 16px;">New Task Assigned</h2>
          <p style="color: #475569; font-size: 16px; line-height: 24px;">
            Hello <strong>${user.name}</strong>,
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 24px;">
            You have been assigned a new task in <strong>${society.name}</strong> by ${author.name}.
          </p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; font-weight: 700; color: #0f172a;">${populated.title}</p>
            <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">${populated.description}</p>
            <p style="margin: 16px 0 0; font-size: 14px; color: #dc2626;"><strong>Deadline:</strong> ${new Date(populated.deadline).toLocaleDateString()}</p>
          </div>
          <p style="color: #475569; font-size: 14px;">
            Please log in to your dashboard to view more details and update progress.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            SUST CSE Department Dashboard
          </p>
        </div>
      `,
    });
  }

  return populated;
};

export const getMyAssignments = async (userId: string) => {
  return await WorkAssignment.find({ assignedTo: userId, isDeleted: false })
    .populate('assignedBy', 'name profileImage')
    .populate('society', 'name logo')
    .sort({ deadline: 1 });
};

export const getAllAssignments = async (filter: any = {}) => {
  return await WorkAssignment.find({ ...filter, isDeleted: false })
    .populate('assignedTo', 'name profileImage studentId')
    .populate('assignedBy', 'name')
    .populate('society', 'name')
    .sort({ createdAt: -1 });
};

export const updateAssignmentStatus = async (id: string, status: WorkStatus, feedback?: string) => {
  const update: any = { status };
  if (feedback) update.feedback = feedback;

  const result = await WorkAssignment.findByIdAndUpdate(id, update, { new: true });
  if (!result) throw new AppError('Assignment not found', 404);
  return result;
};

export const getAssignmentsForSociety = async (societyId: string, userId: string, isAdmin: boolean) => {
  const query: any = { society: societyId, isDeleted: false };

  if (!isAdmin) {
    // If not admin, see own assignments OR public ones
    query.$or = [
      { assignedTo: userId },
      { visibility: WorkVisibility.PUBLIC_TO_SOCIETY }
    ];
  }

  return await WorkAssignment.find(query)
    .populate('assignedTo', 'name profileImage studentId')
    .populate('assignedBy', 'name')
    .sort({ deadline: 1 });
};

export const updateAssignment = async (id: string, data: any) => {
  const assignment = await WorkAssignment.findByIdAndUpdate(id, data, { new: true })
    .populate('assignedTo', 'name email')
    .populate('assignedBy', 'name')
    .populate('society', 'name');

  if (!assignment) throw new AppError('Assignment not found', 404);

  // Send Email Notification
  const user = assignment.assignedTo as any;
  const author = assignment.assignedBy as any;
  const society = assignment.society as any;

  if (user && user.email) {
    await sendEmail({
      to: user.email,
      subject: `Work Assignment Updated: ${assignment.title}`,
      type: 'WORK_UPDATE',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-bottom: 16px;">Task Updated</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>The task <strong>${assignment.title}</strong> has been updated by ${author?.name || 'Admin'}.</p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p><strong>Description:</strong> ${assignment.description}</p>
            <p><strong>Deadline:</strong> ${new Date(assignment.deadline).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${assignment.status}</p>
          </div>
          <p>Please check your dashboard for details.</p>
        </div>
      `,
    });
  }

  return assignment;
};

export const deleteAssignment = async (id: string) => {
  const assignment = await WorkAssignment.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!assignment) throw new AppError('Assignment not found', 404);
  return assignment;
};
