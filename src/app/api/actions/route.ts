import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  scheduleEvents,
  opportunities,
  selfHealingLogs,
  businessProfiles,
  incomeRecords,
  mileageTrips,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    const todayStr = new Date().toISOString().split("T")[0];

    // Scenario 1: Auto-build shift from highest ranked opportunity
    if (action === "BUILD_MY_SHIFT") {
      const topOpps = await db.select().from(opportunities).where(eq(opportunities.status, "available"));
      if (topOpps.length === 0) {
        return NextResponse.json({ success: false, message: "No available opportunities found" });
      }

      // Pick top scored
      const selected = topOpps.sort((a, b) => b.score - a.score)[0];

      // Insert into schedule
      await db.insert(scheduleEvents).values({
        opportunityId: selected.id,
        title: `${selected.platform} - ${selected.title}`,
        platform: selected.platform,
        eventType: selected.opportunityType === "fixed_commitment" ? "fixed_commitment" : "flexible_gig",
        date: selected.date,
        startTime: selected.startTime,
        endTime: selected.endTime,
        status: "confirmed",
        projectedEarnings: selected.expectedEarnings,
        projectedMiles: selected.expectedMiles,
        notes: `Auto-built shift based on Opportunity Engine recommendation: ${selected.recommendationReason}`,
      });

      // Update opportunity state
      await db.update(opportunities).set({ status: "scheduled" }).where(eq(opportunities.id, selected.id));

      // Award XP
      const profiles = await db.select().from(businessProfiles).limit(1);
      if (profiles.length > 0) {
        await db
          .update(businessProfiles)
          .set({ xpPoints: (profiles[0].xpPoints || 0) + 150 })
          .where(eq(businessProfiles.id, profiles[0].id));
      }

      // Log self-healing log entry
      await db.insert(selfHealingLogs).values({
        incidentCode: "SHIFT_AUTO_OPTIMIZED",
        stage: "repaired",
        summary: `Shift automatically built: ${selected.platform} (${selected.startTime}-${selected.endTime})`,
        details: `Engine scheduled ${selected.title} yielding projected $${selected.expectedEarnings} at $${selected.grossHourlyRate}/hr.`,
        actionTaken: "Shift booked to Master Schedule, conflicts cleared, route pre-calculated.",
        impactAmount: selected.expectedEarnings,
        userNotified: true,
      });

      return NextResponse.json({
        success: true,
        message: `Shift built! Scheduled ${selected.platform} from ${selected.startTime} to ${selected.endTime}. +150 XP awarded!`,
      });
    }

    // Scenario 2: Simulate Self-Healing Event: "Crew Shift Dropped by Dispatcher"
    if (action === "SIMULATE_CREW_DROP") {
      // Find a completed or confirmed crew event and mark cancelled/healed
      const crewEvents = await db.select().from(scheduleEvents).where(eq(scheduleEvents.platform, "Crew"));
      if (crewEvents.length > 0) {
        const target = crewEvents[0];
        await db
          .update(scheduleEvents)
          .set({
            status: "cancelled_healed",
            notes: "Warehouse container delayed: shift cancelled by dispatch webhook. Self-healing engine activated.",
          })
          .where(eq(scheduleEvents.id, target.id));
      }

      // Automatically find or create replacement DoorDash rush
      const replacementTitle = "Westside Peak Wave (Replacement Shift)";
      await db.insert(opportunities).values({
        platform: "DoorDash",
        opportunityType: "flexible_marketplace",
        title: replacementTitle,
        startTime: "17:00",
        endTime: "20:30",
        date: todayStr,
        expectedEarnings: "92.00",
        expectedMiles: "28.0",
        estimatedFuelCost: "3.78",
        estimatedNetProfit: "88.22",
        grossHourlyRate: "26.28",
        netHourlyRate: "25.20",
        score: 98,
        status: "available",
        source: "api_sync",
        zone: "Westside High-Demand Sector",
        recommendationReason: "🚨 Self-healing replacement: Replaces lost Crew shift ($68.25) with high-yield $92.00 DoorDash window.",
      });

      // Self-healing log
      await db.insert(selfHealingLogs).values({
        incidentCode: "SHIFT_DROPPED_SELF_HEALED",
        stage: "repaired",
        summary: "Crew dispatch shift dropped -> Instant high-yield DoorDash replacement generated",
        details: "Crew cancelled scheduled commitment. System freed calendar, scanned active marketplace surge data, and staged a $92.00 replacement shift.",
        actionTaken: "Calendar updated, target revenue preserved, user alerted.",
        impactAmount: "92.00",
        userNotified: true,
        requiresUserConfirmation: true,
        confirmedByUser: false,
      });

      return NextResponse.json({
        success: true,
        message: "Self-healing triggered: Detected Crew shift drop -> Staged high-yield DoorDash replacement ($92.00) to protect revenue!",
      });
    }

    // Scenario 3: Complete a shift, log telemetry & award XP
    if (action === "COMPLETE_SHIFT") {
      const { eventId, actualEarnings, actualMiles } = payload;
      await db
        .update(scheduleEvents)
        .set({
          status: "completed",
          actualEarnings: String(actualEarnings),
          actualMiles: String(actualMiles),
        })
        .where(eq(scheduleEvents.id, eventId));

      // Add to income records
      await db.insert(incomeRecords).values({
        platform: payload.platform || "DoorDash",
        date: todayStr,
        timePeriod: "Completed Shift",
        grossAmount: String(actualEarnings),
        tipsAmount: "12.00",
        platformFees: "0.00",
        netPayout: String(actualEarnings),
        milesDriven: String(actualMiles),
        hoursWorked: "3.00",
        status: "verified",
        sourceReference: `SHIFT-COMP-${Date.now().toString().slice(-6)}`,
        sourceType: "direct_connector",
      });

      // Add mileage trip
      await db.insert(mileageTrips).values({
        date: todayStr,
        platform: payload.platform || "DoorDash",
        startOdometer: "45328.4",
        endOdometer: String(45328.4 + Number(actualMiles)),
        businessMiles: String(actualMiles),
        personalMiles: "0.0",
        purpose: "Delivery Shift Telemetry Run",
        standardDeductionValue: String((Number(actualMiles) * 0.67).toFixed(2)),
        loggedVia: "telemetry_auto",
      });

      // Award XP
      const profiles = await db.select().from(businessProfiles).limit(1);
      if (profiles.length > 0) {
        await db
          .update(businessProfiles)
          .set({ xpPoints: (profiles[0].xpPoints || 0) + 200 })
          .where(eq(businessProfiles.id, profiles[0].id));
      }

      return NextResponse.json({
        success: true,
        message: `Shift verified and locked! $${actualEarnings} added to Gross Revenue. Telemetry recorded ${actualMiles} mi. +200 XP!`,
      });
    }

    // Scenario 4: User confirms self-healing recommendation
    if (action === "CONFIRM_HEAL_LOG") {
      const { logId } = payload;
      await db
        .update(selfHealingLogs)
        .set({ confirmedByUser: true, stage: "repaired" })
        .where(eq(selfHealingLogs.id, logId));

      return NextResponse.json({ success: true, message: "Healing decision confirmed and recorded in audit log." });
    }

    return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Action error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}