import { withAuth } from 'next-auth/middleware';

export default withAuth({
	callbacks: {
		authorized: ({ token }) => !!token,
	},
});

export const config = {
	// ONLY protect these specific dashboard routes.
	// This explicitly leaves the Home Page (/) and API routes alone.
	matcher: [
		'/admin/:path*',
		'/worker/:path*',
		'/supervisor/:path*',
		'/client/:path*',
	],
};
