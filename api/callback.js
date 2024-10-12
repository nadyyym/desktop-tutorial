import { supabase } from '../../utils/supabaseClient';
import axios from 'axios';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    // Exchange the authorization code for an access token
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });

    const {
      access_token,
      refresh_token,
      expires_at,
      athlete,
    } = response.data;

    // Store tokens and user info in Supabase
    const { data, error } = await supabase.from('users').upsert({
      id: athlete.id.toString(), // Use Strava athlete ID as the user ID
      strava_user_id: athlete.id,
      access_token,
      refresh_token,
      token_expires_at: new Date(expires_at * 1000).toISOString(),
      full_name: `${athlete.firstname} ${athlete.lastname}`,
      profile_picture_url: athlete.profile,
      // Include other fields as needed
    });

    if (error) {
      console.error('Error inserting user:', error);
      return res.status(500).send('Error saving user data');
    }

    // Redirect the user to the dashboard or desired page
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).send('Error during OAuth process');
  }
}