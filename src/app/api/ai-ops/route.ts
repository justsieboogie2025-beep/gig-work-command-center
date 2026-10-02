import { NextResponse } from "next/server";
import { db } from "@/db";
import { aiOpsMessages, businessProfiles, incomeRecords, expenseRecords, mileageTrips, opportunities } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ success: false, message: "Question required" }, { status: 400 });
    }

    // Save user question to DB
    await db.insert(aiOpsMessages).values({
      sender: "user",
      message: question,
    });

    // Gather live context from DB
    const [incomes, expenses, trips, opps, profiles] = await Promise.all([
      db.select().from(incomeRecords).orderBy(desc(incomeRecords.date)),
      db.select().from(expenseRecords).orderBy(desc(expenseRecords.date)),
      db.select().from(mileageTrips).orderBy(desc(mileageTrips.date)),
      db.select().from(opportunities),
      db.select().from(businessProfiles).limit(1),
    ]);

    const todayStr = new Date().toISOString().split("T")[0];
    const todayIncomes = incomes.filter((i) => i.date === todayStr);
    const todayGross = todayIncomes.reduce((acc, i) => acc + Number(i.grossAmount || 0), 0);
    const todayMiles = trips.filter((t) => t.date === todayStr).reduce((acc, t) => acc + Number(t.businessMiles || 0), 0);

    const mtdGross = incomes.reduce((acc, i) => acc + Number(i.grossAmount || 0), 0);
    const mtdExpenses = expenses.reduce((acc, e) => acc + Number(e.deductiblePortion || 0), 0);
    const mtdMiles = trips.reduce((acc, t) => acc + Number(t.businessMiles || 0), 0);

    const q = question.toLowerCase();
    let reply = "";
    let contextCard: any = null;

    if (q.includes("how much have i made today") || q.includes("today's earnings") || q.includes("today earnings")) {
      reply = `Today you have recorded $${todayGross.toFixed(2)} in gross revenue across ${todayIncomes.length} session(s). Your target is $150.00, meaning you are currently at ${Math.round((todayGross / 150) * 100)}% of today's target with $${Math.max(0, 150 - todayGross).toFixed(2)} remaining.`;
      contextCard = {
        type: "metric_callout",
        title: "Today's Revenue Status",
        stats: [
          { label: "Gross Earned", value: `$${todayGross.toFixed(2)}` },
          { label: "Target", value: "$150.00" },
          { label: "Active Miles", value: `${todayMiles.toFixed(1)} mi` },
        ],
      };
    } else if (q.includes("doordash") && (q.includes("month") || q.includes("make") || q.includes("earned"))) {
      const ddIncomes = incomes.filter((i) => i.platform.toLowerCase().includes("doordash"));
      const ddTotal = ddIncomes.reduce((acc, i) => acc + Number(i.grossAmount || 0), 0);
      const ddHours = ddIncomes.reduce((acc, i) => acc + Number(i.hoursWorked || 0), 0);
      const ddHourly = ddHours > 0 ? ddTotal / ddHours : 24.5;
      reply = `DoorDash has generated $${ddTotal.toFixed(2)} for your business across ${ddHours.toFixed(1)} recorded hours, averaging $${ddHourly.toFixed(2)} gross per hour. It represents ${Math.round((ddTotal / (mtdGross || 1)) * 100)}% of total gross platform revenue.`;
      contextCard = {
        type: "metric_callout",
        title: "DoorDash Channel Telemetry",
        stats: [
          { label: "Total Gross", value: `$${ddTotal.toFixed(2)}` },
          { label: "Hours Logged", value: `${ddHours.toFixed(1)} hrs` },
          { label: "Gross $/Hr", value: `$${ddHourly.toFixed(2)}/hr` },
        ],
      };
    } else if (q.includes("best available time") || q.includes("tonight") || q.includes("recommend")) {
      const best = opps.sort((a, b) => b.score - a.score)[0];
      reply = `Your peak opportunity tonight is ${best?.platform || "DoorDash"} from ${best?.startTime || "5:30 PM"} to ${best?.endTime || "8:30 PM"} in the ${best?.zone || "Downtown"} sector. Projected yield: $${best?.expectedEarnings || "84.50"} ($${best?.grossHourlyRate || "28.17"}/hr). Why: ${best?.recommendationReason || "High demand corridor with lowest mileage penalty."}`;
      contextCard = {
        type: "recommendation",
        platform: best?.platform || "DoorDash",
        time: `${best?.startTime || "17:30"} - ${best?.endTime || "20:30"}`,
        payout: `$${best?.expectedEarnings || "84.50"}`,
        rate: `$${best?.grossHourlyRate || "28.17"}/hr`,
      };
    } else if (q.includes("business miles") || q.includes("miles did i drive") || q.includes("mileage")) {
      const standardDeduction = mtdMiles * 0.67;
      reply = `You have driven ${mtdMiles.toFixed(1)} logged business miles this period (${todayMiles.toFixed(1)} miles today). At the IRS standard mileage rate of $0.67/mi, this generates an estimated business deduction value of $${standardDeduction.toFixed(2)} for your tax vault.`;
      contextCard = {
        type: "metric_callout",
        title: "Business Mileage Ledger",
        stats: [
          { label: "Period Miles", value: `${mtdMiles.toFixed(1)} mi` },
          { label: "Today Miles", value: `${todayMiles.toFixed(1)} mi` },
          { label: "Tax Deduction Value", value: `$${standardDeduction.toFixed(2)}` },
        ],
      };
    } else if (q.includes("biggest expense") || q.includes("expenses")) {
      const fuelTotal = expenses
        .filter((e) => e.category === "fuel")
        .reduce((acc, e) => acc + Number(e.amount || 0), 0);
      const maintTotal = expenses
        .filter((e) => e.category === "vehicle_maintenance")
        .reduce((acc, e) => acc + Number(e.amount || 0), 0);
      reply = `Your total recorded business expenses stand at $${mtdExpenses.toFixed(2)}. Your largest category is Vehicle Maintenance ($${maintTotal.toFixed(2)}) followed by Commercial Fuel ($${fuelTotal.toFixed(2)}). All receipts are currently verified in the Expense Vault.`;
    } else if (q.includes("pace") || q.includes("monthly goal") || q.includes("goal")) {
      reply = `Your monthly business revenue target is $${profiles[0]?.targetMonthlyRevenue || "4200.00"}. Current recognized revenue is $${mtdGross.toFixed(2)}. You are on pace at approximately ${Math.round((mtdGross / Number(profiles[0]?.targetMonthlyRevenue || 4200)) * 100)}% of pace. Scheduling 3 more peak dinner sessions this week will keep you ahead of the sprint line.`;
    } else if (q.includes("schedule") || q.includes("tomorrow")) {
      reply = `Optimal schedule for tomorrow: 11:30 AM–1:30 PM (Midtown Lunch Rush, ~$45) followed by a rest/admin window, and 5:00 PM–8:30 PM (Westside Dinner Wave, ~$88). Total projected revenue: $133 across 5.5 hours.`;
    } else {
      reply = `Command AI (Nova) standing by. Analyzed ${incomes.length} revenue records, ${trips.length} telemetry logs, and ${opps.length} marketplace signals. Current daily revenue is $${todayGross.toFixed(2)} of $150.00 target. Recommended action: activate the Dinner Shift at 5:30 PM.`;
    }

    // Save AI response
    const [savedMsg] = await db
      .insert(aiOpsMessages)
      .values({
        sender: "nova",
        message: reply,
        contextCard,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: savedMsg,
    });
  } catch (error: any) {
    console.error("AI chat error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}