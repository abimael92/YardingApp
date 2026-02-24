import { withAuth } from 'next-auth/middleware';

export default withAuth({
    callbacks: {
        authorized: ({ token }) => !!token,
    },
});

export const config = {
    /*
     * Match only the protected folders.
     * This prevents the middleware from running on / (home),
     * login, and all static assets.
     */
    matcher: [
        '/admin/:path*',
        '/worker/:path*',
        '/supervisor/:path*',
        '/client/:path*',
    ],
};