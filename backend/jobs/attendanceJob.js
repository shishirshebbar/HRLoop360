import cron from "node-cron";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

// Utility function to calculate the difference between two Date objects in hours
const calculateHoursWorked = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  // Calculate difference in milliseconds, convert to hours, and round to 2 decimal places
  const diffMs = endTime.getTime() - startTime.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  return parseFloat(hours.toFixed(2));
};

/**
 * Executes the daily attendance processing logic.
 * This is the function that handles both marking absences and finalizing hours.
 */
const runNightlyAttendanceJob = async () => {
  // NOTE: The server's timezone for execution is set via the 'timezone' option in server.js
  console.log("--------------------------------------------------");
  console.log(
    `[Job] Running Nightly Attendance Job at ${new Date().toISOString()}`
  );

  try {
    // 1. Define the target day: Yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0); // Start of Yesterday (00:00:00)

    const startOfYesterday = yesterday;
    const startOfToday = new Date(yesterday);
    startOfToday.setDate(startOfToday.getDate() + 1); // Start of Today (00:00:00)

    // 2. Find ALL active employees with 'Employee' role for accurate absence checking
    const allEmployees = await User.find({ role: "Employee" }).select(
      "_id manager"
    );
    const employeeMap = allEmployees.reduce((acc, user) => {
      acc[user._id.toString()] = user.manager;
      return acc;
    }, {});
    const employeeIds = Object.keys(employeeMap);

    // 3. Find ALL attendance records for the target day
    const dayAttendanceRecords = await Attendance.find({
      date: { $gte: startOfYesterday, $lt: startOfToday },
    });

    // Convert to a map for quick lookup and to track present employees
    const recordedAttendanceMap = dayAttendanceRecords.reduce((acc, record) => {
      acc[record.employee.toString()] = record;
      return acc;
    }, {});

    const presentEmployeeIds = dayAttendanceRecords.map((a) =>
      a.employee.toString()
    );

    // ==========================================================
    // STEP A: PROCESS PRESENT EMPLOYEES (Calculate and Finalize Hours)
    // ==========================================================
    const updateOperations = [];
    const now = new Date();
    let incompleteCount = 0;

    for (const record of dayAttendanceRecords) {
      // Only process records that haven't been finalized (i.e., totalHours is null/missing)
      if (record.status !== "Absent" && !record.totalHours) {
        const clockIn = record.clockIn;
        // Use current time if clockOut is missing, to calculate maximum possible hours
        const clockOut = record.clockOut || now;

        // IMPORTANT: If clockOut is missing and the current time is past midnight,
        // the job assumes the shift ended at midnight for the purpose of the daily calculation.
        // For simplicity here, we assume the shift ended at the later of the two dates.
        const endTimeForCalculation = record.clockOut || startOfToday; // Cap the calculated time at midnight

        const totalHours = calculateHoursWorked(clockIn, endTimeForCalculation);

        let newStatus = record.status;

        if (!record.clockOut) {
          // Employee did not clock out! Mark as Incomplete/Pending for review
          newStatus = "Incomplete";
          incompleteCount++;
        } else if (totalHours > 0) {
          // Successfully clocked in and out
          newStatus = "Present";
        } else {
          // If totalHours is 0 (e.g., clockIn = clockOut, or error)
          newStatus = "Irregular";
        }

        updateOperations.push({
          updateOne: {
            filter: { _id: record._id },
            update: {
              $set: {
                totalHours: totalHours,
                status: newStatus,
                // If clockOut was missing, you might want to log the time the job ran
                // as a 'job_auto_end' field for auditing, but we'll skip that for brevity.
              },
            },
          },
        });
      }
    }

    if (updateOperations.length > 0) {
      await Attendance.bulkWrite(updateOperations);
      console.log(
        `[Job] ${updateOperations.length} attendance records finalized (${incompleteCount} marked as Incomplete).`
      );
    } else {
      console.log("[Job] No present records required hour finalization.");
    }

    // ==========================================================
    // STEP B: PROCESS ABSENT EMPLOYEES (Insert 'Absent' Record)
    // ==========================================================
    const absentEmployeeIds = employeeIds.filter(
      (id) => !presentEmployeeIds.includes(id)
    );

    if (absentEmployeeIds.length === 0) {
      console.log(
        `[Job] No absences detected for ${startOfYesterday.toDateString()}.`
      );
    } else {
      console.log(
        `[Job] ${absentEmployeeIds.length} employees found to be absent.`
      );

      const bulkAbsentOperations = absentEmployeeIds.map((employeeId) => ({
        // Ensure we don't accidentally insert a duplicate record if one already exists
        updateOne: {
          filter: { employee: employeeId, date: startOfYesterday },
          update: {
            $setOnInsert: {
              // Only insert if a matching record doesn't exist
              employee: employeeId,
              manager: employeeMap[employeeId] || null,
              date: startOfYesterday,
              status: "Absent",
              totalHours: 0,
            },
          },
          upsert: true, // Insert if no match is found
        },
      }));

      if (bulkAbsentOperations.length > 0) {
        await Attendance.bulkWrite(bulkAbsentOperations);
        console.log(
          `[Job] ${bulkAbsentOperations.length} 'Absent' records ensured/inserted.`
        );
      }
    }

    console.log("[Job] Nightly attendance job finished.");
  } catch (error) {
    console.error("[Job] ❌ CRITICAL ERROR running attendance job:", error);
  }
  console.log("--------------------------------------------------");
};

/**
 * The main exported function to start the cron job.
 */
export const startAttendanceJob = () => {
  // Cron schedule: "0 2 * * *" means 0 minutes, 2 hours, any day of month, any month, any day of week.
  // This runs at 2:00 AM (local time, as defined by the timezone setting).
  cron.schedule("0 2 * * *", runNightlyAttendanceJob, {
    scheduled: true,
    timezone: "Asia/Kolkata", // Set to Bengaluru/IST timezone
  });
  console.log(
    "[Job Scheduler] Attendance job initialized and scheduled for 2:00 AM IST."
  );
};

// Export the job-starting function as the default
export default startAttendanceJob;
