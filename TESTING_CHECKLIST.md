# IslandHub Testing Checklist

## Overview
Comprehensive test plan for validating all IslandHub features after recent deployments.

---

## 1. Authentication & Registration

### Registration Flow
- [ ] **Buyer Registration**: Create new buyer account with email
- [ ] **Vendor Registration**: Register as vendor with category selection (product/food/service)
- [ ] **Driver Registration**: Register as driver with type (taxi/delivery/tour/service)
- [ ] **Role Selection**: Multi-step role selection works correctly
- [ ] **Email Verification**: Verification email sent (check Resend/Dashboard)
- [ ] **Password Validation**: Strong password requirements enforced

### Login
- [ ] **Email Login**: Login with email/password works
- [ ] **Session Persistence**: Stay logged in across page refreshes
- [ ] **Logout**: Logout clears session properly
- [ ] **Role-based Redirect**: Different dashboards based on user role

---

## 2. Vendor Dashboard

### Vendor Onboarding
- [ ] **Onboarding Wizard**: 4-step setup wizard accessible
- [ ] **Business Profile**: Can set business name, category, phone, location
- [ ] **Store Setup**: Can add description and customize storefront
- [ ] **Compliance Tab**: Shows compliance requirements
- [ ] **First Listing**: Can navigate to create listing

### Vendor Management
- [ ] **Store Branding**: Logo, cover photo, colors
- [ ] **Menu Builder**: Create categories and items (for food)
- [ ] **Product Listings**: CRUD operations for listings
- [ ] **Promotions**: Create and manage offers/discounts

### Vendor Analytics
- [ ] **Overview Stats**: Sales, views, conversions displayed
- [ ] **Financial Hub**: Earnings and payout information
- [ ] **Reviews**: View and respond to customer reviews

---

## 3. Driver System (NEW)

### Driver App (`/driver/app`)
- [ ] **PWA Installation**: App can be installed on mobile
- [ ] **Online Toggle**: Can go online/offline
- [ ] **Location Update**: Can update GPS location
- [ ] **Current Trip**: Shows active trip with status flow
- [ ] **Status Updates**: Can update trip status (arrived → picked up → completed)
- [ ] **Earnings Display**: Shows today's trips and earnings
- [ ] **Call Rider**: Can initiate call to rider

### Dispatch System
- [ ] **Create Dispatch**: Admin can create dispatch request
- [ ] **Find Drivers**: Can find nearest available drivers
- [ ] **Dispatch Offers**: Multiple drivers receive offers
- [ ] **Accept/Reject**: Drivers can accept or reject dispatch
- [ ] **Trip Lifecycle**: Trip progresses through states correctly
- [ ] **Trip Completion**: Upon completion, earnings calculated

### Driver Hub (`/driver-hub`)
- [ ] **Driver Portal**: Landing page displays correctly
- [ ] **Service Links**: Links to taxi, delivery, pickup services work

---

## 4. Agent Center (ZeroClaw)

### Memory System
- [ ] **ReMeLight Access**: Memory tab accessible in admin
- [ ] **Vector Search**: Can search memories semantically
- [ ] **Skills Display**: Shows available agent skills
- [ ] **Memory Stats**: Shows memory layer information

### Agent Controls
- [ ] **Gateway Toggle**: ON/OFF toggle in header works
- [ ] **Provider Connect**: Can connect/disconnect providers
- [ ] **Test Connection**: Can test provider API connection
- [ ] **Agent List**: Shows configured agents

### Settings
- [ ] **Budget Alert**: Shows 65% budget threshold setting
- [ ] **Global Config**: Can modify agent settings

---

## 5. Admin Panel

### User Management
- [ ] **User List**: Displays all users with search
- [ ] **Bulk Actions**: Can activate/deactivate/delete multiple users
- [ ] **Column Sorting**: Can reorder columns via drag-drop
- [ ] **User Preview**: Hover shows user details

