import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SLACalculationOptions {
  departmentId?: number;
  unitId?: number;
  timezone?: string;
  businessHoursOnly?: boolean;
}

export interface SLACalculationResult {
  dueDate: Date;
  businessMinutesRemaining: number;
  totalMinutesRemaining: number;
  isOverdue: boolean;
  nextBusinessHourStart?: Date;
  isCurrentlyInBusinessHours: boolean;
  holidaysSkipped: string[];
}

export class SLACalculator {
  private static instance: SLACalculator;
  private businessHoursCache: Map<string, any[]> = new Map();
  private holidaysCache: Map<string, any[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  public static getInstance(): SLACalculator {
    if (!SLACalculator.instance) {
      SLACalculator.instance = new SLACalculator();
    }
    return SLACalculator.instance;
  }

  private constructor() {}

  /**
   * Calculate SLA due date considering business hours and holidays
   */
  async calculateSLADueDate(
    startDate: Date,
    slaMinutes: number,
    options: SLACalculationOptions = {}
  ): Promise<SLACalculationResult> {
    const {
      departmentId,
      unitId,
      timezone = 'Asia/Jakarta',
      businessHoursOnly = true
    } = options;

    if (!businessHoursOnly) {
      // Simple calculation: just add minutes to start date
      const dueDate = new Date(startDate.getTime() + slaMinutes * 60 * 1000);
      const now = new Date();
      const remainingMinutes = Math.max(0, (dueDate.getTime() - now.getTime()) / (60 * 1000));

      return {
        dueDate,
        businessMinutesRemaining: remainingMinutes,
        totalMinutesRemaining: remainingMinutes,
        isOverdue: now > dueDate,
        isCurrentlyInBusinessHours: true,
        holidaysSkipped: []
      };
    }

    // Business hours calculation
    const businessHours = await this.getBusinessHours(departmentId, unitId);
    const holidays = await this.getHolidays(departmentId, unitId);

    if (businessHours.length === 0) {
      throw new Error('No business hours configuration found');
    }

    let currentDate = new Date(startDate);
    let remainingSlaMinutes = slaMinutes;
    const holidaysSkipped: string[] = [];

    // Find the due date by iterating through business days
    while (remainingSlaMinutes > 0) {
      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toISOString().split('T')[0];

      // Check if current date is a holiday
      if (this.isHoliday(holidays, currentDate)) {
        holidaysSkipped.push(dateString);
        // Move to next day
        currentDate = this.addDays(currentDate, 1);
        currentDate = this.setTimeToStartOfDay(currentDate);
        continue;
      }

      // Find business hours for this day
      const dayBusinessHours = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
      
      if (!dayBusinessHours) {
        // No business hours for this day, move to next day
        currentDate = this.addDays(currentDate, 1);
        currentDate = this.setTimeToStartOfDay(currentDate);
        continue;
      }

      const businessStart = this.parseTimeString(dayBusinessHours.startTime);
      const businessEnd = this.parseTimeString(dayBusinessHours.endTime);
      
      // Calculate available business minutes for this day
      let dayStartTime: Date;
      let dayEndTime: Date;

      if (this.isSameDay(currentDate, startDate)) {
        // First day: start from the later of start time or business hours start
        const currentTimeMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
        dayStartTime = new Date(currentDate);
        
        if (currentTimeMinutes < businessStart) {
          // Before business hours, start from business hours start
          dayStartTime.setHours(Math.floor(businessStart / 60), businessStart % 60, 0, 0);
        }
        // If after business hours, move to next day
        else if (currentTimeMinutes >= businessEnd) {
          currentDate = this.addDays(currentDate, 1);
          currentDate = this.setTimeToStartOfDay(currentDate);
          continue;
        }
      } else {
        // Other days: start from business hours start
        dayStartTime = new Date(currentDate);
        dayStartTime.setHours(Math.floor(businessStart / 60), businessStart % 60, 0, 0);
      }

      dayEndTime = new Date(currentDate);
      dayEndTime.setHours(Math.floor(businessEnd / 60), businessEnd % 60, 0, 0);

      const availableMinutesInDay = Math.max(0, (dayEndTime.getTime() - dayStartTime.getTime()) / (60 * 1000));

      if (remainingSlaMinutes <= availableMinutesInDay) {
        // SLA due date is within this business day
        const dueDate = new Date(dayStartTime.getTime() + remainingSlaMinutes * 60 * 1000);
        const now = new Date();
        
        return {
          dueDate,
          businessMinutesRemaining: Math.max(0, await this.calculateBusinessMinutesBetween(now, dueDate, options)),
          totalMinutesRemaining: Math.max(0, (dueDate.getTime() - now.getTime()) / (60 * 1000)),
          isOverdue: now > dueDate,
          isCurrentlyInBusinessHours: await this.isCurrentlyInBusinessHours(now, options),
          holidaysSkipped,
          nextBusinessHourStart: await this.getNextBusinessHourStart(now, options)
        };
      } else {
        // Use all available minutes in this day and continue to next day
        remainingSlaMinutes -= availableMinutesInDay;
        currentDate = this.addDays(currentDate, 1);
        currentDate = this.setTimeToStartOfDay(currentDate);
      }
    }

    // Shouldn't reach here, but return a fallback
    const fallbackDueDate = new Date(startDate.getTime() + slaMinutes * 60 * 1000);
    const now = new Date();

    return {
      dueDate: fallbackDueDate,
      businessMinutesRemaining: 0,
      totalMinutesRemaining: Math.max(0, (fallbackDueDate.getTime() - now.getTime()) / (60 * 1000)),
      isOverdue: true,
      isCurrentlyInBusinessHours: await this.isCurrentlyInBusinessHours(now, options),
      holidaysSkipped
    };
  }

  /**
   * Calculate business minutes between two dates
   */
  async calculateBusinessMinutesBetween(
    fromDate: Date,
    toDate: Date,
    options: SLACalculationOptions = {}
  ): Promise<number> {
    if (fromDate >= toDate) return 0;

    const { departmentId, unitId, businessHoursOnly = true } = options;

    if (!businessHoursOnly) {
      return (toDate.getTime() - fromDate.getTime()) / (60 * 1000);
    }

    const businessHours = await this.getBusinessHours(departmentId, unitId);
    const holidays = await this.getHolidays(departmentId, unitId);

    if (businessHours.length === 0) return 0;

    let totalBusinessMinutes = 0;
    let currentDate = new Date(fromDate);

    while (currentDate < toDate) {
      const dayOfWeek = currentDate.getDay();

      // Skip holidays
      if (this.isHoliday(holidays, currentDate)) {
        currentDate = this.addDays(currentDate, 1);
        currentDate = this.setTimeToStartOfDay(currentDate);
        continue;
      }

      // Find business hours for this day
      const dayBusinessHours = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
      
      if (!dayBusinessHours) {
        currentDate = this.addDays(currentDate, 1);
        currentDate = this.setTimeToStartOfDay(currentDate);
        continue;
      }

      const businessStart = this.parseTimeString(dayBusinessHours.startTime);
      const businessEnd = this.parseTimeString(dayBusinessHours.endTime);

      // Calculate business minutes for this day
      let dayStart: Date;
      let dayEnd: Date;

      if (this.isSameDay(currentDate, fromDate)) {
        dayStart = new Date(Math.max(currentDate.getTime(), this.getBusinessHourStart(currentDate, businessStart).getTime()));
      } else {
        dayStart = this.getBusinessHourStart(currentDate, businessStart);
      }

      if (this.isSameDay(currentDate, toDate)) {
        dayEnd = new Date(Math.min(toDate.getTime(), this.getBusinessHourEnd(currentDate, businessEnd).getTime()));
      } else {
        dayEnd = this.getBusinessHourEnd(currentDate, businessEnd);
      }

      if (dayStart < dayEnd) {
        totalBusinessMinutes += (dayEnd.getTime() - dayStart.getTime()) / (60 * 1000);
      }

      currentDate = this.addDays(currentDate, 1);
      currentDate = this.setTimeToStartOfDay(currentDate);
    }

    return totalBusinessMinutes;
  }

  /**
   * Check if current time is within business hours
   */
  async isCurrentlyInBusinessHours(
    checkDate: Date = new Date(),
    options: SLACalculationOptions = {}
  ): Promise<boolean> {
    const { departmentId, unitId } = options;
    
    const businessHours = await this.getBusinessHours(departmentId, unitId);
    const holidays = await this.getHolidays(departmentId, unitId);

    // Check if it's a holiday
    if (this.isHoliday(holidays, checkDate)) return false;

    const dayOfWeek = checkDate.getDay();
    const dayBusinessHours = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);

    if (!dayBusinessHours) return false;

    const businessStart = this.parseTimeString(dayBusinessHours.startTime);
    const businessEnd = this.parseTimeString(dayBusinessHours.endTime);
    const currentTimeMinutes = checkDate.getHours() * 60 + checkDate.getMinutes();

    return currentTimeMinutes >= businessStart && currentTimeMinutes < businessEnd;
  }

