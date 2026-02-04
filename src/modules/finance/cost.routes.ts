import express from 'express';
import { UserRole } from '../user/user.types';
import { UserPermission } from '../user/user.interface';
import { auth } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';
import * as CostController from './cost.controller';

const router = express.Router();

// Submit Cost Request
router.post(
  '/create',
  auth(
    [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT], 
    [UserPermission.SUBMIT_COST] // Requires specific permission
  ),
  upload.array('files', 5),
  CostController.createCostRequest
);

// Get My Requests
router.get(
  '/my-requests',
  auth(), // Any authenticated user
  CostController.getMyCostRequests
);

// Get Pending Approvals (For Approvers)
router.get(
  '/pending-approvals',
  auth(
    [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    [
      UserPermission.APPROVE_COST_L1, 
      UserPermission.APPROVE_COST_L2, 
      UserPermission.APPROVE_COST_FINAL
    ]
  ),
  CostController.getPendingApprovals
);

// Approve Request
router.post(
  '/approve/:id',
  auth(
    [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    [
      UserPermission.APPROVE_COST_L1, 
      UserPermission.APPROVE_COST_L2, 
      UserPermission.APPROVE_COST_FINAL
    ]
  ),
  CostController.approveCostRequest
);

// Reject Request
router.post(
  '/reject/:id',
  auth(
    [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
    [
      UserPermission.APPROVE_COST_L1, 
      UserPermission.APPROVE_COST_L2, 
      UserPermission.APPROVE_COST_FINAL
    ]
  ),
  CostController.rejectCostRequest
);

// Add Check Number (Final Admin step)
router.post(
  '/add-check/:id',
  auth(UserRole.ADMIN), // Or specific permission
  CostController.addCheckNumber
);

// Get All Costs (Admin view)
router.get(
  '/all',
  auth(UserRole.ADMIN),
  CostController.getAllCosts
);

// Test route
router.get('/test-sync', (req, res) => res.json({ message: 'Sync route testing active' }));

// Sync Approved Costs to Finance (Migration/Utility)
router.post(
  '/sync-finance',
  auth(UserRole.ADMIN),
  CostController.syncApprovedCosts
);

// export const CostRoutes = router; (already at bottom)
export const CostRoutes = router;
