# IslandHub - Continuation Prompt

*Use this prompt to continue development in a new session*

---

## Current Project State

IslandHub is a full-stack Caribbean marketplace with:
- **Frontend**: Next.js 16 on Vercel
- **Backend**: Express/Node.js on Render
- **Database**: PostgreSQL on Neon

---

## What's Been Done (Completed)

### 1. Registration & User Management
- Role selection flow (Buyer, Vendor, Driver, Creator, Sponsor)
- Vendor categories (Product, Food, Service, Other)
- Driver types (Taxi, Delivery, Tour, Driving Service)
- Moderator RBAC system

### 2. Vendor Compliance System
- 7 compliance requirements tracking
- Compliance API endpoints (`/api/compliance`)
- Vendor dashboard compliance component
- Admin compliance review interface

### 3. Admin Panel Enhancements
- Asset Library (Media Lib tab)
- KYC Review Modal with document preview
- Column customization (show/hide, resize)
- User table search and filters

### 4. Content Pages
- Enhanced About, How It Works, Contact
- New FAQ, Terms, Privacy pages

### 5. Database Migrations
- `045_user_roles_moderation.sql` - Run on Neon
- `046_vendor_compliance.sql` - Run on Neon

---

## Build Status: ✅ Working

Latest build passes. All critical fixes applied.

---

## Immediate Next Steps (Priority Order)

### If Testing First
1. Test registration with role selection
2. Test admin asset library
3. Test KYC review modal
4. Test vendor compliance dashboard

### If Continuing Development

#### High Priority
1. **Integrate HoverPreview component** into AdminTable rows
2. **Complete column drag-and-drop** reordering (dnd-kit already imported)
3. **Add compliance API calls** to VendorComplianceStatus component

#### Medium Priority
4. Add push notifications for compliance status changes
5. Add email notifications for KYC reviews
6. Create vendor onboarding wizard

#### Lower Priority
7. AI content moderation (Zeroclaw setup)
8. Analytics dashboard for compliance
9. Bulk operations for admin tables

---

## Key Files Reference

### Backend
- `server/src/controllers/complianceController.ts` - Compliance API
- `server/src/middleware/authMiddleware.ts` - RBAC middleware
- `server/src/routes/complianceRoutes.ts` - Compliance routes

### Frontend
- `web/src/app/register/page.tsx` - Registration flow
- `web/src/app/admin/page.tsx` - Admin panel
- `web/src/components/admin/AssetLibrary.tsx` - Media library
- `web/src/components/admin/KYCReviewModal.tsx` - KYC modal
- `web/src/components/admin/shared/AdminTable.tsx` - Table component
- `web/src/components/dashboard/VendorComplianceStatus.tsx` - Compliance display

### Database
- `server/migrations/045_user_roles_moderation.sql`
- `server/migrations/046_vendor_compliance.sql`

---

## Common Commands

### Run migrations on Neon
```bash
psql connection_string -f server/migrations/045_user_roles_moderation.sql
psql connection_string -f server/migrations/046_vendor_compliance.sql
```

### Rebuild backend
```bash
cd server && npm run build
```

### Start dev servers
```bash
# Backend
cd server && npm run dev

# Frontend  
cd web && npm run dev
```

---

## Environment Variables Needed

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
RESEND_API_KEY=re_...
STRIPE_SECRET_KEY=sk_...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_IMAGE_BASE_URL=https://your-backend.onrender.com
```

---

## Architecture Notes

### User Roles
- `buyer` - Default shopping role
- `vendor_product`, `vendor_food`, `vendor_service`, `vendor_other` - Vendors
- `driver_taxi`, `driver_delivery`, `driver_tour`, `driver_service` - Drivers
- `admin`, `super-admin` - Admin access
- `moderator` - Limited moderation access

### Subscription Override System
- Admins/moderators bypass subscription checks
- Manual override endpoints available for 30/60/90 days

### Image Processing
- Client-side cropping with presets
- Server-side Sharp processing (requires paid Render)

---

## Known Issues / TODO

1. **Server-side image processing** - Needs paid Render for Sharp
2. **Hover preview cards** - Component created, needs table integration
3. **Drag-drop column reorder** - Framework ready, needs full DnD integration

---

## Documentation
- See `ENHANCEMENTS.md` for full details
- See `README.md` for project setup

---

*Last updated: April 3, 2026*