  /**
   * Get the next business hour start time
   */
  async getNextBusinessHourStart(
    fromDate: Date = new Date(),
    options: SLACalculationOptions = {}
  ): Promise<Date | undefined> {
    const { departmentId, unitId } = options;
    
    const businessHours = await this.getBusinessHours(departmentId, unitId);
    const holidays = await this.getHolidays(departmentId, unitId);

    let currentDate = new Date(fromDate);
    
    // Look ahead up to 14 days
    for (let i = 0; i < 14; i++) {
      const dayOfWeek = currentDate.getDay();

      // Skip holidays
      if (this.isHoliday(holidays, currentDate)) {
        currentDate = this.addDays(currentDate, 1);
        currentDate = this.setTimeToStartOfDay(currentDate);
        continue;
      }

      const dayBusinessHours = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
      
      if (dayBusinessHours) {
        const businessStart = this.parseTimeString(dayBusinessHours.startTime);
        const businessStartDate = this.getBusinessHourStart(currentDate, businessStart);

        if (businessStartDate > fromDate) {
          return businessStartDate;
        }
      }

      currentDate = this.addDays(currentDate, 1);
      currentDate = this.setTimeToStartOfDay(currentDate);
    }

    return undefined;
  }

  // Private helper methods
  private async getBusinessHours(departmentId?: number, unitId?: number): Promise<any[]> {
    const cacheKey = `bh_${departmentId || 'null'}_${unitId || 'null'}`;
    
    if (this.businessHoursCache.has(cacheKey) && 
        this.cacheExpiry.get(cacheKey)! > Date.now()) {
      return this.businessHoursCache.get(cacheKey)!;
    }

    const businessHours = await prisma.businessHoursConfig.findMany({
      where: {
        departmentId: departmentId || null,
        unitId: unitId || null,
        isActive: true
      },
      orderBy: { dayOfWeek: 'asc' }
    });

    this.businessHoursCache.set(cacheKey, businessHours);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
    
    return businessHours;
  }

