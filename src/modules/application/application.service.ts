import { Application } from './application.schema';
import { IApplication } from './application.interface';
import { ApplicationStatus } from './application.types';
import { sendEmail } from '../../utils/email.util';
import { AppError } from '../../utils/errors';
import { User } from '../user/user.schema';
import { generateApplicationPDF, addSignatureToPDF } from '../../utils/pdf.util';
import { uploadBufferToCloudinary } from '../../utils/cloudinary.util';
import axios from 'axios';

export const submitApplication = async (data: Partial<IApplication>) => {
  let signedPdfUrl = data.signedPdfUrl;

  // If text-based submission, generate the initial PDF
  if (data.submissionMode === 'TEXT' && data.textContent) {
    const student = await User.findById(data.submittedBy);
    if (!student) throw new AppError('Student not found', 404);

    const pdfBuffer = await generateApplicationPDF({
      title: data.title!,
      description: data.textContent,
      studentName: student.name,
      studentId: student.studentId || 'N/A',
      email: student.email,
      date: new Date(),
    });

    const uploadResult = await uploadBufferToCloudinary(
      Buffer.from(pdfBuffer),
      'sust-cse/applications',
      'application/pdf',
      `${data.title?.replace(/\s+/g, '_')}_application.pdf`
    );
    signedPdfUrl = uploadResult.secure_url;
  } else if (data.submissionMode === 'PDF' && data.attachments?.length) {
    // For PDF uploads, the first attachment is the main document to be signed
    signedPdfUrl = data.attachments[0];
  }

  return await Application.create({
    ...data,
    signedPdfUrl,
    status: ApplicationStatus.PENDING_L0
  });
};

export const getMyApplications = async (userId: string) => {
  return await Application.find({ submittedBy: userId, isDeleted: false })
    .populate('medium', 'name designation signatureUrl')
    .populate('to', 'name designation signatureUrl')
    .populate('l0Reviewer', 'name')
    .sort({ createdAt: -1 });
};

export const getAllApplications = async (query: any = {}, user?: any) => {
  const filter: any = { ...query, isDeleted: false };

  // Parse comma-separated status values into $in query
  if (filter.status && typeof filter.status === 'string' && filter.status.includes(',')) {
    filter.status = { $in: filter.status.split(',').map((s: string) => s.trim()) };
  }

  if (user && user.role !== 'ADMIN' && !user.permissions?.includes('MANAGE_APPLICATIONS')) {
    const orConditions: any[] = [
      { l0Reviewer: user._id },
      { medium: user._id },
      { to: user._id },
      { 'approvalTrail.l0.reviewer': user._id },
      { 'approvalTrail.l1.reviewer': user._id },
      { 'approvalTrail.l2.reviewer': user._id }
    ];

    if (user.permissions?.includes('APPROVE_APPLICATION_L0')) {
      orConditions.push({ status: ApplicationStatus.PENDING_L0 });
    }
    if (user.permissions?.includes('APPROVE_APPLICATION_L1')) {
      orConditions.push({ status: ApplicationStatus.PENDING_L1 });
    }
    if (user.permissions?.includes('APPROVE_APPLICATION_L2')) {
      orConditions.push({ status: ApplicationStatus.PENDING_L2 });
    }

    if (orConditions.length > 0) {
        filter.$or = orConditions;
    }
  }

  return await Application.find(filter)
    .populate('submittedBy', 'name studentId email profileImage')
    .populate('medium', 'name designation')
    .populate('to', 'name designation')
    .populate('l0Reviewer', 'name')
    .sort({ createdAt: -1 });
};

export const getApplicationById = async (idOrCode: string) => {
  const query = idOrCode.startsWith('APP-') 
    ? { uniqueCode: idOrCode } 
    : { _id: idOrCode };

  const result = await Application.findOne(query)
    .populate('submittedBy', 'name studentId email profileImage')
    .populate('medium', 'name designation signatureUrl')
    .populate('to', 'name designation signatureUrl')
    .populate('l0Reviewer', 'name email profileImage')
    .populate('approvalTrail.l0.reviewer', 'name')
    .populate('approvalTrail.l1.reviewer', 'name')
    .populate('approvalTrail.l2.reviewer', 'name');
    
  if (!result) throw new AppError('Application not found', 404);
  return result;
};

// Unique code generator: APP-YYYYMMDD-XXXX
const generateUniqueCode = async () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Application.countDocuments({ uniqueCode: { $regex: `^APP-${date}` } });
  const serial = (count + 1).toString().padStart(4, '0');
  return `APP-${date}-${serial}`;
};

