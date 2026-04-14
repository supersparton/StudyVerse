import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { io } from 'socket.io-client';

const API = import.meta.env.VITE_API_URL;
// Initialize WebSocket connection outside the component so it persists gracefully
const socket = io(API);

export default function CommunityInnerPage() {
    const { id: communityId } = useParams();
    const navigate = useNavigate();

    // ─── Global State ───
    const [community, setCommunity] = useState(null);
    const [members, setMembers] = useState([]);
    const [channels, setChannels] = useState([]);
    const [activeChannel, setActiveChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    
    // ─── UI State ───
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [creatingChannel, setCreatingChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    
    // Chat auto-scroll
    const messagesEndRef = useRef(null);

    // Get current user Profile from LocalStorage (to check Admin rights quickly, though backend enforces it)
    const currentUser = JSON.parse(localStorage.getItem('studyverse-user')) || {};

    const getToken = () => currentUser.token;

    // ─── Data Fetching ───
    useEffect(() => {
        loadCommunityData();
    }, [communityId]);

    useEffect(() => {
        // Setup WebSockets generic listener
        const handleNewMessage = (msg) => {
            // Append the new message instantly without making any fetch requests!
            setMessages(prev => {
                // simple duplicate check to prevent double-renders
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        };

        socket.on('new_message', handleNewMessage);
        
        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, []);

    // When active channel changes, switch messages and socket rooms!
    useEffect(() => {
        if (!activeChannel) return;
        
        // Tells the backend WebSocket server we are looking at this specific channel
        socket.emit('join_channel', activeChannel.id);
        
        // Grab historical messages from Database
        fetchMessages();
    }, [activeChannel]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function loadCommunityData() {
        try {
            const token = getToken();

            // Fetch Community Details
            const commRes = await fetch(`${API}/api/communities/${communityId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const commData = await commRes.json();
            if(!commData.success) return navigate('/communities'); // kick out if totally invalid
            
            setCommunity(commData.community);

            // Fetch Members
            const memRes = await fetch(`${API}/api/communities/${communityId}/members`, { headers: { 'Authorization': `Bearer ${token}` } });
            const memData = await memRes.json();
            if(memData.success) setMembers(memData.members);

            // Fetch Channels
            const chanRes = await fetch(`${API}/api/communities/${communityId}/channels`, { headers: { 'Authorization': `Bearer ${token}` } });
            const chanData = await chanRes.json();
            if(chanData.success) {
                setChannels(chanData.channels);
                if(chanData.channels.length > 0) setActiveChannel(chanData.channels[0]);
            }

        } catch (e) {
            console.error("Failed to load community.", e);
        } finally {
            setLoading(false);
        }
    }

    async function fetchMessages() {
        if(!activeChannel) return;
        try {
            const res = await fetch(`${API}/api/communities/channels/${activeChannel.id}/messages`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if(data.success) {
                // Only update state if length changed to prevent harsh re-renders (basic check)
                setMessages(prev => data.messages.length !== prev.length ? data.messages : prev);
            }
        } catch(e) {}
    }

    async function handleSendMessage(e) {
        e.preventDefault();
        if(!newMessage.trim()) return;

        try {
            const messageText = newMessage;
            setNewMessage(''); // Clear input immediately for UX

            await fetch(`${API}/api/communities/channels/${activeChannel.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ content: messageText })
            });
            
            // Notice: we DO NOT call fetchMessages() here.
            // The backend successfully pushes the new message via WebSocket, 
            // naturally triggering socket.on('new_message') above!
        } catch(e) {}
    }

    async function handleCreateChannel(e) {
        e.preventDefault();
        if(!newChannelName.trim()) return;

        try {
            const res = await fetch(`${API}/api/communities/${communityId}/channels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ name: newChannelName, type: 'text' })
            });
            const data = await res.json();
            if(data.success) {
                setChannels([...channels, data.channel]);
                setNewChannelName('');
                setCreatingChannel(false);
                setActiveChannel(data.channel);
            } else {
                alert(data.message);
            }
        } catch(e) {}
    }

    async function handleDeleteChannel(channelId, e) {
        e.stopPropagation(); // prevent setting active
        if(!window.confirm("Delete this channel forever?")) return;

        try {
            const res = await fetch(`${API}/api/communities/${communityId}/channels/${channelId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if(data.success) {
                setChannels(channels.filter(c => c.id !== channelId));
                if(activeChannel?.id === channelId) setActiveChannel(channels[0] || null);
            } else {
                alert(data.message);
            }
        } catch(e) {}
    }

    if (loading) return <DashboardLayout><div style={{padding:'40px',textAlign:'center'}}>Loading Community...</div></DashboardLayout>;
    
    // Authorization Check: Is user an admin?
    const myMemberRecord = members.find(m => m.user_id === currentUser.id);
    const isAdmin = myMemberRecord?.role === 'admin' || community?.created_by === currentUser.id;

    // Filter members based on Search
    const filteredMembers = members.filter(m => 
        m.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            {/* The Discord Layout Wrapper */}
            <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#F9FAFB' }}>
                
                {/* 1. LEFT SIDEBAR: CHANNELS */}
                <div style={{ width: '260px', background: '#F3F4F6', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
                    {/* Header: Community Banner & Name */}
                    <div style={{ 
                        padding: '24px 16px', 
                        borderBottom: '1px solid #E5E7EB', 
                        background: community?.image_url ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${community.image_url})` : '#4F46E5',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: 'white'
                    }}>
                        <h2 style={{ fontSize: '18px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{community?.name}</h2>
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>{community?.description}</span>
                    </div>

                    {/* Channels List */}
                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase' }}>Text Channels</span>
                            {isAdmin && (
                                <button className="icon-btn" style={{ width:'24px',height:'24px'}} onClick={() => setCreatingChannel(!creatingChannel)} title="Add Channel">
                                    <span className="material-symbols-outlined" style={{fontSize:'16px'}}>add</span>
                                </button>
                            )}
                        </div>
                        
                        {creatingChannel && (
                            <form onSubmit={handleCreateChannel} style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                                <input autoFocus type="text" placeholder="new-channel" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} style={{ flex: 1, padding: '4px 8px', fontSize: '13px', borderRadius: '4px', border: '1px solid #D1D5DB' }} />
                                <button type="submit" className="btn btn-primary" style={{ padding: '0 8px', minWidth: 'auto', height: 'auto' }}>✓</button>
                            </form>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {channels.filter(c => c.type === 'text').map(c => (
                                <div 
                                    key={c.id} 
                                    onClick={() => setActiveChannel(c)}
                                    style={{ 
                                        padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        background: activeChannel?.id === c.id ? '#E5E7EB' : 'transparent',
                                        color: activeChannel?.id === c.id ? '#111827' : '#4B5563',
                                        fontWeight: activeChannel?.id === c.id ? '600' : '500'
                                    }}
                                    onMouseEnter={(e) => { if(activeChannel?.id !== c.id) e.currentTarget.style.background = '#e5e7eb88'; }}
                                    onMouseLeave={(e) => { if(activeChannel?.id !== c.id) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px', opacity: 0.6 }}>tag</span>
                                        {c.name}
                                    </div>
                                    {isAdmin && activeChannel?.id !== c.id && (
                                        <button className="icon-btn" onClick={(e) => handleDeleteChannel(c.id, e)} style={{ width:'20px',height:'20px', background:'transparent' }}>
                                            <span className="material-symbols-outlined" style={{fontSize:'14px', color:'#ef4444'}}>delete</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Concept of Voice Rooms */}
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', marginTop: '24px', marginBottom: '12px' }}>Voice Rooms (Beta)</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {channels.filter(c => c.type === 'voice').map(c => (
                                <div key={c.id} style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF' }} title="Voice rooms are under development">
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>volume_up</span>
                                    {c.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. MAIN CENTER: CHAT INTERFACE */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
                    {/* Active Channel Header */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap:'8px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        <span className="material-symbols-outlined" style={{ color: '#9CA3AF' }}>tag</span>
                        <h3 style={{ margin: 0 }}>{activeChannel?.name || 'Welcome'}</h3>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {messages.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 'auto', marginBottom: 'auto' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.5, marginBottom: '16px' }}>forum</span>
                                <h2>Welcome to #{activeChannel?.name}!</h2>
                                <p>This is the start of the channel. Be the first to say hello!</p>
                            </div>
                        ) : (
                            messages.map((m, idx) => {
                                // Basic grouping logic to avoid repeating avatars if same user sends multiple messages
                                const isSequential = idx > 0 && messages[idx-1].user_id === m.user_id;

                                return (
                                    <div key={m.id} style={{ display: 'flex', gap: '16px', marginTop: isSequential ? '-12px' : '0' }}>
                                        {/* Avatar Column */}
                                        <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                                            {!isSequential && (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E0E7FF', overflow: 'hidden' }}>
                                                    {m.users?.avatar_url && m.users.avatar_url.startsWith('http') ? (
                                                        <img src={m.users.avatar_url} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                                    ) : (
                                                        <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>👨‍🎓</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Content Column */}
                                        <div style={{ flex: 1 }}>
                                            {!isSequential && (
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{m.users?.full_name || 'Unknown User'}</span>
                                                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{new Date(m.created_at).toLocaleString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                </div>
                                            )}
                                            <div style={{ color: '#374151', fontSize: '15px', lineHeight: '1.5' }}>
                                                {m.content}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} /> {/* Anchor for auto-scroll */}
                    </div>

                    {/* Chat Input Bar */}
                    <div style={{ padding: '0 24px 24px 24px' }}>
                        <form onSubmit={handleSendMessage} style={{ background: '#F3F4F6', borderRadius: '8px', display: 'flex', padding: '8px 16px', alignItems: 'center' }}>
                            <span className="material-symbols-outlined" style={{ color: '#9CA3AF', marginRight: '12px' }}>add_circle</span>
                            <input 
                                type="text" 
                                placeholder={`Message #${activeChannel?.name || 'channel'}`}
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '15px', padding: '8px 0' }}
                                disabled={!activeChannel}
                            />
                            <button type="submit" disabled={!newMessage.trim()} style={{ background: 'transparent', border: 'none', cursor: newMessage.trim() ? 'pointer' : 'default' }}>
                                <span className="material-symbols-outlined" style={{ color: newMessage.trim() ? '#4F46E5' : '#D1D5DB' }}>send</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* 3. RIGHT SIDEBAR: MEMBER DIRECTORY */}
                <div style={{ width: '260px', background: '#F9FAFB', borderLeft: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
                     {/* Search Bar */}
                    <div style={{ padding: '24px 16px', borderBottom: '1px solid #E5E7EB' }}>
                        <div className="search-bar" style={{ background: 'white', padding: '8px 12px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                            <input type="text" placeholder="Search members" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ fontSize: '13px' }}/>
                        </div>
                    </div>
                    
                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                        {/* Member Role Grouping (Admin vs Standard) */}
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', marginBottom: '12px' }}>
                            Admins — {filteredMembers.filter(m => m.role === 'admin' || community?.created_by === m.user_id).length}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                            {filteredMembers.filter(m => m.role === 'admin' || community?.created_by === m.user_id).map(m => (
                                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='#F3F4F6'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                                    <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#E0E7FF', overflow: 'hidden' }}>
                                            {m.users?.avatar_url && m.users.avatar_url.startsWith('http') ? <img src={m.users.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>👨‍🎓</div>}
                                        </div>
                                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', border: '2px solid white' }}></div>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#4F46E5' }}>{m.users?.full_name}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', marginBottom: '12px' }}>
                            Students — {filteredMembers.filter(m => m.role !== 'admin' && community?.created_by !== m.user_id).length}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {filteredMembers.filter(m => m.role !== 'admin' && community?.created_by !== m.user_id).map(m => (
                                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='#F3F4F6'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                                    <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#E0E7FF', overflow: 'hidden' }}>
                                            {m.users?.avatar_url && m.users.avatar_url.startsWith('http') ? <img src={m.users.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>👨‍🎓</div>}
                                        </div>
                                        {/* Status Dot */}
                                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#9CA3AF', border: '2px solid white' }}></div>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>{m.users?.full_name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
