import { MemberDesignation } from '../modules/society/society.types';
import { SocietyMember } from '../modules/society/society.schema';
import { AppError } from './errors';

const DesignationRank: Record<MemberDesignation, number> = {
  [MemberDesignation.PRESIDENT]: 100,
  [MemberDesignation.VICE_PRESIDENT]: 90,
  [MemberDesignation.GENERAL_SECRETARY]: 90,
  [MemberDesignation.SPORTS_SECRETARY]: 80,
  [MemberDesignation.ORGANIZING_SECRETARY]: 80,
  [MemberDesignation.PUBLICATION_SECRETARY]: 80,
  [MemberDesignation.ASSISTANT_ORGANIZING_SECRETARY]: 80,
  [MemberDesignation.EXECUTIVE_MEMBER]: 10,
};

/**
 * Validates if the assigner has a higher rank than the assignee within a specific society.
 * @param assignerId ID of the user assigning the work
 * @param assigneeId ID of the user being assigned the work
 * @param societyId ID of the society context
 * @throws AppError if hierarchy is violated or members not found
 */
export const validateAssignmentHierarchy = async (
  assignerId: string,
  assigneeId: string,
  societyId: string
): Promise<void> => {
  const [assigner, assignee] = await Promise.all([
    SocietyMember.findOne({ user: assignerId, society: societyId, isCurrent: true }),
    SocietyMember.findOne({ user: assigneeId, society: societyId, isCurrent: true }),
  ]);

  if (!assigner) {
    throw new AppError('Assigner is not a current member of this society', 403);
  }

  if (!assignee) {
    throw new AppError('Assignee is not a current member of this society', 400);
  }

  const assignerRank = DesignationRank[assigner.designation] || 0;
  const assigneeRank = DesignationRank[assignee.designation] || 0;

  if (assignerRank <= assigneeRank) {
    throw new AppError(
      `Hierarchy Violation: A ${assigner.designation} cannot assign work to a ${assignee.designation}`,
      403
    );
  }
};
