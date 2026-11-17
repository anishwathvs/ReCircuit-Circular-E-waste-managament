import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/db.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { Role } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { sendTransactionalEmail } from '../services/email.service.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'USER', phone, address, city } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const parsedRole = (role.toUpperCase() in Role) ? (role.toUpperCase() as Role) : Role.USER;
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: parsedRole,
        phone,
        address,
        city: city || 'Chennai',
        isEmailVerified: false,
        emailVerifyToken: verificationToken,
        tokenVersion: 0,
      },
    });

    // If agent or retailer, create profile
    if (parsedRole === Role.AGENT) {
      await prisma.agent.create({
        data: {
          userId: user.id,
          employeeId: `RC-AGT-${Math.floor(100 + Math.random() * 900)}`,
          serviceArea: city || 'Chennai Central',
        },
      });
    } else if (parsedRole === Role.RETAILER) {
      await prisma.retailer.create({
        data: {
          userId: user.id,
          businessName: `${name} Retail`,
          city: city || 'Chennai',
        },
      });
    }

    // Send transactional verification email
    await sendTransactionalEmail({
      to: user.email,
      subject: '[ReCircuit] Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5EBE5; border-radius: 12px; background-color: #F8FAF7;">
          <div style="background-color: #084D36; padding: 16px 20px; border-radius: 8px 8px 0 0; color: #FFFFFF;">
            <h2 style="margin: 0; font-size: 20px;">Welcome to ReCircuit!</h2>
          </div>
          <div style="padding: 24px; background-color: #FFFFFF; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; color: #151A17;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 14px; color: #6B756E; line-height: 1.5;">
              Thank you for registering on ReCircuit — the transparent e-waste management and circular electronics platform.
              Please confirm your email address by clicking the button below:
            </p>
            <div style="margin: 25px 0;">
              <a href="http://localhost:5173/verify-email?token=${verificationToken}" 
                 style="display: inline-block; padding: 12px 24px; background-color: #084D36; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
                Verify Email Address
              </a>
            </div>
            <p style="font-size: 12px; color: #8F9A92;">Or copy this link into your browser: http://localhost:5173/verify-email?token=${verificationToken}</p>
          </div>
        </div>
      `,
    });

    const payload = { userId: user.id, email: user.email, role: user.role, name: user.name, tokenVersion: user.tokenVersion };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.status(201).json({
      message: 'User registered successfully. Verification email sent.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
      verificationToken, // surfaced in response for testing/development inspection
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        agentProfile: true,
        retailerProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const payload = { userId: user.id, email: user.email, role: user.role, name: user.name, tokenVersion: user.tokenVersion };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        agentProfile: user.agentProfile,
        retailerProfile: user.retailerProfile,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = (req.body.token || req.query.token) as string;
    if (!token) {
      res.status(400).json({ message: 'Verification token is required' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired verification token' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
      },
    });

    res.json({
      message: 'Email successfully verified. Your account is fully active.',
      email: user.email,
    });
  } catch (error: any) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // To prevent user enumeration attacks, respond with generic success even if user not found
    if (!user) {
      res.json({ message: 'If an account exists with this email, password reset instructions have been dispatched.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: resetToken },
    });

    await sendTransactionalEmail({
      to: user.email,
      subject: '[ReCircuit] Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5EBE5; border-radius: 12px; background-color: #F8FAF7;">
          <div style="background-color: #084D36; padding: 16px 20px; border-radius: 8px 8px 0 0; color: #FFFFFF;">
            <h2 style="margin: 0; font-size: 20px;">ReCircuit — Password Reset</h2>
          </div>
          <div style="padding: 24px; background-color: #FFFFFF; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; color: #151A17;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 14px; color: #6B756E; line-height: 1.5;">
              We received a request to reset your password. Click the secure link below to set a new password:
            </p>
            <div style="margin: 25px 0;">
              <a href="http://localhost:5173/reset-password?token=${resetToken}" 
                 style="display: inline-block; padding: 12px 24px; background-color: #084D36; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 12px; color: #8F9A92;">If you did not request this, please safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    res.json({
      message: 'If an account exists with this email, password reset instructions have been dispatched.',
      resetToken, // surfaced in response for testing/development inspection
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing password reset', error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token and newPassword are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { passwordResetToken: token },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired password reset token' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Invalidate reset token and increment tokenVersion to revoke any existing refresh tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        tokenVersion: { increment: 1 },
      },
    });

    res.json({ message: 'Password successfully reset. You may now log in with your new password.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

// Demo quick-login: guarded in production mode
export const demoLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    // Guard demo login in production environments
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_LOGIN !== 'true') {
      res.status(403).json({
        message: 'Demo login shortcuts are disabled in production environment. Use standard credentials.',
      });
      return;
    }

    const { role = 'USER' } = req.body;
    const targetRole = (role.toUpperCase() in Role) ? (role.toUpperCase() as Role) : Role.USER;

    const user = await prisma.user.findFirst({
      where: { role: targetRole },
      include: {
        agentProfile: true,
        retailerProfile: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!user) {
      res.status(404).json({ message: `No demo account found for role ${targetRole}. Please run seeds.` });
      return;
    }

    const payload = { userId: user.id, email: user.email, role: user.role, name: user.name, tokenVersion: user.tokenVersion };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.json({
      message: `Signed in as Demo ${targetRole}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        agentProfile: user.agentProfile,
        retailerProfile: user.retailerProfile,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('Demo login error:', error);
    res.status(500).json({ message: 'Error during demo login', error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        agentProfile: true,
        retailerProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        isEmailVerified: user.isEmailVerified,
        agentProfile: user.agentProfile,
        retailerProfile: user.retailerProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

// Refresh token with rotation and session revocation support
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res.status(400).json({ message: 'Refresh token is required' });
      return;
    }

    const decoded = verifyRefreshToken(token);

    // Verify token version against database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(403).json({ message: 'User not found' });
      return;
    }

    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
      res.status(403).json({ message: 'Refresh token has been revoked or rotated. Please log in again.' });
      return;
    }

    // Increment tokenVersion for strict rotation
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { tokenVersion: { increment: 1 } },
    });

    const payload = {
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
      tokenVersion: updatedUser.tokenVersion,
    };
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { name, phone, address, city, pincode, currentPassword, newPassword } = req.body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (phone) dataToUpdate.phone = phone;
    if (address) dataToUpdate.address = address;
    if (city) dataToUpdate.city = city;
    if (pincode) dataToUpdate.pincode = pincode;

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ message: 'Current password is required to set new password' });
        return;
      }
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        res.status(400).json({ message: 'Current password is incorrect' });
        return;
      }
      dataToUpdate.password = await bcrypt.hash(newPassword, 10);
      dataToUpdate.tokenVersion = { increment: 1 };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true, phone: true, address: true, city: true, pincode: true },
    });

    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};
