# IslandHub Enhancements Documentation

*Last Updated: April 3, 2026*

---

## 1. Registration Flow Overhaul

### Overview
Enhanced the registration process with role selection and category follow-up questions.

### Features
- **Role Selection**: Users choose from Buyer, Vendor, Driver, Creator, Sponsor
- **Vendor Categories**: Product, Food, Service, Other (with custom input)
- **Driver Types**: Taxi (dispatch), Delivery (pickup), Tour, Driving Service

### Files Modified
- `server/src/validation/schemas.ts` - Extended role enums
- `server/src/controllers/authController.ts` - Role mapping logic
- `server/src/models/User.ts` - Updated UserRole type
- `web/src/app/register/page.tsx` - Multi-step registration UI

### New Roles Created
```
vendor_product, vendor_food, vendor_service, vendor_other
driver_taxi, driver_delivery, driver_tour, driver_service
```

---

## 2. Moderator RBAC System

### Overview
Added role-based access control for moderators with different permission levels than admins.

### Middleware Added
```typescript
isModerator      // Moderator + Admin + Super admin
isModeratorOrAdmin // Same as above
isSuperAdmin     // Super admin only
```

### Database Changes
- `migrations/045_user_roles_moderation.sql`
- New tables: `moderation_flags`, `internal_notes`
- New columns: `role_category`, `vendor_category`, `driver_category`

### Permissions Matrix
| Action | Admin | Moderator |
|--------|-------|-----------|
| View content | ✅ | ✅ |
| Flag for review | ✅ | ✅ |
| Add internal notes | ✅ | ✅ |
| Delete content | ✅ | ❌ (needs admin password) |
| Change user roles | ✅ | ❌ |
| Approve KYC | ✅ | ❌ |

---

## 3. Vendor Compliance System

### Overview
A complete compliance tracking system for vendors with 7 default requirements.

### Requirements
1. Business License
2. Tax Registration (TIN)
3. Government ID
4. Proof of Address
5. Food Safety Certificate (food vendors)
6. Professional License
7. Insurance Certificate

### API Endpoints
| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/compliance/requirements` | GET | Public | List all requirements |
| `/compliance/vendor/:id` | GET | Vendor | Get vendor's compliance |
| `/compliance/submit` | POST | Vendor | Submit document |
| `/compliance/vendor/:id/summary` | GET | Vendor | Compliance summary |
| `/compliance/admin/pending` | GET | Admin | All pending reviews |
| `/compliance/admin/review/:id` | POST | Admin | Approve/reject |

### Files Created
- `server/migrations/046_vendor_compliance.sql`
- `server/src/controllers/complianceController.ts`
- `server/src/routes/complianceRoutes.ts`
- `web/src/components/dashboard/VendorComplianceStatus.tsx`

---

## 4. Admin Panel Enhancements

### Hover Preview Cards
- Hover over first column cell to see detailed preview
- Supports: User, Listing, Store, Order, Media types
- Shows relevant info: avatar, name, email, status, etc.

### Column Drag-and-Drop
- Drag column headers to reorder
- Resize columns by dragging edges
- Show/hide columns via settings icon
- Reset to default layout

### Asset Library
New unified media management system with:
- Grid/List view toggle
- Search by filename
- Date filters (All Time, Today, Week, Month)
- Preview modal with full details
- Delete functionality

**Location**: `/admin` → "Media Lib" tab

### KYC Review Modal
Enhanced KYC review with:
- Document preview (click to view)
- Business name and email display
- Approve button
- Reject with required reason field
- Submission timestamp

**Location**: `/admin` → "KYC" tab → Click any KYC card

### Column Customization
- **Show/Hide Columns**: Click settings icon, toggle checkboxes
- **Resize Columns**: Drag edge handles in table header
- **Reset**: Button to restore default layout

### User Table Enhancements
- Search by name or email
- Role filter dropdown
- Status filter dropdown
- Pagination controls

---

## 5. Content Pages

### Pages Created/Enhanced
| Page | Status | Features |
|------|--------|----------|
| `/about` | Enhanced | Mission, values, stats, what we offer |
| `/how-it-works` | Enhanced | Role-based flows, step-by-step guide |
| `/contact` | Enhanced | Contact form, info, hours |
| `/faq` | Created | 5 categories, searchable |
| `/terms` | Created | Sidebar navigation |
| `/privacy` | Created | Sidebar navigation |

---

## 6. Image System

### Frontend
- `web/src/lib/imagePresets.ts` - Dimension presets for different types
- Updated `ImageCropper.tsx` to use presets
- Updated `ImageUpload.tsx` to show preset dimensions

### Presets
```typescript
avatar: { width: 512, height: 512 }
banner: { width: 1920, height: 1080 }
listing: { width: 1200, height: 900 }
profile: { width: 512, height: 512 }
product: { width: 1024, height: 1024 }
thumbnail: { width: 300, height: 300 }
```

**Note**: Server-side Sharp processing requires paid Render instance.

---

## 7. Database Migrations

### 045_user_roles_moderation.sql
- Adds role_category columns
- Creates moderation_flags table
- Creates internal_notes table
- Creates indexes for performance

### 046_vendor_compliance.sql
- Creates compliance_requirements table
- Creates vendor_compliance table
- Creates compliance_audit_log table
- Inserts default requirements

---

## 8. API Routes Added

### `/api/compliance`
Vendor compliance management endpoints.

### Files Modified
- `server/src/index.ts` - Route registration

---

## Build & Deployment Notes

### Recent Build Fixes (April 2026)
1. Fixed syntax error in AdminTable.tsx header tag
2. Fixed useState type in VendorComplianceStatus.tsx
3. Fixed select placeholder (invalid prop in React)
4. Fixed KYCReviewModal documents parsing
5. Fixed createPortal argument count
6. Fixed duplicate exports in api.ts

### To Deploy
1. Pull latest from GitHub
2. Run migrations on Neon:
   ```sql
   -- 045_user_roles_moderation.sql
   -- 046_vendor_compliance.sql
   ```
3. Rebuild server (if needed)
4. Web auto-deploys via Vercel

---

## Testing Checklist

### Registration
- [ ] Role selection appears on /register
- [ ] Vendor category follows up with Product/Food/Service/Other
- [ ] Driver category follows up with Taxi/Delivery/Tour/Service
- [ ] Custom category input works for "Other"

### Admin Panel
- [ ] Media Library loads with grid/list view
- [ ] KYC review modal opens with document preview
- [ ] Can approve KYC with button
- [ ] Can reject KYC with reason
- [ ] Column settings toggle works
- [ ] Search in users table works

### Vendor Dashboard
- [ ] Compliance status shows on overview
- [ ] Progress bar displays percentage
- [ ] Requirements list shows status

### Moderator Features
- [ ] Flag for review action available
- [ ] Internal notes can be added
- [ ] Cannot delete without admin password

---

## Known Limitations

1. **Server-side Image Processing**: Requires paid Render instance for Sharp
2. **Drag-and-drop Column Reordering**: Framework ready but not fully integrated
3. **Hover Preview Cards**: Component created but not integrated into tables

---

## Future Enhancements (Not Implemented)

1. AI-powered content moderation (Zeroclaw)
2. Complete drag-and-drop column reordering
3. Full hover preview integration
4. Push notifications for compliance status
5. Email notifications for KYC review
6. Vendor onboarding wizard
7. Analytics dashboard for compliance
8. Bulk compliance actions

---

*End of Documentation*
