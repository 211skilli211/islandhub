--
-- PostgreSQL database dump
--

\restrict dheecPYx7ohwPfJuWPVJFUAYJIbs6dP8eVV2KYYAdbgj0NBv8tR98zdlZ60wqIZ

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (user_id, name, email, password_hash, role, country, created_at, updated_at, is_active, google_id, avatar_url, cover_photo_url, metadata, bio, email_verified, profile_photo_url, banner_image_url, banner_color, license_number, vehicle_type, vehicle_plate, is_verified_driver, current_location, vehicle_color, vehicle_seating, two_factor_secret, two_factor_enabled, two_factor_backup_codes, failed_login_attempts, locked_until, last_login_at, password_changed_at, password_history, driver_rating, driver_rating_count, is_online, total_jobs_completed, live_lat, live_lng, last_online) FROM stdin;
2	Ital Owner	ital@example.com	$2b$10$GCac7lHpLVlsnWZrqkVIme/GQTRo2g1DIx0xiHhVYkDUEj8wKLDN6	vendor	\N	2026-03-04 19:52:27.619017	2026-03-04 19:52:27.619017	t	\N	\N	\N	{}	\N	t	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	\N	0	\N	\N	2026-03-04 19:52:27.619017	[]	0.00	0	f	0	\N	\N	\N
3	Boat Captain	captain@example.com	$2b$10$GCac7lHpLVlsnWZrqkVIme/GQTRo2g1DIx0xiHhVYkDUEj8wKLDN6	vendor	\N	2026-03-04 19:52:27.866929	2026-03-04 19:52:27.866929	t	\N	\N	\N	{}	\N	t	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	\N	0	\N	\N	2026-03-04 19:52:27.866929	[]	0.00	0	f	0	\N	\N	\N
4	Property Owner	owner@example.com	$2b$10$GCac7lHpLVlsnWZrqkVIme/GQTRo2g1DIx0xiHhVYkDUEj8wKLDN6	vendor	\N	2026-03-04 19:52:27.887458	2026-03-04 19:52:27.887458	t	\N	\N	\N	{}	\N	t	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	\N	0	\N	\N	2026-03-04 19:52:27.887458	[]	0.00	0	f	0	\N	\N	\N
5	Apparel Manager	pulse@example.com	$2b$10$GCac7lHpLVlsnWZrqkVIme/GQTRo2g1DIx0xiHhVYkDUEj8wKLDN6	vendor	\N	2026-03-04 19:52:27.896763	2026-03-04 19:52:27.896763	t	\N	\N	\N	{}	\N	t	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	\N	0	\N	\N	2026-03-04 19:52:27.896763	[]	0.00	0	f	0	\N	\N	\N
6	Skits Cancer Fund	charity@example.com	$2b$10$GCac7lHpLVlsnWZrqkVIme/GQTRo2g1DIx0xiHhVYkDUEj8wKLDN6	creator	\N	2026-03-04 19:52:27.906042	2026-03-04 19:52:27.906042	t	\N	\N	\N	{}	\N	t	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	\N	0	\N	\N	2026-03-04 19:52:27.906042	[]	0.00	0	f	0	\N	\N	\N
1	Skilli Admin	skilli211beng@gmail.com	$2b$10$OJxO080qbombdbgRmqOqYeGi2Wax/SApfYZz73VfSt7b2Oj4uHiWy	admin	\N	2026-03-04 15:59:20.852562	2026-03-04 15:59:20.852562	t	\N	\N	\N	{}	\N	t	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	\N	0	\N	\N	2026-03-04 20:05:54.168197	["$2b$10$oSgDZnzzk2YoCJ6no1ileuSjEVc74do4akt4AI8V/y6Gl5gUHstRS"]	0.00	0	f	0	\N	\N	\N
\.