  private async getHolidays(departmentId?: number, unitId?: number): Promise<any[]> {
    const cacheKey = `h_${departmentId || 'null'}_${unitId || 'null'}`;
    
    if (this.holidaysCache.has(cacheKey) && 
        this.cacheExpiry.get(cacheKey)! > Date.now()) {
      return this.holidaysCache.get(cacheKey)!;
    }

    const now = new Date();
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    const holidays = await prisma.holidayCalendar.findMany({
      where: {
        OR: [
          { departmentId: departmentId || null, unitId: null },
          { unitId: unitId || null, departmentId: null },
          { departmentId: null, unitId: null } // Global holidays
        ],
        date: {
          gte: now,
          lte: oneYearFromNow
        },
        isActive: true
      }
    });

    this.holidaysCache.set(cacheKey, holidays);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
    
    return holidays;
  }

  private isHoliday(holidays: any[], date: Date): boolean {
    const dateString = date.toISOString().split('T')[0];
    return holidays.some(holiday => {
      const holidayDateString = holiday.date.toISOString().split('T')[0];
      return holidayDateString === dateString;
    });
  }

  private parseTimeString(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private getBusinessHourStart(date: Date, businessStartMinutes: number): Date {
    const result = new Date(date);
    result.setHours(Math.floor(businessStartMinutes / 60), businessStartMinutes % 60, 0, 0);
    return result;
  }

  private getBusinessHourEnd(date: Date, businessEndMinutes: number): Date {
    const result = new Date(date);
    result.setHours(Math.floor(businessEndMinutes / 60), businessEndMinutes % 60, 0, 0);
    return result;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private setTimeToStartOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  /**
   * Clear cache (useful for testing or when business hours/holidays are updated)
   */
  clearCache(): void {
    this.businessHoursCache.clear();
    this.holidaysCache.clear();
    this.cacheExpiry.clear();
  }
}

// Export singleton instance
export const slaCalculator = SLACalculator.getInstance();

// Export utility functions for convenience
export async function calculateSLADueDate(
  startDate: Date,
  slaMinutes: number,
  options: SLACalculationOptions = {}
): Promise<SLACalculationResult> {
  return slaCalculator.calculateSLADueDate(startDate, slaMinutes, options);
}

export async function calculateBusinessMinutesBetween(
  fromDate: Date,
  toDate: Date,
  options: SLACalculationOptions = {}
): Promise<number> {
  return slaCalculator.calculateBusinessMinutesBetween(fromDate, toDate, options);
}

export async function isCurrentlyInBusinessHours(
  checkDate: Date = new Date(),
  options: SLACalculationOptions = {}
): Promise<boolean> {
  return slaCalculator.isCurrentlyInBusinessHours(checkDate, options);
}