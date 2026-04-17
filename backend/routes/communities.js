const express = require('express');
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for saving files in memory buffer
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

/* ─────────────────────────────────────────────
   COMMUNITIES CORE ROUTES
   ───────────────────────────────────────────── */

// List ALL communities
router.get('/', async function (req, res, next) {
    try {
        const { data, error } = await supabase
            .from('communities')
            .select('*, community_members(user_id)')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        res.json({ success: true, count: data.length, communities: data });
    } catch (err) {
        next(err);
    }
});

// List JOINED communities
router.get('/joined', authMiddleware, async function (req, res, next) {
    try {
        const { data, error } = await supabase
            .from('community_members')
            .select('community_id, communities(*)')
            .eq('user_id', req.user.id);

        if (error) throw new Error(error.message);
        
        // Flatten the response
        const communities = data.map(item => item.communities);
        
        res.json({ success: true, count: communities.length, communities: communities });
    } catch (err) {
        next(err);
    }
});

// Get ONE community
router.get('/:id', authMiddleware, async function (req, res, next) {
    try {
        const { data, error } = await supabase
            .from('communities')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !data) return res.status(404).json({ success: false, message: 'Community not found' });
        res.json({ success: true, community: data });
    } catch (err) {
        next(err);
    }
});

// Create NEW community (with Image)
router.post('/', authMiddleware, upload.single('image'), async function (req, res, next) {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

        let imageUrl = null;

        // Image Upload Logic
        if (req.file) {
            if (req.file.size > 5 * 1024 * 1024) {
                return res.status(400).json({ success: false, message: 'Image size exceeds 5MB limit' });
            }

            const fileExt = req.file.originalname.split('.').pop();
            const fileName = `community_${req.user.id}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('community_images')
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

            if (uploadError) throw new Error("Image Upload Error: " + uploadError.message);

            const { data: publicURLData } = supabase.storage.from('community_images').getPublicUrl(fileName);
            imageUrl = publicURLData.publicUrl;
        }

        // 1. Insert Community
        const { data: commData, error: commError } = await supabase
            .from('communities')
            .insert([{ name, description: description || '', created_by: req.user.id, image_url: imageUrl }])
            .select();

        if (commError) throw new Error(commError.message);
        const communityId = commData[0].id;

        // 2. Add creator as 'admin' in members table
        const { error: memberError } = await supabase
            .from('community_members')
            .insert([{ community_id: communityId, user_id: req.user.id, role: 'admin' }]);
        
        if (memberError) throw new Error(memberError.message);

        // 3. Auto-generate default channels
        const { error: channelError } = await supabase
            .from('community_channels')
            .insert([
                { community_id: communityId, name: 'general-chat', type: 'text' },
                { community_id: communityId, name: 'Study Room 1', type: 'voice' }
            ]);

        if (channelError) throw new Error(channelError.message);

        res.status(201).json({ success: true, message: 'Community forged!', community: commData[0] });
    } catch (err) {
        next(err);
    }
});


// Join a community
router.post('/:id/join', authMiddleware, async function (req, res, next) {
    try {
        const communityId = req.params.id;
        const { data: existing } = await supabase
            .from('community_members')
            .select('id')
            .eq('community_id', communityId)
            .eq('user_id', req.user.id)
            .single();

        if (existing) return res.status(400).json({ success: false, message: 'Already a member' });

        const { error } = await supabase
            .from('community_members')
            .insert([{ community_id: communityId, user_id: req.user.id, role: 'member' }]);

        if (error) throw new Error(error.message);
        res.json({ success: true, message: 'Joined successfully!' });
    } catch (err) {
        next(err);
    }
});

// Leave a community
router.post('/:id/leave', authMiddleware, async function (req, res, next) {
    try {
        const { data, error } = await supabase
            .from('community_members')
            .delete()
            .eq('community_id', req.params.id)
            .eq('user_id', req.user.id)
            .select();

        if (error) throw new Error(error.message);
        if (!data || data.length === 0) return res.status(400).json({ success: false, message: 'Not a member' });
        
        res.json({ success: true, message: 'Left community' });
    } catch (err) {
        next(err);
    }
});

// Get Members directory (Mapped with users)
router.get('/:id/members', authMiddleware, async function (req, res, next) {
    try {
        const { data, error } = await supabase
            .from('community_members')
            .select('*, users(full_name, avatar_url)')
            .eq('community_id', req.params.id);

        if (error) throw new Error(error.message);
        res.json({ success: true, members: data });
    } catch (err) {
        next(err);
    }
});

/* ─────────────────────────────────────────────
   CHANNELS ROUTES (REST)
   ───────────────────────────────────────────── */

// Get all channels for a specific community
router.get('/:id/channels', authMiddleware, async function (req, res, next) {
    try {
        const { data, error } = await supabase
            .from('community_channels')
            .select('*')
            .eq('community_id', req.params.id)
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);
        res.json({ success: true, channels: data });
    } catch (err) {
        next(err);
    }
});

// Create a new channel (Admins only)
router.post('/:id/channels', authMiddleware, async function (req, res, next) {
    try {
        const { name, type } = req.body;
        const communityId = req.params.id;

        // Verify Admin Status
        const { data: memberData, error: memErr } = await supabase
            .from('community_members')
            .select('role')
            .eq('community_id', communityId)
            .eq('user_id', req.user.id)
            .single();

        if (memErr || !memberData || memberData.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only Admins can create channels!' });
        }

        const { data, error } = await supabase
            .from('community_channels')
            .insert([{ community_id: communityId, name, type: type || 'text' }])
            .select();

        if (error) throw new Error(error.message);
        res.status(201).json({ success: true, channel: data[0] });
    } catch(err) {
        next(err);
    }
});

// Delete a channel (Admins only)
router.delete('/:id/channels/:channelId', authMiddleware, async function (req, res, next) {
    try {
        const communityId = req.params.id;
        const channelId = req.params.channelId;

        // Verify Admin Status
        const { data: memberData } = await supabase
            .from('community_members')
            .select('role')
            .eq('community_id', communityId)
            .eq('user_id', req.user.id)
            .single();

        if (!memberData || memberData.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only Admins can delete channels!' });
        }

        const { error } = await supabase.from('community_channels').delete().eq('id', channelId);
        if (error) throw new Error(error.message);

        res.json({ success: true, message: 'Channel deleted' });
    } catch(err) {
        next(err);
    }
});

/* ─────────────────────────────────────────────
   MESSAGING ROUTES (REST)
   ───────────────────────────────────────────── */

// Get all messages inside a channel
router.get('/channels/:channelId/messages', authMiddleware, async function (req, res, next) {
    try {
        const channelId = req.params.channelId;
        const { data, error } = await supabase
            .from('channel_messages')
            // Embed the author's avatar & full_name instantly!
            .select('*, users(full_name, avatar_url)')
            .eq('channel_id', channelId)
            .order('created_at', { ascending: true }); // Historical (oldest first) so new messages appear at the bottom

        if (error) throw new Error(error.message);
        res.json({ success: true, messages: data });
    } catch(err) {
        next(err);
    }
});

// Post a chat message
router.post('/channels/:channelId/messages', authMiddleware, async function (req, res, next) {
    try {
        const channelId = req.params.channelId;
        const { content } = req.body;

        if (!content) return res.status(400).json({ success: false, message: 'No content provided' });

        const { data, error } = await supabase
            .from('channel_messages')
            .insert([{ channel_id: channelId, user_id: req.user.id, content }])
            .select('*, users(full_name, avatar_url)');

        if (error) throw new Error(error.message);
        
        const newMessage = data[0];

        // 🟢 REAL-TIME WEBSOCKET PUSH! 🟢
        // Broadcast the message instantly to any users actively looking at this specific channel!
        if (req.io) {
            req.io.to('channel_' + channelId).emit('new_message', newMessage);
        }

        res.status(201).json({ success: true, message: newMessage });
    } catch(err) {
        next(err);
    }
});


module.exports = router;
