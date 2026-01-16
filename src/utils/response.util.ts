export const successResponse = <T>(
  res: any,
  data: T,
  message: string = 'Operation successful',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const paginatedResponse = <T>(
  res: any,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Data fetched successfully'
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};
