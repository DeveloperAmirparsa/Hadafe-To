/**
 * Data Normalizer for Daily PDF Report Engine
 * Produces a single, validated DailyReportData object strictly from real application data.
 */
import {
  Student,
  PlanTask,
  SessionReport,
  Habit,
  HabitLog,
  FocusPointTransaction,
} from '../../types/index.js';
import { formatIsoToJalaliDetails, formatPersianTime, toPersianDigits } from '../../utils/persianDate.js';
import { DailyReportData, HabitItem, ReportPeriod } from './types.js';

export function computeTestScorePercentage(correct: number, wrong: number, total: number): number {
  if (total <= 0) return 0;
  const raw = ((correct - wrong / 3) / total) * 100;
  return Math.round(Math.max(-33.33, Math.min(100, raw)) * 10) / 10;
}

export function normalizeDailyReportData(
  student: Student,
  date: string,
  allTasks: PlanTask[],
  allReports: SessionReport[],
  allHabits: Habit[] = [],
  allHabitLogs: HabitLog[] = [],
  allTransactions: FocusPointTransaction[] = []
): DailyReportData {
  const jalali = formatIsoToJalaliDetails(date);

  // 1. Tasks for selected student and date
  const dayTasks = allTasks
    .filter((t) => t.studentId === student.id && t.date === date)
    .slice()
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

  // 2. Reports matching tasks or date (strictly indexed by taskId)
  const reportsByTaskId: Record<string, SessionReport> = {};

  // Strictly index student's reports by taskId
  const studentReports = allReports.filter(
    (r) => r && (!r.studentId || r.studentId === student.id)
  );

  // Sort by createdAt ascending so latest report takes precedence
  const sortedReports = [...studentReports].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeA - timeB;
  });

  sortedReports.forEach((r) => {
    if (r.taskId) {
      reportsByTaskId[r.taskId] = r;
    }
  });

  // Support tasks referencing sessionReportId
  dayTasks.forEach((t) => {
    if (t.sessionReportId && !reportsByTaskId[t.id]) {
      const matched = sortedReports.find((r) => r.id === t.sessionReportId);
      if (matched) {
        reportsByTaskId[t.id] = matched;
      }
    }
  });

  // Reports strictly associated with this day's tasks
  const matchedTaskReports = dayTasks
    .map((t) => reportsByTaskId[t.id])
    .filter((r): r is SessionReport => Boolean(r));

  // Include any other student reports specifically for this date
  const otherDateReports = sortedReports.filter(
    (r) => r.date === date && !matchedTaskReports.some((m) => m.id === r.id)
  );

  const dayReports = [...matchedTaskReports, ...otherDateReports];

  // 3. Task completion states
  const completedTasks = dayTasks.filter((t) => t.isCompleted);
  const missedTasks = dayTasks.filter(
    (t) => !t.isCompleted && t.status === 'MISSED'
  );

  // 4. Study times
  const plannedStudyMinutes = dayTasks.reduce(
    (acc, t) => acc + (t.durationMinutes || 0),
    0
  );
  const actualStudyMinutes = dayTasks.reduce((acc, t) => {
    if (!t.isCompleted) return acc;
    // Use report's actualDurationMinutes if available, otherwise task's actualDurationMinutes, otherwise planned duration
    const report = reportsByTaskId[t.id];
    const reportActualDuration = report?.actualDurationMinutes;
    const taskActualDuration = t.actualDurationMinutes;
    return acc + (reportActualDuration ?? taskActualDuration ?? (t.durationMinutes || 0));
  }, 0);

  const dailyGoalMinutes = student.dailyStudyGoalMinutes || 0;
  const dailyGoalProgressPct =
    dailyGoalMinutes > 0
      ? Math.min(100, Math.round((actualStudyMinutes / dailyGoalMinutes) * 100))
      : null;

  const planCompletionRate =
    dayTasks.length > 0
      ? Math.round((completedTasks.length / dayTasks.length) * 100)
      : 0;

  // 5. Test results aggregation
  let totalTestsCount = 0;
  let totalCorrectTests = 0;
  let totalWrongTests = 0;
  let totalBlankTests = 0;
  const testPercentages: number[] = [];

  dayReports.forEach((r) => {
    const count = typeof r.testResult?.total === 'number'
      ? r.testResult.total
      : typeof r.testsCount === 'number'
      ? r.testsCount
      : 0;
    totalTestsCount += count;
    if (r.testResult) {
      const { correct = 0, wrong = 0, unanswered = 0, percentage } = r.testResult;
      totalCorrectTests += correct;
      totalWrongTests += wrong;
      totalBlankTests += unanswered;
      if (typeof percentage === 'number') {
        testPercentages.push(percentage);
      } else if (r.testResult.total > 0) {
        testPercentages.push(computeTestScorePercentage(correct, wrong, r.testResult.total));
      }
    }
  });

  const averageTestPercentage =
    testPercentages.length > 0
      ? Math.round(
          testPercentages.reduce((a, b) => a + b, 0) / testPercentages.length
        )
      : null;

  // 6. Focus, Satisfaction, Difficulty
  const validFocusReports = dayReports.filter(
    (r) => typeof r.focus === 'number' && r.focus > 0
  );
  const averageFocus =
    validFocusReports.length > 0
      ? Math.round(
          (validFocusReports.reduce((a, r) => a + r.focus, 0) /
            validFocusReports.length) *
            10
        ) / 10
      : null;

  const validSatReports = dayReports.filter(
    (r) => typeof r.satisfaction === 'number' && r.satisfaction > 0
  );
  const averageSatisfaction =
    validSatReports.length > 0
      ? Math.round(
          (validSatReports.reduce((a, r) => a + r.satisfaction, 0) /
            validSatReports.length) *
            10
        ) / 10
      : null;

  const validDiffReports = dayReports.filter(
    (r) => typeof r.difficulty === 'number' && r.difficulty > 0
  );
  const averageDifficulty =
    validDiffReports.length > 0
      ? Math.round(
          (validDiffReports.reduce((a, r) => a + r.difficulty, 0) /
            validDiffReports.length) *
            10
        ) / 10
      : null;

  // 7. Habits
  const studentDayLogs = allHabitLogs.filter(
    (l) => l.studentId === student.id && l.date === date
  );
  const logsByHabitId = new Map(studentDayLogs.map((l) => [l.habitId, l]));

  const activeHabits = allHabits.filter((h) => h.active);
  const habitsList: HabitItem[] = activeHabits.map((h) => {
    const log = logsByHabitId.get(h.id);
    return {
      id: h.id,
      title: h.title,
      category: h.category,
      completed: Boolean(log?.completed),
    };
  });

  const completedHabitsCount = habitsList.filter((h) => h.completed).length;

  // 8. Focus Points earned on this date
  const dayTx = allTransactions.filter(
    (tx) => tx.studentId === student.id && tx.createdAt?.startsWith(date)
  );
  let focusPointsEarned = dayTx.reduce((acc, tx) => acc + (tx.amount || 0), 0);
  if (focusPointsEarned === 0) {
    // If no transactions tracked, sum focus points reported directly on reports
    focusPointsEarned = dayReports.reduce(
      (acc, r) => acc + (r.focusPointsEarned || 0),
      0
    );
  }

  // 9. Notes from session reports
  const notes = dayReports
    .map((r) => r.reflectionNote?.trim())
    .filter((n): n is string => Boolean(n && n.length > 0));

  // 10. Goals
  const goals = student.goals || [];

  // 11. Strengths (Algorithmically derived from real data ONLY)
  const strengths: string[] = [];
  if (planCompletionRate === 100 && dayTasks.length > 0) {
    strengths.push('تکمیل ۱۰۰٪ کلیه پارت‌های برنامه‌ریزی‌شده روزانه بدون اتلاف وقت');
  } else if (planCompletionRate >= 80 && dayTasks.length > 0) {
    strengths.push(`نرخ تکمیل بالای برنامه درسی (${toPersianDigits(planCompletionRate)}٪)`);
  }

  if (actualStudyMinutes > 0 && dailyGoalMinutes > 0 && actualStudyMinutes >= dailyGoalMinutes) {
    strengths.push(`تحقق کامل هدف کمی مطالعه روزانه (${toPersianDigits(Math.round(actualStudyMinutes / 60))} ساعت مطالعه خالص)`);
  }

  if (averageTestPercentage !== null && averageTestPercentage >= 75) {
    strengths.push(`عملکرد تست‌زنی درخشان با میانگین تراز و درصد ${toPersianDigits(averageTestPercentage)}٪`);
  }

  if (averageFocus !== null && averageFocus >= 4.0) {
    strengths.push(`شاخص تمرکز عمیق بالا (میانگین ${toPersianDigits(averageFocus)} از ۵) در طول جلسات`);
  }

  if (student.streak >= 7) {
    strengths.push(`حفظ ریتم استمرار بی‌وقفه به مدت ${toPersianDigits(student.streak)} روز متوالی`);
  }

  if (habitsList.length > 0 && completedHabitsCount === habitsList.length) {
    strengths.push('انجام تمامی عادات و روتین‌های روزانه برنامه‌ریزی‌شده');
  }

  // 12. Areas For Attention (Derived from real facts only)
  const areasForAttention: string[] = [];
  if (missedTasks.length > 0) {
    areasForAttention.push(`${toPersianDigits(missedTasks.length)} پارت از برنامه‌ریزی روزانه به وضعیت ناتمام/از دست رفته درآمده است`);
  }

  if (averageTestPercentage !== null && averageTestPercentage < 50) {
    areasForAttention.push(`میانگین درصد پاسخگویی تست‌ها (${toPersianDigits(averageTestPercentage)}٪) نیازمند بازبینی و تحلیل آزمون است`);
  }

  if (totalWrongTests > 0 && totalTestsCount > 0 && (totalWrongTests / totalTestsCount) > 0.3) {
    const wrongPct = Math.round((totalWrongTests / totalTestsCount) * 100);
    areasForAttention.push(`نسبت تست‌های نادرست بالاست (${toPersianDigits(wrongPct)}٪)؛ نیاز به مدیریت نمره منفی و شک‌دارها`);
  }

  if (actualStudyMinutes > 0 && dailyGoalMinutes > 0 && actualStudyMinutes < dailyGoalMinutes * 0.7) {
    areasForAttention.push(`ساعت مطالعه تحقق‌یافته کمتر از هدف تعیین‌شده مشاور است (${toPersianDigits(Math.round(actualStudyMinutes / 60))} ساعت از ${toPersianDigits(Math.round(dailyGoalMinutes / 60))} ساعت)`);
  }

  if (averageFocus !== null && averageFocus < 3.0) {
    areasForAttention.push(`شاخص تمرکز جلسات در سطح متوسط به پایین ارزیابی شده است (${toPersianDigits(averageFocus)} از ۵)`);
  }

  return {
    student,
    reportPeriod: 'daily',
    periodStartDate: date,
    periodEndDate: date,
    periodDayCount: 1,
    periodLabel: jalali.fullDate,
    date,
    jalaliFormatted: jalali.jalaliFormatted,
    dayOfWeekName: jalali.dayName,
    fullJalaliDate: jalali.fullDate,
    fileDateString: jalali.fileDateString,
    tasks: dayTasks,
    completedTasks,
    missedTasks,
    sessionReports: dayReports,
    reportsByTaskId,
    plannedStudyMinutes,
    actualStudyMinutes,
    dailyGoalMinutes,
    dailyGoalProgressPct,
    planCompletionRate,
    totalTestsCount,
    totalCorrectTests,
    totalWrongTests,
    totalBlankTests,
    averageTestPercentage,
    averageFocus,
    averageSatisfaction,
    averageDifficulty,
    habits: habitsList,
    completedHabitsCount,
    totalHabitsCount: habitsList.length,
    focusPointsEarned,
    totalFocusPoints: student.focusPoints || 0,
    streak: student.streak || 0,
    goals,
    notes,
    strengths,
    areasForAttention,
  };
}