export const approveApplicationStage = async (
  id: string, 
  stage: 'l0' | 'l1' | 'l2', 
  reviewerId: string, 
  status: 'APPROVED' | 'REJECTED', 
  feedback?: string
) => {
  const application = await Application.findById(id).populate('submittedBy', 'name email');
  if (!application) throw new AppError('Application not found', 404);

  const reviewer = await User.findById(reviewerId);
  if (!reviewer) throw new AppError('Reviewer not found', 404);

  if (status === 'REJECTED') {
    application.status = ApplicationStatus.REJECTED;
    application.feedback = feedback;
  } else {
    // Stage-specific logic
    if (stage === 'l0') {
      application.approvalTrail.l0 = { status: 'APPROVED', date: new Date(), reviewer: reviewer._id as any, feedback };
      application.status = ApplicationStatus.PENDING_L1;
    } else if (stage === 'l1') {
      if (!reviewer.signatureUrl) throw new AppError('Please set your digital signature in profile before approving', 400);
      
      // Update trail
      application.approvalTrail.l1 = { 
        status: 'APPROVED', 
        date: new Date(), 
        reviewer: reviewer._id as any, 
        signatureUrl: reviewer.signatureUrl, 
        feedback 
      };

      // Embed signature into PDF
      if (!application.signedPdfUrl && application.attachments?.length) {
        application.signedPdfUrl = application.attachments[0];
        console.log('🔄 Fallback: Using attachments[0] as signedPdfUrl');
      }

      if (application.signedPdfUrl) {
        try {
          console.log(`🎬 Attempting to embed L1 signature into: ${application.signedPdfUrl}`);
          const pdfResponse = await axios.get(application.signedPdfUrl, { responseType: 'arraybuffer' });
          console.log(`✅ Downloaded PDF: ${pdfResponse.data.byteLength} bytes`);
          
          const signedBuffer = await addSignatureToPDF(
            Buffer.from(pdfResponse.data),
            {
              url: reviewer.signatureUrl,
              name: reviewer.name,
              designation: reviewer.designation || 'Faculty Member',
              date: new Date()
            },
            'l1'
          );
          console.log(`✅ Signature embedded locally, new buffer size: ${signedBuffer.length} bytes`);

          const uploadResult = await uploadBufferToCloudinary(
            Buffer.from(signedBuffer),
            'sust-cse/applications/signed',
            'application/pdf',
            `signed_l1_${application._id}.pdf`
          );
          application.signedPdfUrl = uploadResult.secure_url;
          console.log(`🚀 Uploaded signed PDF to Cloudinary: ${application.signedPdfUrl}`);
        } catch (error: any) {
          console.error('❌ Error embedding L1 signature:', error.message);
          if (error.response) console.error('Response data:', error.response.data);
        }
      }

      application.status = ApplicationStatus.PENDING_L2;
    } else if (stage === 'l2') {
      if (!reviewer.signatureUrl) throw new AppError('Please set your digital signature in profile before approving', 400);
      
      application.approvalTrail.l2 = { 
        status: 'APPROVED', 
        date: new Date(), 
        reviewer: reviewer._id as any, 
        signatureUrl: reviewer.signatureUrl, 
        feedback 
      };

      // Embed L2 signature into PDF
      if (!application.signedPdfUrl && application.attachments?.length) {
        application.signedPdfUrl = application.attachments[0];
        console.log('🔄 Fallback: Using attachments[0] as signedPdfUrl (L2)');
      }

      if (application.signedPdfUrl) {
        try {
          console.log(`🎬 Attempting to embed L2 signature into: ${application.signedPdfUrl}`);
          const pdfResponse = await axios.get(application.signedPdfUrl, { responseType: 'arraybuffer' });
          console.log(`✅ Downloaded PDF: ${pdfResponse.data.byteLength} bytes`);

          const signedBuffer = await addSignatureToPDF(
            Buffer.from(pdfResponse.data),
            {
              url: reviewer.signatureUrl,
              name: reviewer.name,
              designation: reviewer.designation || 'Head of Department',
              date: new Date()
            },
            'l2'
          );
          console.log(`✅ Signature embedded locally, new buffer size: ${signedBuffer.length} bytes`);

          const uploadResult = await uploadBufferToCloudinary(
            Buffer.from(signedBuffer),
            'sust-cse/applications/signed',
            'application/pdf',
            `signed_l2_${application._id}.pdf`
          );
          application.signedPdfUrl = uploadResult.secure_url;
          console.log(`🚀 Uploaded signed PDF to Cloudinary: ${application.signedPdfUrl}`);
        } catch (error: any) {
          console.error('❌ Error embedding L2 signature:', error.message);
        }
      }

      application.status = ApplicationStatus.APPROVED;
      application.uniqueCode = await generateUniqueCode();
    }
  }

  await application.save();

  // Notify Student
  if (application.submittedBy) {
    const user = application.submittedBy as any;
    await sendEmail({
      to: user.email,
      subject: `Application Update: ${application.title}`,
      type: 'APPLICATION_STATUS',
      html: `Your application "${application.title}" is now ${application.status}. ${application.uniqueCode ? `Verification Code: ${application.uniqueCode}` : ''}`,
    });
  }

  return application;
};

// Legacy support or fallback
export const updateApplicationStatus = async (id: string, updates: { status?: ApplicationStatus; feedback?: string; l0Reviewer?: string; medium?: string; to?: string }) => {
  const application = await Application.findById(id);
  if (!application) throw new AppError('Application not found', 404);

  if (updates.status) application.status = updates.status;
  if (updates.feedback) application.feedback = updates.feedback;
  
  if (updates.l0Reviewer) application.l0Reviewer = updates.l0Reviewer as any;
  if (updates.medium) application.medium = updates.medium as any;
  if (updates.to) application.to = updates.to as any;

  return await application.save();
};
