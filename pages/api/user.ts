import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import User from '../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const { username } = req.query;
        if (!username) {
          return res.status(400).json({ success: false, error: 'Username required' });
        }
        
        let user = await User.findOne({ username });
        
        if (!user) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.status(200).json({ success: true, data: user });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
      
    case 'POST':
      try {
        const { username, role } = req.body;
        let user = await User.findOne({ username });
        
        if (user) {
          // If login, just return the user
          res.status(200).json({ success: true, data: user });
        } else {
          // If signup, create user
          user = await User.create({
            username,
            role: role || 'student',
            xp: 0,
            level: 1,
            streak: 1
          });
          res.status(201).json({ success: true, data: user });
        }
      } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
      }
      break;
      
    case 'PUT':
      try {
        const { username, xpToAdd } = req.body;
        
        const user = await User.findOne({ username });
        if (!user) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        const newXp = user.xp + (xpToAdd || 0);
        const newLevel = Math.floor(newXp / 100) + 1;
        
        user.xp = newXp;
        user.level = newLevel;
        await user.save();
        
        res.status(200).json({ success: true, data: user });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
