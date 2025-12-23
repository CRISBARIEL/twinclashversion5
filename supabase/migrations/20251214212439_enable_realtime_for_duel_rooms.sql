/*
  # Enable Realtime for Duel Rooms

  1. Purpose
    - Enable Realtime publication for duel_rooms table
    - This allows real-time updates and broadcast channels to work properly
    
  2. Changes
    - Add duel_rooms to supabase_realtime publication
    
  3. Why This Matters
    - Without Realtime enabled, channels and subscriptions won't work in production
    - This is critical for the dueling functionality to work properly
*/

-- Enable Realtime for duel_rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE duel_rooms;
