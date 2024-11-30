export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  ENDPOINTS: {
    ITEMS: '/items',
    BOM: '/bom',
    PROCESSES: '/processes',
    PROCESS_STEPS: '/process-steps',
  },
  REVALIDATE_TIME: 60, // 60 seconds cache
}; 