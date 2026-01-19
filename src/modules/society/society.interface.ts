import { Types } from 'mongoose';
import { MemberDesignation, SocietyCategory } from './society.types';

export interface ISociety {
  _id: Types.ObjectId;
  name: string;
  description: string;
  logo: string;
  foundedDate: Date;
  category: SocietyCategory;
  socialLinks: {
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
  createdBy: Types.ObjectId;
  isDeleted: boolean;
}

export interface ISocietyMember {
  _id: Types.ObjectId;
  society: Types.ObjectId;
  user: Types.ObjectId;
  designation: MemberDesignation;
  tenureStart: Date;
  tenureEnd?: Date;
  isCurrent: boolean;
  session: string;
  achievements: string[];
  image?: string; // Optional custom image for the member
  createdBy: Types.ObjectId;
  isDeleted: boolean;
}
