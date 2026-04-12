# Community Section Implementation Plan

## Executive Summary
This document provides a comprehensive implementation plan for transforming the existing Community Section from a static content display into a fully interactive social platform.

## Current State Analysis

### Existing Infrastructure
- **Frontend**: Next.js with App Router at `web/src/app/community/page.tsx`
- **Backend API Routes**: POST/GET/DELETE `/api/posts`, `/api/messages`, `/api/events`
- **Database Tables**: `user_posts`, `messages`, `campaign_events`

### Identified Gaps
- ❌ Post Comments
- ❌ Post Likes/Reactions  
- ❌ Followers/Following System
- ❌ User Profiles with Posts
- ❌ Activity Feed
- ❌ Community Groups
- ❌ Standalone Events
- ❌ 24h Stories
- ❌ Social Notifications
- ❌ Member Directory

---

## Phase 1: Core Social Features (Weeks 1-4)

### 1.1 Comments System
**Database Migration**:
```sql
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES user_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_hidden BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE
);
```

**API Endpoints**:
- `POST /api/posts/:id/comments` — Create comment
- `GET /api/posts/:id/comments` — Get comments with pagination
- `PATCH /api/comments/:id` — Update comment
- `DELETE /api/comments/:id` — Delete comment
- `POST /api/comments/:id/like` — Like comment

**Components**: CommentThread, CommentForm, CommentItem

### 1.2 Likes and Reactions
**Database Migration**:
```sql
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES user_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'laugh', 'surprised', 'thinking', 'sad')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

**Components**: LikeButton, ReactionPicker

### 1.3 Followers System
**Database Migration**:
```sql
CREATE TABLE user_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

**API Endpoints**:
- `POST /api/users/:id/follow` — Follow user
- `DELETE /api/users/:id/follow` — Unfollow user
- `GET /api/users/:id/followers` — Get followers
- `GET /api/users/:id/following` — Get following

### 1.4 Bookmarks
**Database Migration**:
```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES user_posts(id) ON DELETE CASCADE,
  folder TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);
```

---

## Phase 2: Engagement Systems (Weeks 5-8)

### 2.1 Notifications System
**Database Migration**:
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Notification Types**: like_post, like_comment, new_comment, comment_reply, new_follower, mention, event_invite, group_invite, system_announcement

### 2.2 Direct Messaging
**Database Migration**:
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('direct', 'group')) DEFAULT 'direct',
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ
);
```

### 2.3 Gamification
**Database Migration**:
```sql
CREATE TABLE user_reputation (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  posts_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  points_value INTEGER DEFAULT 0
);
```

**Points System**: Post=10pts, Comment=5pts, Post Like=2pts, Comment Like=1pt

---

## Phase 3: Community Groups (Weeks 9-12)

### 3.1 Group System
**Database Migration**:
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  privacy TEXT CHECK (privacy IN ('public', 'private', 'invite_only')) DEFAULT 'public',
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  member_count INTEGER DEFAULT 0
);

CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('owner', 'admin', 'moderator', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Phase 4: Enhanced Events (Weeks 13-16)

### 4.1 Standalone Events
**Database Migration**:
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  location_type TEXT CHECK (location_type IN ('physical', 'virtual', 'hybrid')) DEFAULT 'physical',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  capacity INTEGER,
  organizer_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('attending', 'interested', 'not_attending')) DEFAULT 'interested'
);
```

---

## Phase 5: Stories (Weeks 17-20)

### 5.1 Stories System
**Database Migration**:
```sql
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  caption TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Phase 6: Moderation (Ongoing)

### 6.1 Content Moderation
**Database Migration**:
```sql
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE user_blocks (
  blocker_id UUID NOT NULL REFERENCES auth.users(id),
  blocked_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Frontend Component Architecture

```
web/src/
├── app/community/
│   ├── page.tsx (main hub)
│   ├── feed/page.tsx
│   ├── events/page.tsx
│   ├── events/[id]/page.tsx
│   ├── stories/page.tsx
│   ├── groups/page.tsx
│   ├── groups/[slug]/page.tsx
│   ├── messages/page.tsx
│   └── profile/[username]/page.tsx
├── components/social/
│   ├── PostCard.tsx
│   ├── CommentThread.tsx
│   ├── LikeButton.tsx
│   ├── ReactionPicker.tsx
│   ├── ShareButton.tsx
│   ├── BookmarkButton.tsx
│   ├── FollowButton.tsx
│   └── UserAvatar.tsx
├── hooks/
│   ├── usePosts.ts
│   ├── useComments.ts
│   ├── useLikes.ts
│   ├── useFollowers.ts
│   └── useNotifications.ts
```

---

## Implementation Priority

| Priority | Feature | Estimated Effort |
|----------|---------|-----------------|
| 1 | Connect existing `/api/posts` to community feed | 1 day |
| 2 | Post Likes/Reactions | 2 days |
| 3 | Comments System | 3 days |
| 4 | Follow System | 2 days |
| 5 | Notifications | 3 days |
| 6 | Messaging | 3 days |
| 7 | Groups | 4 days |
| 8 | Events | 3 days |
| 9 | Stories | 4 days |
| 10 | Moderation | 3 days |

---

## Notes
- Use optimistic UI updates throughout for responsive feel
- Implement proper error handling with user feedback
- Ensure mobile responsiveness for all components
- Follow existing code patterns in the project
- Write tests for critical user flows
