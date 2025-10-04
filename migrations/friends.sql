-- Friend Request and Friendship Tables Migration

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sender_id, receiver_id)
);

-- Create indexes for friend_requests
CREATE INDEX IF NOT EXISTS friend_requests_receiver_status_idx ON friend_requests(receiver_id, status);
CREATE INDEX IF NOT EXISTS friend_requests_sender_idx ON friend_requests(sender_id);

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

-- Create index for friendships
CREATE INDEX IF NOT EXISTS friendships_user_idx ON friendships(user_id);
CREATE INDEX IF NOT EXISTS friendships_friend_idx ON friendships(friend_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on friend_requests
CREATE TRIGGER update_friend_requests_updated_at BEFORE UPDATE ON friend_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

