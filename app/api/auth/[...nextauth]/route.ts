import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
	// REMOVE adapter temporarily to test if the 500 persists.
	// If the 500 stops, the issue is the PrismaAdapter connection string.
	adapter: PrismaAdapter(prisma) as any,
	providers: [
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null;

				try {
					const user = await prisma.user.findUnique({
						where: { email: credentials.email },
					});

					if (!user || !user.password) return null;

					const isValid = await bcrypt.compare(
						credentials.password,
						user.password,
					);
					if (!isValid) return null;

					return {
						id: user.id,
						name: user.name,
						email: user.email,
						role: user.role,
					};
				} catch (error) {
					console.error('AUTH_DB_ERROR:', error);
					return null;
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.role = (user as any).role;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				(session.user as any).id = token.id;
				(session.user as any).role = token.role;
			}
			return session;
		},
	},
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/login',
	},
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