export function normalizeReportPeriodData(
  student: Student,
  startDate: string,
  endDate: string,
  reportPeriod: ReportPeriod,
  allTasks: PlanTask[],
  allReports: SessionReport[],
  allHabits: Habit[] = [],
  allHabitLogs: HabitLog[] = [],
  allTransactions: FocusPointTransaction[] = []
): DailyReportData {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const days: string[] = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    days.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`);
  }

  const dailyData = days.map((date) =>
    normalizeDailyReportData(
      student,
      date,
      allTasks,
      allReports,
      allHabits,
      allHabitLogs,
      allTransactions
    )
  );
  const firstDay = dailyData[0];
  if (!firstDay) {
    return normalizeDailyReportData(
      student,
      startDate,
      allTasks,
      allReports,
      allHabits,
      allHabitLogs,
      allTransactions
    );
  }
  if (reportPeriod === 'daily') return firstDay;

  const tasks = dailyData
    .flatMap((day) => day.tasks)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.order ?? 9999) - (b.order ?? 9999));
  const completedTasks = tasks.filter((task) => task.isCompleted);
  const missedTasks = tasks.filter((task) => !task.isCompleted && task.status === 'MISSED');
  const reportsByTaskId = Object.assign({}, ...dailyData.map((day) => day.reportsByTaskId));
  const reportMap = new Map<string, SessionReport>();
  dailyData.flatMap((day) => day.sessionReports).forEach((report, index) => {
    reportMap.set(report.id || `${report.taskId || 'report'}-${report.date || index}`, report);
  });
  const sessionReports = [...reportMap.values()];
  const plannedStudyMinutes = tasks.reduce((sum, task) => sum + (task.durationMinutes || 0), 0);
  const actualStudyMinutes = tasks.reduce((sum, task) => {
    if (!task.isCompleted) return sum;
    // Use report's actualDurationMinutes if available, otherwise task's actualDurationMinutes, otherwise planned duration
    const report = reportMap.get(task.id);
    const reportActualDuration = report?.actualDurationMinutes;
    const taskActualDuration = task.actualDurationMinutes;
    return sum + (reportActualDuration ?? taskActualDuration ?? (task.durationMinutes || 0));
  }, 0);
  const dailyGoalMinutes = (student.dailyStudyGoalMinutes || 0) * days.length;
  const dailyGoalProgressPct = dailyGoalMinutes > 0
    ? Math.min(100, Math.round((actualStudyMinutes / dailyGoalMinutes) * 100))
    : null;
  const planCompletionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  const totalTestsCount = dailyData.reduce((sum, day) => sum + day.totalTestsCount, 0);
  const totalCorrectTests = dailyData.reduce((sum, day) => sum + day.totalCorrectTests, 0);
  const totalWrongTests = dailyData.reduce((sum, day) => sum + day.totalWrongTests, 0);
  const totalBlankTests = dailyData.reduce((sum, day) => sum + day.totalBlankTests, 0);
  let weightedTestPercentage = 0;
  let testPercentageWeight = 0;
  for (const report of sessionReports) {
    const result = report.testResult;
    if (!result || result.total <= 0) continue;
    const percentage = typeof result.percentage === 'number'
      ? result.percentage
      : computeTestScorePercentage(result.correct || 0, result.wrong || 0, result.total);
    weightedTestPercentage += percentage * result.total;
    testPercentageWeight += result.total;
  }
  const averageTestPercentage = testPercentageWeight > 0
    ? Math.round(weightedTestPercentage / testPercentageWeight)
    : null;

  const averageOf = (select: (report: SessionReport) => number | undefined) => {
    const values = sessionReports
      .map(select)
      .filter((value): value is number => typeof value === 'number' && value > 0);
    return values.length > 0
      ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
      : null;
  };
  const averageFocus = averageOf((report) => report.focus);
  const averageSatisfaction = averageOf((report) => report.satisfaction);
  const averageDifficulty = averageOf((report) => report.difficulty);

  const habitCounts = new Map<string, { habit: HabitItem; completionCount: number }>();
  for (const day of dailyData) {
    for (const habit of day.habits) {
      const current = habitCounts.get(habit.id) || { habit, completionCount: 0 };
      if (habit.completed) current.completionCount++;
      habitCounts.set(habit.id, current);
    }
  }
  const habits: HabitItem[] = [...habitCounts.values()].map(({ habit, completionCount }) => ({
    ...habit,
    completed: completionCount === days.length,
    completionCount,
  }));
  const completedHabitsCount = dailyData.reduce((sum, day) => sum + day.completedHabitsCount, 0);
  const totalHabitsCount = dailyData.reduce((sum, day) => sum + day.totalHabitsCount, 0);
  const focusPointsEarned = dailyData.reduce((sum, day) => sum + day.focusPointsEarned, 0);
  const notes = sessionReports
    .map((report) => report.reflectionNote?.trim())
    .filter((note): note is string => Boolean(note));

  const periodName = reportPeriod === 'weekly' ? 'هفتگی' : 'ماهانه';
  const startDetails = formatIsoToJalaliDetails(startDate);
  const endDetails = formatIsoToJalaliDetails(endDate);
  const monthName = reportPeriod === 'monthly'
    ? new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long' }).format(start)
    : '';
  const periodLabel = reportPeriod === 'weekly'
    ? `${startDetails.jalaliFormatted} تا ${endDetails.jalaliFormatted}`
    : `${monthName} ${toPersianDigits(startDetails.jalaliYear)}`;
  const periodTitle = `گزارش عملکرد ${periodName}`;
  const strengths: string[] = [];
  const areasForAttention: string[] = [];

  if (tasks.length > 0 && planCompletionRate >= 80) {
    strengths.push(`نرخ تکمیل مناسب برنامه در بازه (${toPersianDigits(planCompletionRate)}٪)`);
  }
  if (dailyGoalMinutes > 0 && actualStudyMinutes >= dailyGoalMinutes) {
    strengths.push(`تحقق هدف مطالعه ${periodName} (${formatPersianTime(actualStudyMinutes)})`);
  }
  if (averageTestPercentage !== null && averageTestPercentage >= 75) {
    strengths.push(`میانگین درصد تست مطلوب در بازه (${toPersianDigits(averageTestPercentage)}٪)`);
  }
  if (averageFocus !== null && averageFocus >= 4) {
    strengths.push(`تمرکز مناسب در جلسات (${toPersianDigits(averageFocus)} از ۵)`);
  }
  if (completedHabitsCount > 0 && completedHabitsCount === totalHabitsCount) {
    strengths.push('تمام عادات ثبت‌شده در این بازه انجام شده‌اند');
  }
  if (missedTasks.length > 0) {
    areasForAttention.push(`${toPersianDigits(missedTasks.length)} پارت در این بازه انجام نشده است`);
  }
  if (averageTestPercentage !== null && averageTestPercentage < 50) {
    areasForAttention.push(`میانگین درصد تست بازه پایین است (${toPersianDigits(averageTestPercentage)}٪)`);
  }
  if (averageFocus !== null && averageFocus < 3) {
    areasForAttention.push(`میانگین تمرکز نیازمند بهبود است (${toPersianDigits(averageFocus)} از ۵)`);
  }

  return {
    ...firstDay,
    reportPeriod,
    periodStartDate: startDate,
    periodEndDate: endDate,
    periodDayCount: days.length,
    periodLabel,
    date: startDate,
    jalaliFormatted: periodLabel,
    dayOfWeekName: startDetails.dayName,
    fullJalaliDate: periodLabel,
    fileDateString: reportPeriod === 'weekly'
      ? `week-${startDetails.fileDateString}-${endDetails.fileDateString}`
      : `month-${startDetails.jalaliYear}-${String(startDetails.jalaliMonth).padStart(2, '0')}`,
    tasks,
    completedTasks,
    missedTasks,
    sessionReports,
    reportsByTaskId,
    plannedStudyMinutes,
    actualStudyMinutes,
    dailyGoalMinutes,
    dailyGoalProgressPct,
    planCompletionRate,
    totalTestsCount,
    totalCorrectTests,
    totalWrongTests,
    totalBlankTests,
    averageTestPercentage,
    averageFocus,
    averageSatisfaction,
    averageDifficulty,
    habits,
    completedHabitsCount,
    totalHabitsCount,
    focusPointsEarned,
    notes,
    strengths,
    areasForAttention,
  };
}

