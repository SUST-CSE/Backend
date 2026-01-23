import { Tournament, PlayerShowcase } from './sports.schema';
import { uploadToCloudinary } from '../../utils/cloudinary.util';
import { NotFoundError } from '../../utils/errors';

// Tournaments
export const createTournament = async (data: any, files: Express.Multer.File[], userId: string) => {
  const images = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const { secure_url } = await uploadToCloudinary(file, 'sust-cse/sports/tournaments');
      images.push(secure_url);
    }
  }

  return await Tournament.create({
    ...data,
    images,
    createdBy: userId,
  });
};

export const getAllTournaments = async (query: any) => {
  const filter: any = { isDeleted: false };
  if (query.sportType) filter.sportType = query.sportType;
  if (query.status) filter.status = query.status;

  return await Tournament.find(filter)
    .sort({ startDate: -1 })
    .populate('createdBy', 'name email');
};

export const getTournamentById = async (id: string) => {
  const tournament = await Tournament.findById(id).populate('createdBy', 'name email');
  if (!tournament) throw new NotFoundError('Tournament not found');
  return tournament;
};

export const updateTournament = async (id: string, data: any, files: Express.Multer.File[] | undefined, userId: string) => {
  const tournament = await Tournament.findById(id);
  if (!tournament) throw new NotFoundError('Tournament not found');

  const updateData = { ...data };

  if (files && files.length > 0) {
    const images = [];
    for (const file of files) {
      const { secure_url } = await uploadToCloudinary(file, 'sust-cse/sports/tournaments');
      images.push(secure_url);
    }
    updateData.images = [...(tournament.images || []), ...images];
  }

  return await Tournament.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteTournament = async (id: string) => {
  const tournament = await Tournament.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!tournament) throw new NotFoundError('Tournament not found');
  return tournament;
};

// Player Showcase
export const createPlayerShowcase = async (data: any, file: Express.Multer.File, userId: string) => {
  const { secure_url } = await uploadToCloudinary(file, 'sust-cse/sports/players');
  
  return await PlayerShowcase.create({
    ...data,
    image: secure_url,
    createdBy: userId,
  });
};

export const getAllPlayerShowcases = async (query: any) => {
  const filter: any = { isDeleted: false };
  if (query.sportType) filter.sportType = query.sportType;
  if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured === 'true';

  return await PlayerShowcase.find(filter)
    .populate('user', 'name email studentId profileImage phone')
    .populate('createdBy', 'name email')
    .sort({ totalMatches: -1 });
};

export const updatePlayerShowcase = async (id: string, data: any, file?: Express.Multer.File) => {
  const updateData = { ...data };
  if (file) {
    const { secure_url } = await uploadToCloudinary(file, 'sust-cse/sports/players');
    updateData.image = secure_url;
  }

  const showcase = await PlayerShowcase.findByIdAndUpdate(id, updateData, { new: true });
  if (!showcase) throw new NotFoundError('Player showcase not found');
  return showcase;
};

export const deletePlayerShowcase = async (id: string) => {
  const showcase = await PlayerShowcase.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!showcase) throw new NotFoundError('Player showcase not found');
  return showcase;
};
