import { pgTable, text, serial, timestamp, numeric, integer, boolean, jsonb } from "drizzle-orm/pg-core";

// 1. Business Profile & Settings
export const businessProfiles = pgTable("business_profiles", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull().default("Apex Delivery Logistics LLC"),
  legalStructure: text("legal_structure").notNull().default("Single-Member LLC"),
  stateOfRegistration: text("state_of_registration").notNull().default("CA"),
  einMasked: text("ein_masked").notNull().default("XX-XXX8921"),
  taxYear: integer("tax_year").notNull().default(2026),
  targetDailyRevenue: numeric("target_daily_revenue", { precision: 10, scale: 2 }).notNull().default("150.00"),
  targetWeeklyRevenue: numeric("target_weekly_revenue", { precision: 10, scale: 2 }).notNull().default("900.00"),
  targetMonthlyRevenue: numeric("target_monthly_revenue", { precision: 10, scale: 2 }).notNull().default("3800.00"),
  taxReservePercent: numeric("tax_reserve_percent", { precision: 5, scale: 2 }).notNull().default("25.00"),
  estMileageDeductionRate: numeric("est_mileage_deduction_rate", { precision: 5, scale: 3 }).notNull().default("0.670"), // 2024-2026 IRS baseline
  avgFuelCostPerGallon: numeric("avg_fuel_cost_per_gallon", { precision: 5, scale: 2 }).notNull().default("3.85"),
  vehicleMpg: numeric("vehicle_mpg", { precision: 5, scale: 1 }).notNull().default("28.5"),
  xpPoints: integer("xp_points").notNull().default(1420),
  level: integer("level").notNull().default(6),
  currentStreakDays: integer("current_streak_days").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Vehicles
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("2022 Honda Civic EX"),
  vinMasked: text("vin_masked").default("1HGFC...9942"),
  licensePlate: text("license_plate").default("7XYZ991"),
  currentOdometer: numeric("current_odometer", { precision: 10, scale: 1 }).notNull().default("45120.0"),
  startYearOdometer: numeric("start_year_odometer", { precision: 10, scale: 1 }).notNull().default("38400.0"),
  status: text("status").notNull().default("active"), // active, maintenance, inactive
  mpgRating: numeric("mpg_rating", { precision: 5, scale: 1 }).notNull().default("29.0"),
  oilLifePercent: integer("oil_life_percent").notNull().default(68),
  tireTreadPercent: integer("tire_tread_percent").notNull().default(82),
  insuranceExpiration: text("insurance_expiration").default("2026-11-15"),
  isPrimary: boolean("is_primary").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. User Availability Blocks
export const availabilities = pgTable("availabilities", {
  id: serial("id").primaryKey(),
  dayOfWeek: text("day_of_week").notNull(), // 'Monday', 'Tuesday', etc. or '2026-04-18'
  startTime: text("start_time").notNull(), // '16:00'
  endTime: text("end_time").notNull(), // '22:00'
  isAvailable: boolean("is_available").notNull().default(true),
  maxHours: numeric("max_hours", { precision: 4, scale: 1 }).default("6.0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Opportunities (Marketplace gigs vs Scheduled commitments)
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // 'DoorDash', 'Uber Eats', 'Crew', 'Amazon Flex', 'Roadie'
  opportunityType: text("opportunity_type").notNull(), // 'flexible_marketplace' vs 'fixed_commitment' vs 'scheduled_block'
  title: text("title").notNull(), // e.g. "Dinner Rush - Downtown / Westside"
  startTime: text("start_time").notNull(), // '17:30'
  endTime: text("end_time").notNull(), // '20:30'
  date: text("date").notNull(), // YYYY-MM-DD
  expectedEarnings: numeric("expected_earnings", { precision: 10, scale: 2 }).notNull(),
  expectedMiles: numeric("expected_miles", { precision: 8, scale: 1 }).notNull(),
  estimatedFuelCost: numeric("estimated_fuel_cost", { precision: 10, scale: 2 }).notNull(),
  estimatedNetProfit: numeric("estimated_net_profit", { precision: 10, scale: 2 }).notNull(),
  grossHourlyRate: numeric("gross_hourly_rate", { precision: 10, scale: 2 }).notNull(),
  netHourlyRate: numeric("net_hourly_rate", { precision: 10, scale: 2 }).notNull(),
  score: integer("score").notNull().default(85), // 0-100 recommendation rating
  status: text("status").notNull().default("available"), // 'available', 'scheduled', 'completed', 'dismissed', 'healed_replacement'
  source: text("source").notNull().default("api_sync"), // 'api_sync', 'csv_import', 'manual_entry'
  recommendationReason: text("recommendation_reason"), // Explanation of WHY chosen
  zone: text("zone").default("Metro Central / West End"),
  requiresBooking: boolean("requires_booking").default(false),
  bookingUrlOrInstructions: text("booking_url_or_instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Scheduled Shift Events (The Master Business Schedule)
export const scheduleEvents = pgTable("schedule_events", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id"),
  title: text("title").notNull(),
  platform: text("platform").notNull(),
  eventType: text("event_type").notNull().default("delivery_shift"), // 'fixed_commitment', 'flexible_gig', 'admin_audit', 'break'
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  status: text("status").notNull().default("confirmed"), // 'confirmed', 'in_progress', 'completed', 'cancelled_healed'
  projectedEarnings: numeric("projected_earnings", { precision: 10, scale: 2 }).notNull(),
  projectedMiles: numeric("projected_miles", { precision: 8, scale: 1 }).notNull(),
  actualEarnings: numeric("actual_earnings", { precision: 10, scale: 2 }),
  actualMiles: numeric("actual_miles", { precision: 8, scale: 1 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Financial Ledger: Income Transactions
export const incomeRecords = pgTable("income_records", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  date: text("date").notNull(),
  timePeriod: text("time_period"), // 'Lunch Rush', 'Dinner Session'
  grossAmount: numeric("gross_amount", { precision: 10, scale: 2 }).notNull(),
  tipsAmount: numeric("tips_amount", { precision: 10, scale: 2 }).default("0.00"),
  platformFees: numeric("platform_fees", { precision: 10, scale: 2 }).default("0.00"),
  netPayout: numeric("net_payout", { precision: 10, scale: 2 }).notNull(),
  milesDriven: numeric("miles_driven", { precision: 8, scale: 1 }).notNull().default("0.0"),
  hoursWorked: numeric("hours_worked", { precision: 5, scale: 2 }).notNull().default("0.00"),
  status: text("status").notNull().default("verified"), // 'verified', 'pending_deposit', 'reconciled'
  sourceReference: text("source_reference"),
  sourceType: text("source_type").notNull().default("csv_import"), // 'direct_connector', 'csv_import', 'manual_entry'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 7. Financial Ledger: Expenses & Deductions
export const expenseRecords = pgTable("expense_records", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  merchant: text("merchant").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // 'fuel', 'vehicle_maintenance', 'supplies', 'phone_internet', 'software_subscriptions', 'insurance'
  paymentMethod: text("payment_method").notNull().default("Business Visa *4912"),
  businessPurpose: text("business_purpose").notNull(),
  businessUsePercent: numeric("business_use_percent", { precision: 5, scale: 2 }).notNull().default("100.00"),
  deductiblePortion: numeric("deductible_portion", { precision: 10, scale: 2 }).notNull(),
  receiptUrl: text("receipt_url"),
  receiptOcrRaw: text("receipt_ocr_raw"),
  confidenceLevel: text("confidence_level").notNull().default("high"), // 'high', 'needs_review', 'verified'
  status: text("status").notNull().default("approved"), // 'approved', 'flagged_review', 'reconciled'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. Mileage Log Trips
export const mileageTrips = pgTable("mileage_trips", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  platform: text("platform").notNull(),
  startOdometer: numeric("start_odometer", { precision: 10, scale: 1 }).notNull(),
  endOdometer: numeric("end_odometer", { precision: 10, scale: 1 }).notNull(),
  businessMiles: numeric("business_miles", { precision: 8, scale: 1 }).notNull(),
  personalMiles: numeric("personal_miles", { precision: 8, scale: 1 }).default("0.0"),
  purpose: text("purpose").notNull().default("On-demand food delivery shift"),
  startLocation: text("start_location").default("HQ Hub / Westside"),
  endLocation: text("end_location").default("Central Zone"),
  standardDeductionValue: numeric("standard_deduction_value", { precision: 10, scale: 2 }).notNull(),
  loggedVia: text("logged_via").notNull().default("telemetry_auto"), // 'telemetry_auto', 'manual_entry', 'trip_export'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9. Platform Connectors Health & Sync State
export const platformConnectors = pgTable("platform_connectors", {
  id: serial("id").primaryKey(),
  connectorKey: text("connector_key").notNull().unique(), // 'uber_eats', 'doordash', 'crew', 'bank_feed', 'mileage_tracker', 'receipt_ocr'
  name: text("name").notNull(),
  connectorType: text("connector_type").notNull(), // 'approved_api', 'csv_statement_pipeline', 'webhook_feed', 'local_ocr'
  status: text("status").notNull().default("healthy"), // 'healthy', 'needs_attention', 'paused', 'action_required'
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  syncItemCount: integer("sync_item_count").default(0),
  authExpiry: text("auth_expiry"),
  errorMessage: text("error_message"),
  diagnostics: jsonb("diagnostics").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 10. Self-Healing Incident Logs
export const selfHealingLogs = pgTable("self_healing_logs", {
  id: serial("id").primaryKey(),
  incidentCode: text("incident_code").notNull(), // 'SHIFT_DROPPED', 'RATE_ANOMALY', 'MILEAGE_DISCREPANCY', 'TARGET_GAP_DETECTED', 'DUPLICATE_TX_FLAGGED'
  stage: text("stage").notNull().default("repaired"), // 'detected' -> 'diagnosed' -> 'recalculating' -> 'repaired'
  summary: text("summary").notNull(),
  details: text("details").notNull(),
  actionTaken: text("action_taken").notNull(),
  impactAmount: numeric("impact_amount", { precision: 10, scale: 2 }).default("0.00"),
  userNotified: boolean("user_notified").notNull().default(true),
  requiresUserConfirmation: boolean("requires_user_confirmation").notNull().default(false),
  confirmedByUser: boolean("confirmed_by_user").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 11. AI Operations Manager Messages / Conversations
export const aiOpsMessages = pgTable("ai_ops_messages", {
  id: serial("id").primaryKey(),
  sender: text("sender").notNull(), // 'user' or 'nova'
  message: text("message").notNull(),
  contextCard: jsonb("context_card"), // Structured payload for recommendations, graphs, or action buttons
  createdAt: timestamp("created_at").defaultNow().notNull(),
});