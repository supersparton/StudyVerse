/* ============================================================
   STUDYVERSE — Communities Page (CommunitiesPage.jsx)
   ============================================================
   Shows study communities that students can explore and join.
   Now includes a Discord-like inner view when a community is opened.
   
   REACT CONCEPTS:
   - useState for active community and settings modal
   ============================================================ */

import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';

function CommunitiesPage() {
    // State to toggle between Explore Data (null) and Inner Discord View (community object)
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState('overview');

    // ─── Chat Data State ───
    const [messages, setMessages] = useState([
        { id: 1, author: 'Alex Student', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB64GHbvy-PzYwINkrXjcZMERp_jy83KwV5j6NTQJkoP7oqCMgprEMUJrrWC7xmsZURFi0A2P9JG1Y8Z_QqwfIcd12HZo9IXLjP3nRUVk89Dj1NaXOxR_g7jYuyOqcwzXBbCHnTW2WKaQW3bA2rTbut0ZjGe7TGyW1y79-ErKFSejyqpwIa41mif4cXA45DEBZEMjGnlLwMHXVBttS1RUUxGn9exdAa7Kw1l9kqE4S4R3pWOMfWJy1vOJl89lS-h3G1VE6L5qX7H4fW', time: 'Today at 10:14 AM', text: 'Hey everyone! Does anyone have notes for yesterday\'s lecture?' },
        { id: 2, author: 'Prof. Davis', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3_SNJi9MVBcw1dUDt8UpLhYc1P9OnCpT1oyrIdGJ1jmD8lign-5v1UvIpTRygbLoiOpvsxJiUTkWHj91Q0bztMmo84mlRWYp2SHfFBIuIDh3REEf-T59c7ncUoYTRLPII_hy0MFjW-2IiFUkNOKv_893gOeSJv7l-meEnvBR-e_NP7Rx6HkXCCkQTSMHyK6QT-fVfUnqlEtbzyczR91e_YR_PCWMZfsFGtVsIQDTctN1ToVeGIqvGk3_wkE4omfGKJOVbxNQZhAr', time: 'Today at 10:16 AM', text: 'I\'ll be uploading the slides to the #resources channel shortly.', role: 'Admin', roleColor: 'admin-color' },
        { id: 3, author: 'StudyBot', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4qny9mgkNlfbxHyNGYnT3elppFd5-kLzLlhWTmpUDNJ3I_5Yib6i1juazQUqGi25052ChwWd8DrwXmexkntL2mdgTugmFUqNwzEy-itWzlHsnKAh85bOYXt1iN7BnbkSYBsj7a-GaWf40WQ4IGA6VFTIlsvwzcSOatYaVJWtbD03dJjgnp6P8kR2BbwBfsokMVdNZ5A_xZSRg6SQo8R08agheOk9WrWVyQ0gE_IJpfLpHdc136w_4RGLiykYslkbBqCm3pqah6OVT', time: 'Today at 10:17 AM', text: 'Hello! I can help answer course questions. Try asking me something like \"@StudyBot explain thermodynamics\".', isBot: true }
    ]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);

    // ─── Input Attachments & Emojis ───
    const fileInputRef = useRef(null);
    const [attachment, setAttachment] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Hardcoded simple emoji list for demo
    const emojis = ['😀', '😂', '🔥', '👍', '🙏', '💯', '🤔', '🚀', '📌', '🎉'];

    // ─── Roles Data State for Settings ───
    const [roles, setRoles] = useState([
        { id: 'admin', name: 'Admin', desc: 'Can manage channels, roles, and kick members.', enabled: true, permissions: ['Manage Server', 'Manage Roles', 'Create Bots', 'Kick Users', 'Ban Users'] },
        { id: 'moderator', name: 'Moderator', desc: 'Can delete messages and mute users.', enabled: true, permissions: ['Manage Messages', 'Kick Users'] },
        { id: 'noob', name: 'Noob (Default)', desc: 'Default role for newly joined members.', enabled: true, permissions: ['Send Messages'] },
    ]);
    // Expanded permission list available to assign
    const allPermissions = ['Manage Server', 'Manage Roles', 'Create Bots', 'Manage Messages', 'Kick Users', 'Ban Users', 'Send Messages'];

    // ─── Requests Data State ───
    const [joinRequests, setJoinRequests] = useState([
        { id: 101, name: 'Jordan Lee', handle: '@jordan_l', msg: 'I am a CS major looking to practice DSA.' },
        { id: 102, name: 'Casey Smith', handle: '@casey_12', msg: 'Heard great things about this group!' }
    ]);

    // ─── Bots Data State ───
    const [customBots, setCustomBots] = useState([]);
    const [editingBotId, setEditingBotId] = useState(null);

    // ─── Search State ───
    const [searchQuery, setSearchQuery] = useState('');
    const [searchScope, setSearchScope] = useState('local'); // 'local' or 'global'
    const [showSearchResults, setShowSearchResults] = useState(false);

    // ─── Members Data State (For Settings) ───
    const [settingsMembers, setSettingsMembers] = useState([
        { id: 201, name: 'Alex Student', role: 'noob', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB64GHbvy-PzYwINkrXjcZMERp_jy83KwV5j6NTQJkoP7oqCMgprEMUJrrWC7xmsZURFi0A2P9JG1Y8Z_QqwfIcd12HZo9IXLjP3nRUVk89Dj1NaXOxR_g7jYuyOqcwzXBbCHnTW2WKaQW3bA2rTbut0ZjGe7TGyW1y79-ErKFSejyqpwIa41mif4cXA45DEBZEMjGnlLwMHXVBttS1RUUxGn9exdAa7Kw1l9kqE4S4R3pWOMfWJy1vOJl89lS-h3G1VE6L5qX7H4fW' },
        { id: 202, name: 'Sarah Chen', role: 'moderator', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFgIDVq7-Cp7xewVFhDKb8rp7dNL39seoy2wtua9zI8zHGYonjhtSdgLHJ8oXWrUKoe_ZeBTYSZeFkzJukI7A9uvFk-lh4tscjDvTEpIAC39_uftElnvD37jAx_O-dfticIsyu8PQ9p2N6YiRJtm2gKsuYV1we28_30g5ThtfSlz3DqBjKisyBmfvLBgGLMqpsAi8z_MKCjIcKYjTCS5Mdu3qxzvWPguCb962aXnFi3sTA_eNLdUAZ_36tj2WzA8UO4KVnf0JwXaDH' },
        { id: 203, name: 'Prof. Davis', role: 'admin', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3_SNJi9MVBcw1dUDt8UpLhYc1P9OnCpT1oyrIdGJ1jmD8lign-5v1UvIpTRygbLoiOpvsxJiUTkWHj91Q0bztMmo84mlRWYp2SHfFBIuIDh3REEf-T59c7ncUoYTRLPII_hy0MFjW-2IiFUkNOKv_893gOeSJv7l-meEnvBR-e_NP7Rx6HkXCCkQTSMHyK6QT-fVfUnqlEtbzyczR91e_YR_PCWMZfsFGtVsIQDTctN1ToVeGIqvGk3_wkE4omfGKJOVbxNQZhAr' },
        { id: 204, name: 'Mark J.', role: 'noob', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwXDG_Sg5M9ku6EZXkI87YVP2V_aVAaW85dd2ZHqQeGPVtYRtIW5J2O4VaCKQPtnwmBwSwLLAkpOHIv7LBdl3RWhmJbLJJAcxzGo7fcnc4_bvvWAQwdXVvUdhHmBROcgq3bc9-WU0Okj6Fc0ms354Y5DbYb0ipC_2BumHscTMOU4-JaJyKt2MH3JtvMvH0ewLiQwgef8b1t3hhk4DF167wYGZlI8Gd7VyRArbGX2fugQVEX-rY6s_Cr9rNhTRiZQ63isJnc3txds1H' },
    ]);
    const [memberSearch, setMemberSearch] = useState('');

    // ─── Communities Data ───
    const [communities, setCommunities] = useState([
        { id: 1, name: 'DSA Warriors', desc: 'Master Data Structures & Algorithms with daily challenges, discussions, and peer code reviews.', members: '2.1K', coverColor: '#6366f1', icon: 'code', joined: false },
        { id: 2, name: 'Late Night Coders', desc: 'For the night owls. Code, debug, and collaborate in late-night sessions.', members: '942', coverColor: '#10b981', icon: 'terminal', joined: true },
        { id: 3, name: 'AI & ML Hub', desc: 'Explore machine learning, deep learning, and AI projects. Share datasets and models.', members: '1.5K', coverColor: '#8b5cf6', icon: 'smart_toy', joined: false },
        { id: 4, name: 'Physics 101', desc: 'Mechanics, optics, thermodynamics — discuss concepts and solve problems together.', members: '654', coverColor: '#f59e0b', icon: 'science', joined: false },
        { id: 5, name: 'Web Dev Pro', desc: 'HTML, CSS, JavaScript, React, Node.js — build projects and share your portfolio.', members: '1.8K', coverColor: '#ec4899', icon: 'language', joined: true },
        { id: 6, name: 'Math Champions', desc: 'Calculus, Linear Algebra, Probability — tackle problem sets and share solutions.', members: '876', coverColor: '#06b6d4', icon: 'calculate', joined: false },
    ]);

    // Scroll to bottom when new messages are added
    useEffect(() => {
        if (selectedCommunity && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, selectedCommunity, attachment]);

    // Explore Grid: Toggle join
    function toggleJoin(e, communityId) {
        e.stopPropagation(); // Stop click from opening community
        setCommunities(communities.map(c => c.id === communityId ? { ...c, joined: !c.joined } : c));
    }

    // Handles submitting a new message
    function handleSendMessage(e) {
        e.preventDefault();
        if (!chatInput.trim() && !attachment) return;

        const newMsg = {
            id: Date.now(),
            author: 'Alex Student',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB64GHbvy-PzYwINkrXjcZMERp_jy83KwV5j6NTQJkoP7oqCMgprEMUJrrWC7xmsZURFi0A2P9JG1Y8Z_QqwfIcd12HZo9IXLjP3nRUVk89Dj1NaXOxR_g7jYuyOqcwzXBbCHnTW2WKaQW3bA2rTbut0ZjGe7TGyW1y79-ErKFSejyqpwIa41mif4cXA45DEBZEMjGnlLwMHXVBttS1RUUxGn9exdAa7Kw1l9kqE4S4R3pWOMfWJy1vOJl89lS-h3G1VE6L5qX7H4fW',
            time: 'Just now',
            text: chatInput,
            attachment: attachment ? attachment.name : null
        };

        setMessages([...messages, newMsg]);
        setChatInput('');
        setAttachment(null);

        // Check against custom bots OR default StudyBot
        const isHelpCommand = chatInput.trim().toLowerCase() === '/help';
        const customBotMatch = customBots.find(b => chatInput.includes(`@${b.name}`));

        if (isHelpCommand || customBotMatch) {
            setTimeout(() => {
                let botName = 'StudyBot';
                let botAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4qny9mgkNlfbxHyNGYnT3elppFd5-kLzLlhWTmpUDNJ3I_5Yib6i1juazQUqGi25052ChwWd8DrwXmexkntL2mdgTugmFUqNwzEy-itWzlHsnKAh85bOYXt1iN7BnbkSYBsj7a-GaWf40WQ4IGA6VFTIlsvwzcSOatYaVJWtbD03dJjgnp6P8kR2BbwBfsokMVdNZ5A_xZSRg6SQo8R08agheOk9WrWVyQ0gE_IJpfLpHdc136w_4RGLiykYslkbBqCm3pqah6OVT';
                let botText = 'I can help with code snippets, study timers, and finding resources! Type `/resources <topic>` or `@StudyBot <question>`.';

                if (customBotMatch) {
                    botName = customBotMatch.name;
                    botAvatar = customBotMatch.avatar || botAvatar;
                    botText = `I am ${botName}, your custom assistant. Beep boop! You created me to help with: ${customBotMatch.instructions}`;
                }

                const botMsg = {
                    id: Date.now() + 1,
                    author: botName,
                    avatar: botAvatar,
                    time: 'Just now',
                    text: botText,
                    isBot: true
                };
                setMessages(prev => [...prev, botMsg]);
            }, 600);
        }
    }

    // Role toggle
    function toggleRole(id) {
        setRoles(roles.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    }

    function toggleRolePermission(roleId, perm) {
        setRoles(roles.map(r => {
            if (r.id !== roleId) return r;
            const updatedPerms = r.permissions.includes(perm)
                ? r.permissions.filter(p => p !== perm)
                : [...r.permissions, perm];
            return { ...r, permissions: updatedPerms };
        }));
    }

    // Handle File Input
    function handleFileChange(e) {
        if (e.target.files && e.target.files.length > 0) {
            setAttachment(e.target.files[0]);
        }
    }

    // Handle Join Request
    function handleRequestMatch(id, accept) {
        setJoinRequests(joinRequests.filter(r => r.id !== id));
        // If accept is true, logic would add them to members
    }

    // Handle Bot Creation / Editing
    function handleCreateBot(e) {
        e.preventDefault();
        const fd = new FormData(e.target);

        if (editingBotId) {
            setCustomBots(customBots.map(b => b.id === editingBotId ? {
                ...b,
                name: fd.get('botName'),
                instructions: fd.get('instructions'),
                tone: fd.get('tone')
            } : b));
            setEditingBotId(null);
            alert('Bot Updated Successfully!');
        } else {
            const newBot = {
                id: Date.now(),
                name: fd.get('botName'),
                instructions: fd.get('instructions'),
                tone: fd.get('tone')
            };
            setCustomBots([...customBots, newBot]);
            alert('Bot Created Successfully! Try @' + newBot.name + ' in chat.');
        }
        e.target.reset();
    }

    function editBot(bot) {
        setEditingBotId(bot.id);
        // We set a short timeout to let the form re-render if needed, then populate
        setTimeout(() => {
            const form = document.getElementById('botForm');
            if (form) {
                form.elements['botName'].value = bot.name;
                form.elements['instructions'].value = bot.instructions;
                form.elements['tone'].value = bot.tone;
            }
        }, 50);
    }

    function cancelEditBot() {
        setEditingBotId(null);
        const form = document.getElementById('botForm');
        if (form) form.reset();
    }

    // Role mapping for Member list displaying
    function changeMemberRole(memberId, newRole) {
        setSettingsMembers(settingsMembers.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    }

    function kickMember(memberId) {
        setSettingsMembers(settingsMembers.filter(m => m.id !== memberId));
    }

    // Chat Search Handling
    const isFileSearch = searchQuery.toLowerCase().startsWith('/file');
    const searchKeyword = isFileSearch ? searchQuery.slice(5).trim().toLowerCase() : searchQuery.trim().toLowerCase();

    // Mock robust search computation based on local messages + some global mock data
    const filteredSearchResults = (() => {
        if (!searchKeyword) return [];
        let results = [];

        // 1. Search existing local messages
        const localMatches = messages.filter(m => {
            if (isFileSearch) {
                return m.attachment && m.attachment.toLowerCase().includes(searchKeyword);
            }
            return m.text.toLowerCase().includes(searchKeyword) || (m.attachment && m.attachment.toLowerCase().includes(searchKeyword));
        }).map(m => ({ ...m, commName: selectedCommunity.name, scope: 'local' }));

        results = [...localMatches];

        // 2. If Global, append some mock results from other communities
        if (searchScope === 'global') {
            const globalMocks = [
                { id: 901, author: 'Jane Doe', avatar: '', time: 'Yesterday', text: `Here is the ${searchKeyword} document.`, attachment: isFileSearch ? `${searchKeyword}_notes.pdf` : null, commName: 'Physics 101', scope: 'global' },
                { id: 902, author: 'BotMaster', avatar: '', time: 'Monday', text: `I mentioned ${searchKeyword} earlier in this channel.`, commName: 'Web Dev Pro', scope: 'global' }
            ].filter(m => {
                if (isFileSearch) return m.attachment && m.attachment.toLowerCase().includes(searchKeyword);
                return m.text.toLowerCase().includes(searchKeyword);
            });
            results = [...results, ...globalMocks];
        }

        return results;
    })();

    /* =========================================================
       VIEW 1: DISCORD COMMUNITY VIEW
       ========================================================= */
    if (selectedCommunity) {
        return (
            <DashboardLayout>
                {/* Keep a minimal header to allow returning back */}
                <header className="top-header" style={{ padding: '8px 24px', minHeight: '60px' }}>
                    <div className="header-actions" style={{ justifyContent: 'flex-start', width: '100%' }}>
                        <button className="btn btn-ghost text-sm" onClick={() => setSelectedCommunity(null)}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                            Back to Explore
                        </button>
                    </div>
                </header>

                {/* Discord 3-Column Layout Container */}
                <div className="community-discord-container fade-in-up">

                    {/* LEFT SIDEBAR: Channels */}
                    <div className="discord-sidebar">
                        <div className="discord-sidebar-header">
                            <h3>{selectedCommunity.name}</h3>
                            <button className="settings-btn" onClick={() => setIsSettingsOpen(true)} title="Community Settings">
                                <span className="material-symbols-outlined">settings</span>
                            </button>
                        </div>

                        <div className="channel-group">
                            <div className="channel-group-title">Text Channels</div>
                            <div className="channel-item active">
                                <span className="material-symbols-outlined channel-icon">tag</span>
                                general
                            </div>
                            <div className="channel-item">
                                <span className="material-symbols-outlined channel-icon">tag</span>
                                resources
                            </div>
                            <div className="channel-item">
                                <span className="material-symbols-outlined channel-icon">tag</span>
                                help-qna
                            </div>
                        </div>

                        <div className="channel-group">
                            <div className="channel-group-title">Voice Channels</div>
                            <div className="channel-item">
                                <span className="material-symbols-outlined channel-icon">volume_up</span>
                                Study Room 1
                            </div>
                            <div className="channel-item">
                                <span className="material-symbols-outlined channel-icon">volume_up</span>
                                Chill Lounge
                            </div>
                        </div>
                    </div>

                    {/* CENTER: Chat Feed */}
                    <div className="discord-main">
                        <div className="discord-main-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>tag</span>
                                <h2>general</h2>
                                <span style={{ margin: '0 8px', color: 'var(--border)' }}>|</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                    Main discussion for {selectedCommunity.name}
                                </span>
                            </div>

                            {/* Chat Search Bar */}
                            <div className="chat-search-container" style={{ marginLeft: 'auto', position: 'relative' }}>
                                <div className="chat-search-input-wrapper">
                                    <span className="material-symbols-outlined search-icon">search</span>
                                    <input
                                        type="text"
                                        placeholder="Search (/file for files)"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowSearchResults(true);
                                        }}
                                        onFocus={() => setShowSearchResults(true)}
                                    />
                                    {searchQuery && (
                                        <button className="clear-search-btn" onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                                        </button>
                                    )}
                                </div>

                                {showSearchResults && searchQuery && (
                                    <div className="search-dropdown fade-in-up">
                                        <div className="search-scope-tabs">
                                            <button className={searchScope === 'local' ? 'active' : ''} onClick={() => setSearchScope('local')}>This Chat</button>
                                            <button className={searchScope === 'global' ? 'active' : ''} onClick={() => setSearchScope('global')}>Global</button>
                                        </div>
                                        <div className="search-results-list">
                                            {filteredSearchResults.length === 0 ? (
                                                <div className="no-results">No results found for "{searchQuery}"</div>
                                            ) : (
                                                filteredSearchResults.map(res => (
                                                    <div className="search-result-item" key={res.id}>
                                                        <div className="res-header">
                                                            <span className="res-author">{res.author}</span>
                                                            <span className="res-comm">in {res.commName}</span>
                                                            <span className="res-time">{res.time}</span>
                                                        </div>
                                                        <div className="res-text">{res.text}</div>
                                                        {res.attachment && (
                                                            <div className="res-attachment">
                                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>attach_file</span>
                                                                {res.attachment}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="chat-feed" onClick={() => setShowSearchResults(false)}>
                            {/* Messages */}
                            {messages.map(msg => (
                                <div className="chat-message" key={msg.id}>
                                    <img src={msg.avatar} alt="avatar" className="chat-avatar" />
                                    <div className="chat-content">
                                        <div className="chat-author-line">
                                            <span className={`chat-author ${msg.roleColor || ''}`}>{msg.author}</span>
                                            {msg.isBot && <span className="bot-badge"><span className="material-symbols-outlined">smart_toy</span> BOT</span>}
                                            <span className="chat-time">{msg.time}</span>
                                        </div>
                                        <div className="chat-text">{msg.text}</div>
                                        {/* Display attachment if any */}
                                        {msg.attachment && (
                                            <div className="chat-attachment-bubble">
                                                <span className="material-symbols-outlined">insert_drive_file</span>
                                                {msg.attachment}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Box */}
                        <div className="chat-input-area">
                            {/* Attachment Preview (if file selected before send) */}
                            {attachment && (
                                <div className="attachment-preview">
                                    <span className="material-symbols-outlined">insert_drive_file</span>
                                    <span className="file-name">{attachment.name}</span>
                                    <button type="button" onClick={() => setAttachment(null)} className="clear-attachment">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            )}

                            <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
                                {/* Hidden native file input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />

                                <button
                                    type="button"
                                    className="chat-action-btn"
                                    title="Upload Attachment"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <span className="material-symbols-outlined">add_circle</span>
                                </button>

                                <input
                                    type="text"
                                    className="chat-input"
                                    placeholder={`Message #general... (Try /help)`}
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                />

                                <div className="emoji-container">
                                    {showEmojiPicker && (
                                        <div className="emoji-picker-popup">
                                            <div className="emoji-grid">
                                                {emojis.map(e => (
                                                    <span
                                                        key={e}
                                                        className="emoji-item"
                                                        onClick={() => {
                                                            setChatInput(prev => prev + e);
                                                            setShowEmojiPicker(false);
                                                        }}
                                                    >
                                                        {e}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        className="chat-action-btn"
                                        title="Add Emoji"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowEmojiPicker(!showEmojiPicker);
                                        }}
                                    >
                                        <span className="material-symbols-outlined">mood</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR: Members list */}
                    <div className="discord-members">
                        <div className="role-group">
                            <div className="role-title">Admins — 1</div>
                            <div className="member-item">
                                <div className="member-avatar">
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3_SNJi9MVBcw1dUDt8UpLhYc1P9OnCpT1oyrIdGJ1jmD8lign-5v1UvIpTRygbLoiOpvsxJiUTkWHj91Q0bztMmo84mlRWYp2SHfFBIuIDh3REEf-T59c7ncUoYTRLPII_hy0MFjW-2IiFUkNOKv_893gOeSJv7l-meEnvBR-e_NP7Rx6HkXCCkQTSMHyK6QT-fVfUnqlEtbzyczR91e_YR_PCWMZfsFGtVsIQDTctN1ToVeGIqvGk3_wkE4omfGKJOVbxNQZhAr" alt="Prof" />
                                    <div className="member-status status-online"></div>
                                </div>
                                <div className="member-name admin-color">Prof. Davis</div>
                            </div>
                        </div>

                        <div className="role-group">
                            <div className="role-title">Bots — {1 + customBots.length}</div>
                            <div className="member-item">
                                <div className="member-avatar">
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4qny9mgkNlfbxHyNGYnT3elppFd5-kLzLlhWTmpUDNJ3I_5Yib6i1juazQUqGi25052ChwWd8DrwXmexkntL2mdgTugmFUqNwzEy-itWzlHsnKAh85bOYXt1iN7BnbkSYBsj7a-GaWf40WQ4IGA6VFTIlsvwzcSOatYaVJWtbD03dJjgnp6P8kR2BbwBfsokMVdNZ5A_xZSRg6SQo8R08agheOk9WrWVyQ0gE_IJpfLpHdc136w_4RGLiykYslkbBqCm3pqah6OVT" alt="Bot" />
                                    <div className="member-status status-online"></div>
                                </div>
                                <div className="member-name bot-color">StudyBot <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>verified</span></div>
                            </div>
                            {customBots.map(bot => (
                                <div className="member-item" key={bot.id}>
                                    <div className="member-avatar">
                                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>smart_toy</span>
                                        </div>
                                        <div className="member-status status-online"></div>
                                    </div>
                                    <div className="member-name bot-color">{bot.name} <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>verified</span></div>
                                </div>
                            ))}
                        </div>

                        <div className="role-group">
                            <div className="role-title">Online — 3</div>
                            <div className="member-item">
                                <div className="member-avatar">
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB64GHbvy-PzYwINkrXjcZMERp_jy83KwV5j6NTQJkoP7oqCMgprEMUJrrWC7xmsZURFi0A2P9JG1Y8Z_QqwfIcd12HZo9IXLjP3nRUVk89Dj1NaXOxR_g7jYuyOqcwzXBbCHnTW2WKaQW3bA2rTbut0ZjGe7TGyW1y79-ErKFSejyqpwIa41mif4cXA45DEBZEMjGnlLwMHXVBttS1RUUxGn9exdAa7Kw1l9kqE4S4R3pWOMfWJy1vOJl89lS-h3G1VE6L5qX7H4fW" alt="Alex" />
                                    <div className="member-status status-online"></div>
                                </div>
                                <div className="member-name">Alex Student</div>
                            </div>
                            <div className="member-item">
                                <div className="member-avatar">
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFgIDVq7-Cp7xewVFhDKb8rp7dNL39seoy2wtua9zI8zHGYonjhtSdgLHJ8oXWrUKoe_ZeBTYSZeFkzJukI7A9uvFk-lh4tscjDvTEpIAC39_uftElnvD37jAx_O-dfticIsyu8PQ9p2N6YiRJtm2gKsuYV1we28_30g5ThtfSlz3DqBjKisyBmfvLBgGLMqpsAi8z_MKCjIcKYjTCS5Mdu3qxzvWPguCb962aXnFi3sTA_eNLdUAZ_36tj2WzA8UO4KVnf0JwXaDH" alt="Sarah" />
                                    <div className="member-status status-idle"></div>
                                </div>
                                <div className="member-name">Sarah Chen</div>
                            </div>
                            <div className="member-item">
                                <div className="member-avatar">
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwXDG_Sg5M9ku6EZXkI87YVP2V_aVAaW85dd2ZHqQeGPVtYRtIW5J2O4VaCKQPtnwmBwSwLLAkpOHIv7LBdl3RWhmJbLJJAcxzGo7fcnc4_bvvWAQwdXVvUdhHmBROcgq3bc9-WU0Okj6Fc0ms354Y5DbYb0ipC_2BumHscTMOU4-JaJyKt2MH3JtvMvH0ewLiQwgef8b1t3hhk4DF167wYGZlI8Gd7VyRArbGX2fugQVEX-rY6s_Cr9rNhTRiZQ63isJnc3txds1H" alt="Mark" />
                                    <div className="member-status status-dnd"></div>
                                </div>
                                <div className="member-name">Mark J. <span className="role-tag">Noob</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── SETTINGS MODAL ─── */}
                {isSettingsOpen && (
                    <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
                        <div className="settings-modal" onClick={e => e.stopPropagation()}>
                            <div className="settings-sidebar">
                                <div className="settings-nav-title">Community Settings</div>
                                <div className={`settings-nav-item ${activeSettingsTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('overview')}>Overview</div>
                                <div className={`settings-nav-item ${activeSettingsTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('roles')}>Roles & Permissions</div>

                                <div className="settings-nav-title" style={{ marginTop: '24px' }}>Member Management</div>
                                <div className={`settings-nav-item ${activeSettingsTab === 'members' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('members')}>Members</div>
                                <div className={`settings-nav-item ${activeSettingsTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('requests')}>
                                    Join Requests {joinRequests.length > 0 && <span className="nav-badge-pill">{joinRequests.length}</span>}
                                </div>

                                <div className="settings-nav-title" style={{ marginTop: '24px' }}>Integrations</div>
                                <div className={`settings-nav-item ${activeSettingsTab === 'bots' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('bots')}>Custom Bots</div>
                            </div>

                            <div className="settings-content">
                                <button className="settings-close" onClick={() => setIsSettingsOpen(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>

                                {activeSettingsTab === 'overview' && (
                                    <div className="fade-in-up">
                                        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Community Overview</h2>
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label>Community Name</label>
                                            <input type="text" className="form-input" defaultValue={selectedCommunity.name} />
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea className="form-input" rows="4" defaultValue={selectedCommunity.desc}></textarea>
                                        </div>
                                        <button className="btn btn-primary" style={{ marginTop: '24px' }}>Save Changes</button>
                                    </div>
                                )}

                                {activeSettingsTab === 'roles' && (
                                    <div className="fade-in-up">
                                        <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Manage Roles & Permissions</h2>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                                            Use roles to group your community members and assign specific permissions.
                                            <strong> New members default to the "Noob" role.</strong>
                                        </p>

                                        {roles.map(role => (
                                            <div className="role-card" key={role.id}>
                                                <div className="role-card-header">
                                                    <div className="role-info">
                                                        <h4>
                                                            {role.name}
                                                            {role.id === 'admin' && <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>shield</span>}
                                                        </h4>
                                                        <p>{role.desc}</p>
                                                    </div>
                                                    <div className={`toggle-switch ${role.enabled ? 'on' : ''}`} onClick={() => toggleRole(role.id)}>
                                                        <div className="toggle-knob"></div>
                                                    </div>
                                                </div>

                                                {/* Advanced Permissions List */}
                                                {role.enabled && (
                                                    <div className="role-permissions-list">
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>PERMISSIONS</div>
                                                        <div className="perm-grid">
                                                            {allPermissions.map(perm => (
                                                                <label className="perm-checkbox" key={perm}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={(role.permissions || []).includes(perm)}
                                                                        onChange={() => toggleRolePermission(role.id, perm)}
                                                                    />
                                                                    {perm}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        <button className="btn btn-outline" style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}>
                                            <span className="material-symbols-outlined text-sm">add</span> Create New Role
                                        </button>
                                    </div>
                                )}

                                {activeSettingsTab === 'requests' && (
                                    <div className="fade-in-up">
                                        <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Join Requests</h2>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                                            Approve or deny students asking to join your community.
                                        </p>

                                        {joinRequests.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No pending requests! 🎉</div>
                                        ) : (
                                            joinRequests.map(req => (
                                                <div className="request-card" key={req.id}>
                                                    <div className="req-user">
                                                        <div className="req-avatar">
                                                            <span className="material-symbols-outlined">person</span>
                                                        </div>
                                                        <div>
                                                            <div className="req-name">{req.name} <span className="req-handle">{req.handle}</span></div>
                                                            <div className="req-msg">"{req.msg}"</div>
                                                        </div>
                                                    </div>
                                                    <div className="req-actions">
                                                        <button className="btn btn-outline text-sm" onClick={() => handleRequestMatch(req.id, false)}>Deny</button>
                                                        <button className="btn btn-primary text-sm" onClick={() => handleRequestMatch(req.id, true)}>Accept</button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {activeSettingsTab === 'bots' && (
                                    <div className="fade-in-up">
                                        <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Custom Community AI Bot</h2>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                                            Create a custom bot with context files to answer questions dynamically!
                                            (Requires <strong>Create Bots</strong> permission).
                                        </p>

                                        <div className="bot-creation-form">
                                            <form onSubmit={handleCreateBot}>
                                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                                    <label>Bot Name</label>
                                                    <input type="text" name="botName" className="form-input" placeholder="e.g. ScienceHelper" required />
                                                </div>

                                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                                    <label>Knowledge Context (Upload PDFs/Notes)</label>
                                                    <div className="file-upload-zone">
                                                        <span className="material-symbols-outlined">upload_file</span>
                                                        <span>Drag & drop files or click to upload context for the bot.</span>
                                                    </div>
                                                </div>

                                                <div className="form-row" style={{ marginBottom: '16px' }}>
                                                    <div className="form-group">
                                                        <label>System Instructions</label>
                                                        <textarea name="instructions" className="form-input" rows="3" placeholder="You are an expert in Physics. Explain concepts simply." required></textarea>
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Bot Tone</label>
                                                        <select name="tone" className="form-input" style={{ height: '38px' }}>
                                                            <option>Professional</option>
                                                            <option>Friendly & Encouraging</option>
                                                            <option>Strict Academic</option>
                                                            <option>Socratic (Answers with Questions)</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                                                    <span className="material-symbols-outlined text-sm">smart_toy</span> Create Bot
                                                </button>
                                            </form>
                                        </div>

                                        <h3 style={{ marginTop: '40px', marginBottom: '16px', fontSize: '1rem' }}>Active Bots</h3>
                                        {customBots.length === 0 ? (
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No custom bots created yet.</p>
                                        ) : (
                                            customBots.map(bot => (
                                                <div className="role-card" key={bot.id}>
                                                    <div>
                                                        <strong>{bot.name}</strong> • Tone: {bot.tone}
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}> "{bot.instructions}" </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                    </div>
                                )}

                                {activeSettingsTab === 'members' && (
                                    <div className="fade-in-up">
                                        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Members ({selectedCommunity.members})</h2>
                                        <div className="search-bar" style={{ maxWidth: '100%' }}>
                                            <span className="material-symbols-outlined">search</span>
                                            <input type="text" placeholder="Search members..." />
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        );
    }

    /* =========================================================
       VIEW 2: EXPLORE GRID (Main View)
       ========================================================= */
    const filters = ['All', 'Trending', 'New'];

    // Separate communities by Joined vs Not Joined
    const joinedCommunities = communities.filter(c => c.joined);
    const exploreCommunities = communities.filter(c => !c.joined);

    return (
        <DashboardLayout>
            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Search communities..." />
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> Create Community
                    </button>
                    <button className="icon-btn">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="notif-dot"></span>
                    </button>
                </div>
            </header>

            <div className="content-scroll">
                <div className="content-grid">
                    <div className="fade-in-up">
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Communities</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Join communities to learn, collaborate, and grow together.
                        </p>
                    </div>

                    {/* Section 1: My Communities */}
                    {joinedCommunities.length > 0 && (
                        <div className="fade-in-up fade-in-up-delay-1" style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.125rem', marginBottom: '16px', color: 'var(--text)' }}>My Joined Communities</h2>
                            <div className="communities-grid">
                                {joinedCommunities.map(c => (
                                    <div className="community-explore-card joined-card" key={c.id}>
                                        <div className="card-cover" style={{ background: c.coverColor, height: '60px' }}>
                                            <span
                                                className="material-symbols-outlined"
                                                style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', fontSize: '32px', color: 'rgba(255,255,255,0.8)' }}
                                            >{c.icon}</span>
                                        </div>
                                        <div className="card-content">
                                            <h4 style={{ marginBottom: '4px' }}>{c.name}</h4>
                                            <button
                                                className="btn btn-primary"
                                                style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '12px' }}
                                                onClick={() => setSelectedCommunity(c)}
                                            >
                                                Open Chat
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section 2: Explore */}
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 32px 0' }} className="fade-in-up" />

                    <div className="fade-in-up">
                        <h2 style={{ fontSize: '1.125rem', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            Explore New Communities

                            <div className="task-filters" style={{ marginBottom: 0 }}>
                                {filters.map(filter => (
                                    <button
                                        key={filter}
                                        className={'filter-btn' + (activeFilter === filter ? ' active' : '')}
                                        onClick={() => setActiveFilter(filter)}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </h2>
                    </div>

                    <div className="communities-grid fade-in-up fade-in-up-delay-2">
                        {exploreCommunities.map(c => (
                            <div className="community-explore-card" key={c.id}>
                                <div className="card-cover" style={{ background: c.coverColor }}>
                                    <span className="member-count">{c.members} members</span>
                                    <span
                                        className="material-symbols-outlined"
                                        style={{
                                            position: 'absolute', top: '50%', left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            fontSize: '48px', color: 'rgba(255,255,255,0.3)'
                                        }}
                                    >
                                        {c.icon}
                                    </span>
                                </div>
                                <div className="card-content">
                                    <h4>{c.name}</h4>
                                    <p>{c.desc}</p>

                                    <button
                                        className="btn btn-outline"
                                        style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                                        onClick={(e) => toggleJoin(e, c.id)}
                                    >
                                        Request to Join
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}

export default CommunitiesPage;
