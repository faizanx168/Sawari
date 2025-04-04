/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import { z } from 'zod';
import prisma  from '@repo/db';
import { authOptions } from '@/app/utils/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler; 