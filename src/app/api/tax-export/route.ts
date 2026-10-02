import { NextResponse } from "next/server";
import { db } from "@/db";
import { businessProfiles, incomeRecords, expenseRecords, mileageTrips, scheduleEvents, vehicles } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    const [profiles, incomes, expenses, trips, vehiclesList] = await Promise.all([
      db.select().from(businessProfiles).limit(1),
      db.select().from(incomeRecords).orderBy(desc(incomeRecords.date)),
      db.select().from(expenseRecords).orderBy(desc(expenseRecords.date)),
      db.select().from(mileageTrips).orderBy(desc(mileageTrips.date)),
      db.select().from(vehicles),
    ]);

    const profile = profiles[0] || {};
    const totalGross = incomes.reduce((acc, i) => acc + Number(i.grossAmount || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.deductiblePortion || 0), 0);
    const totalMiles = trips.reduce((acc, t) => acc + Number(t.businessMiles || 0), 0);
    const standardMileageDeduction = totalMiles * Number(profile.estMileageDeductionRate || 0.67);
    const netBusinessProfit = Math.max(0, totalGross - totalExpenses);

    // Grouping for Schedule C style breakdown
    const platformBreakdown: Record<string, number> = {};
    for (const inc of incomes) {
      platformBreakdown[inc.platform] = (platformBreakdown[inc.platform] || 0) + Number(inc.grossAmount || 0);
    }

    const expenseCategoryBreakdown: Record<string, number> = {};
    for (const exp of expenses) {
      expenseCategoryBreakdown[exp.category] = (expenseCategoryBreakdown[exp.category] || 0) + Number(exp.deductiblePortion || 0);
    }

    const reportData = {
      taxYear: 2026,
      generatedAt: new Date().toISOString(),
      businessEntity: {
        legalName: profile.businessName || "Apex Direct Logistics LLC",
        structure: profile.legalStructure || "Single-Member LLC",
        state: profile.stateOfRegistration || "California",
        einMasked: profile.einMasked || "XX-XXX8921",
        taxClassification: "Disregarded Entity / Schedule C (Form 1040)",
      },
      summary: {
        grossReceiptsSales: totalGross.toFixed(2),
        totalOrdinaryExpenses: totalExpenses.toFixed(2),
        estimatedNetBusinessProfit: netBusinessProfit.toFixed(2),
        businessMilesLogged: totalMiles.toFixed(1),
        standardMileageDeductionValue: standardMileageDeduction.toFixed(2),
        taxReserveTarget25Pct: (totalGross * 0.25).toFixed(2),
      },
      channelRevenueBreakdown: platformBreakdown,
      expenseDeductionsBreakdown: expenseCategoryBreakdown,
      primaryVehicle: vehiclesList[0] || null,
      disclaimer:
        "LEGAL & TAX NOTICE: This export package contains organized business telemetry, digital ledgers, and audit-ready receipt records for review by your certified tax professional (CPA / Enrolled Agent). It is not an official filed tax return.",
    };

    if (format === "csv") {
      let csv = "Category,Transaction Date,Entity / Merchant,Amount,Deductible Portion,Notes\n";
      for (const i of incomes) {
        csv += `Revenue,${i.date},${i.platform},${i.grossAmount},${i.grossAmount},"${i.sourceReference || 'Platform Payout'}"\n`;
      }
      for (const e of expenses) {
        csv += `Expense,${e.date},"${e.merchant}",${e.amount},${e.deductiblePortion},"${e.businessPurpose}"\n`;
      }
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="2026_Tax_Package_Apex_Logistics.csv"',
        },
      });
    }

    return NextResponse.json({ success: true, taxPackage: reportData });
  } catch (error: any) {
    console.error("Tax package export error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}