--
-- Data for Name: advertisements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.advertisements (ad_id, title, description, advertiser_type, advertiser_id, advertiser_name, contact_email, contact_phone, media_type, media_url, media_urls, thumbnail_url, ad_space_id, placement_priority, target_pages, target_categories, target_locations, click_action, target_url, target_store_id, target_listing_id, start_date, end_date, schedule_config, pricing_model, budget_amount, spent_amount, status, is_active, impressions, clicks, created_by, approved_by, approved_at, created_at, updated_at, style_config, layout_template) FROM stdin;
19	Ital Kitchen Premium	Experience the real taste of the islands with our farm-to-table vegan delights.	admin	\N	\N	\N	\N	image	/assets/ads/seafood.png	\N	\N	3	0	\N	\N	\N	url	\N	\N	\N	\N	\N	\N	\N	\N	0.00	active	t	0	0	\N	\N	\N	2026-03-05 14:14:43.074036	2026-03-05 14:14:43.074036	{"to": "#020617", "from": "#064e3b", "pattern": "dots", "patternColor": "#ffffff"}	sleek
20	Blue Mountain Coffee	The world's most exclusive beans, roasted to perfection in the mountains.	admin	\N	\N	\N	\N	image	/assets/ads/coffee.png	\N	\N	12	0	\N	\N	\N	url	\N	\N	\N	\N	\N	\N	\N	\N	0.00	active	t	0	0	\N	\N	\N	2026-03-05 14:14:43.078658	2026-03-05 14:14:43.078658	{"to": "#0c0a09", "from": "#451a03", "pattern": "grid", "patternColor": "#fbbf24"}	portrait
21	Mahogany Shades	Limited edition handcrafted frames. Protection with island style.	admin	\N	\N	\N	\N	image	/assets/ads/sunglasses.png	\N	\N	5	0	\N	\N	\N	url	\N	\N	\N	\N	\N	\N	\N	\N	0.00	active	t	0	0	\N	\N	\N	2026-03-05 14:14:43.080705	2026-03-05 14:14:43.080705	{"to": "#000000", "from": "#422006", "pattern": "dots", "patternColor": "#ffffff"}	portrait
22	Azure Boat Rentals	Your private paradise awaits. Book a luxury catamaran today.	admin	\N	\N	\N	\N	image	/assets/ads/boats.png	\N	\N	4	0	\N	\N	\N	url	\N	\N	\N	\N	\N	\N	\N	\N	0.00	active	t	0	0	\N	\N	\N	2026-03-05 14:14:43.082345	2026-03-05 14:14:43.082345	{"to": "#1e1b4b", "from": "#0e7490", "pattern": "mesh", "patternColor": "#67e8f9"}	glass
\.