### Listings Management
- [ ] **Listings Table**: View all listings
- [ ] **Bulk Actions**: Can moderate/activate/deactivate listings
- [ ] **Search**: Can search by name, vendor, status

### KYC Review
- [ ] **KYC Queue**: Shows pending verifications
- [ ] **Document Preview**: Can view submitted documents
- [ ] **Approve/Reject**: Can approve or reject KYC

### Compliance
- [ ] **Compliance Analytics**: Dashboard shows stats
- [ ] **Compliance by Category**: Shows breakdown by vendor type
- [ ] **Recent Activity**: Shows recent compliance events

### Asset Library
- [ ] **Media Library**: Can view and manage assets
- [ ] **Upload**: Can upload new images

---

## 6. Content Pages

### Public Pages
- [ ] **Homepage**: Hero sections load correctly
- [ ] **Search**: Search functionality works
- [ ] **Store Pages**: Vendor storefronts display
- [ ] **Product Details**: Listing detail pages show all info
- [ ] **Cart**: Can add items to cart

### Informational Pages
- [ ] **About Page**: Loads correctly
- [ ] **How It Works**: Page displays
- [ ] **FAQ**: Questions and answers display
- [ ] **Contact**: Contact form works
- [ ] **Terms**: Terms page loads
- [ ] **Privacy**: Privacy policy loads

---

## 7. Payment & Orders

### Checkout Flow
- [ ] **Cart Items**: Items can be added/removed
- [ ] **Price Calculation**: Totals calculate correctly
- [ ] **Payment Methods**: Payment options available (Stripe, etc.)

### Order Management
- [ ] **Order Creation**: Orders create successfully
- [ ] **Order Status**: Status updates visible
- [ ] **Order History**: Past orders accessible

---

## 8. Notifications

### Email Notifications
- [ ] **Welcome Email**: Sent on registration
- [ ] **Verification Email**: Sent with verification link
- [ ] **KYC Status**: Notification on KYC approve/reject
- [ ] **Compliance**: Notification on compliance review

### In-App Notifications
- [ ] **Notification Page**: `/notifications` loads
- [ ] **Unread Count**: Badge shows unread count

---

## 9. API Endpoints (Backend)

### Test with curl/Postman:

```bash
# Auth
curl -X POST https://your-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123!","role":"buyer"}'

# Driver Location
curl -X POST https://your-api.onrender.com/api/drivers/location \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":17.3,"longitude":-62.7}'

# Dispatch Create
curl -X POST https://your-api.onrender.com/api/drivers/dispatch/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pickup":{"lat":17.3,"lng":-62.7,"address":"Test"},"dropoff":{"lat":17.4,"lng":-62.8,"address":"Test2"}}'

# Agent Memories
curl -X GET "https://your-api.onrender.com/api/agent/memories?query=test" \
  -H "Authorization: Bearer TOKEN"
```

---

## 10. Mobile Responsiveness

### Responsive Testing
- [ ] **Mobile Menu**: Hamburger menu works on mobile
- [ ] **Touch-Friendly**: Buttons sized for touch
- [ ] **No Horizontal Scroll**: Page fits screen width
- [ ] **Images**: Images scale properly on mobile
- [ ] **Forms**: Forms usable on mobile

---

## Testing Credentials (Example)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@islandhub.com | Admin123! |
| Vendor | vendor@test.com | Vendor123! |
| Driver | driver@test.com | Driver123! |
| Buyer | buyer@test.com | Buyer123! |

---

## Known Issues to Verify Fixed

- [ ] Registration role selection shows new UI (not old form)
- [ ] Agent Center provider controls work
- [ ] MemoryDashboard sync error shows graceful fallback
- [ ] VendorOverview accepts proper props
- [ ] Driver app PWA installable

---

## Post-Deployment Checklist

- [ ] Vercel build successful
- [ ] Render build successful  
- [ ] Database migrations run
- [ ] Environment variables set on both platforms
- [ ] No critical errors in console
- [ ] All links working

---

*Last Updated: April 4, 2026*
*Version: 2.1.0*