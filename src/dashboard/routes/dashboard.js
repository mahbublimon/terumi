const express = require('express');
const path = require('path');
const axios = require('axios');
const router = express.Router();
const { client } = require('../../../bot'); // Assuming bot.js is in the parent directory

// Redirect users to Discord OAuth2 login
router.get('/auth/discord', (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify guilds`;

  res.redirect(discordAuthUrl);
});

// Discord OAuth2 callback route
router.get('/auth/discord/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.REDIRECT_URI,
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = tokenResponse.data;

    // Fetch user info from Discord API
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const user = userResponse.data;
    req.session.user = user; // Store user data in session

    res.redirect('/dashboard'); // Redirect to dashboard after login
  } catch (error) {
    console.error('Error during Discord OAuth2 callback:', error.message);
    res.status(500).send('Authentication failed');
  }
});

// Logout route
router.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Failed to log out');
    res.redirect('/');
  });
});

// API route for fetching Shard and Status Information
router.get('/bot-status', async (req, res) => {
  // Only allow bot owner to access this page
  const botOwnerID = process.env.BOT_OWNER_ID; // Store your Discord ID in the .env file
  if (req.session.user.id !== botOwnerID) return res.status(403).send('Access denied');

  try {
    const shards = client.ws.shards.map(shard => ({
      id: shard.id,
      status: shard.status,
      ping: shard.ping,
    }));

    res.json({
      shards,
      isOnline: client.ws.status === 0 ? 'Online' : 'Offline',
    });
  } catch (error) {
    console.error('Error fetching bot status:', error);
    res.status(500).json({ message: 'Failed to fetch bot status' });
  }
});

module.exports = router;