--
-- Data for Name: driver_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.driver_profiles (id, user_id, license_number, license_expiry, verification_status, rejection_reason, documents, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: hero_assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hero_assets (id, page_key, asset_url, asset_type, overlay_color, overlay_opacity, created_at, updated_at, title, subtitle, cta_text, cta_link, icon_url, typography, cta2_text, cta2_link, layout_template, style_config) FROM stdin;
1	home	/assets/hero/island-landscape.jpg	image	#000000	0.40	2026-03-05 13:10:04.383662	2026-03-05 13:10:04.383662	Discover the Islands	Support local creators and explore hidden gems in the Caribbean.	Start Exploring	/listings	\N	{}	\N	\N	standard	{"pattern": "dots", "patternColor": "#ffffff", "overlayOpacity": 0.4}
2	marketplace	/assets/hero/marketplace-vibrant.jpg	image	#000000	0.50	2026-03-05 13:10:04.383662	2026-03-05 13:10:04.383662	Island Marketplace	The finest products and services from across the islands.	Browse All	/listings	\N	{}	\N	\N	standard	{"pattern": "grid", "patternColor": "#ffffff", "overlayOpacity": 0.5}
9	community	/assets/hero/community.jpg	image	#000000	0.50	2026-03-05 13:49:58.151372	2026-03-05 13:49:58.151372	Island Community	Connect with locals and creators across the archipelago.	Join Discussion	/community	\N	{}	\N	\N	standard	{"pattern": "mesh", "patternColor": "#ffffff", "overlayOpacity": 0.5}
\.


--
-- Data for Name: promotional_banners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotional_banners (banner_id, title, subtitle, image_url, target_url, location, color_theme, mobile_mode, dismissible, is_active, created_at, updated_at, template_type, icon) FROM stdin;
7	Limited Time Offer	Get 20% off all Reef Runner boat rentals this weekend!	\N	/rentals	marketplace_floating	rose	floating	t	t	2026-03-04 20:05:38.899252	2026-03-04 20:05:38.899252	urgency	⏰
9	Fresh Catch Friday	New seafood platters at Ital Vegan Kitchen!	\N	/store/ital-vegan-kitchen	community_hero	amber	standard	t	t	2026-03-04 20:05:38.905971	2026-03-04 20:05:38.905971	promotion	🥗
8	Community First	Support local island startups and craftsmen.	file-1769965232226-73669333.jpg	\N	home_hero	indigo	standard	t	t	2026-03-04 20:05:38.903418	2026-03-05 10:55:43.816864	community	🏝
\.


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stores (store_id, vendor_id, category, subtype, name, slug, description, logo_url, banner_url, subscription_type, status, created_at, updated_at, badges, hero_title, show_hero_title, branding_color, secondary_color, category_type, hero_subtitle, hero_cta_text, hero_cta_link, hero_icon_url, typography, branding_icon_url, hero_cta2_text, hero_cta2_link, category_id, subtype_id, secondary_subtypes, aims, objectives, website_url, business_address, business_hours, service_mode, template_id, template_config) FROM stdin;
1	2	Food	restaurant	Ital Vegan Kitchen	ital-vegan-kitchen	Healthy organic plant-based meals.	\N	\N	basic	active	2026-03-04 19:52:27.819782	2026-03-04 19:52:27.819782	{}	\N	t	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	walk-in	\N	{}
2	3	Rental	boat_rental	Reef Runner Boat Rentals	reef-runner-boat-rentals	Explore the hidden gems of our coastline.	\N	\N	basic	active	2026-03-04 19:52:27.872833	2026-03-04 19:52:27.872833	{}	\N	t	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	walk-in	\N	{}
3	4	Rental	accommodation	Caribbean Heights Apartment	caribbean-heights-apartment	Breathtaking ocean views.	\N	\N	basic	active	2026-03-04 19:52:27.890994	2026-03-04 19:52:27.890994	{}	\N	t	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	walk-in	\N	{}
4	5	Retail	store	Pulse Island Apparel	pulse-island-apparel	Modern streetwear with island soul.	\N	\N	basic	active	2026-03-04 19:52:27.900105	2026-03-04 19:52:27.900105	{}	\N	t	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	walk-in	\N	{}
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendors (id, user_id, business_name, description, logo_url, banner_url, contact_email, contact_phone, location, is_verified, created_at, theme_color, bio, slug, sub_type, kyc_status, storefront_info, is_featured, promotion_credits, search_vector, admin_rating, badges, balance, branding_color, secondary_color, promo_video_url, audio_intro_url, cover_photo_url, status, kyb_verified, admin_notes, verified_at, verified_by, rejected_at, rejected_by) FROM stdin;
1	2	Ital Vegan Kitchen	\N	\N	\N	\N	\N	St. Kitts	f	2026-03-04 19:52:27.62579	teal-600	Healthy organic plant-based meals.	ital-vegan-kitchen	food	verified	{}	f	0	'base':8B 'healthi':4B 'ital':1A 'kitchen':3A 'kitt':11C 'meal':9B 'organ':5B 'plant':7B 'plant-bas':6B 'st':10C 'vegan':2A	\N	[]	0.00	\N	\N	\N	\N	\N	pending	f	\N	\N	\N	\N	\N
2	3	Reef Runner Boat Rentals	\N	\N	\N	\N	\N	Frigate Bay	f	2026-03-04 19:52:27.869981	teal-600	The best boat tours on the island.	reef-runner-boat-rentals	rental	verified	{}	f	0	'bay':13C 'best':6B 'boat':3A,7B 'frigat':12C 'island':11B 'reef':1A 'rental':4A 'runner':2A 'tour':8B	\N	[]	0.00	\N	\N	\N	\N	\N	pending	f	\N	\N	\N	\N	\N
3	4	Island Stays	\N	\N	\N	\N	\N	Frigate Bay	f	2026-03-04 19:52:27.888948	teal-600	Curated premium stays.	caribbean-heights-apartment	rental	verified	{}	f	0	'bay':7C 'curat':3B 'frigat':6C 'island':1A 'premium':4B 'stay':2A,5B	\N	[]	0.00	\N	\N	\N	\N	\N	pending	f	\N	\N	\N	\N	\N
4	5	Pulse Island Apparel	\N	\N	\N	\N	\N	Basseterre	f	2026-03-04 19:52:27.898182	teal-600	Wear the rhythm of the waves.	pulse-island-apparel	retail	verified	{}	f	0	'apparel':3A 'basseterr':10C 'island':2A 'puls':1A 'rhythm':6B 'wave':9B 'wear':4B	\N	[]	0.00	\N	\N	\N	\N	\N	pending	f	\N	\N	\N	\N	\N
\.


--
-- Name: advertisements_ad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.advertisements_ad_id_seq', 22, true);


--
-- Name: driver_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.driver_profiles_id_seq', 1, false);


--
-- Name: hero_assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hero_assets_id_seq', 12, true);


--
-- Name: promotional_banners_banner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.promotional_banners_banner_id_seq', 15, true);


--
-- Name: stores_store_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stores_store_id_seq', 16, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_user_id_seq', 21, true);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vendors_id_seq', 16, true);


--
-- PostgreSQL database dump complete
--

\unrestrict dheecPYx7ohwPfJuWPVJFUAYJIbs6dP8eVV2KYYAdbgj0NBv8tR98zdlZ60wqIZ

