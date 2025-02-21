// Constants to define the start and end of the work day. If your office starts at 8am, 
// adjust the WORKING_HOURS_START constant appropriately.
const WORKING_HOURS_START = 9;
const WORKING_HOURS_END = 17;
const WORKING_DAY_HOURS = WORKING_HOURS_END - WORKING_HOURS_START;
const WORKING_DAYS = [1, 2, 3, 4, 5]; // Monday to Friday
/* Array of US holidays
- This array is formatted a bit differently than the standard date object format you will
call this function with towards the bottom of the file. This is due to the formatting of 
`date.toLocaleDateString()`
*/
const US_HOLIDAYS: string[] = [
    "01/01", // New Year's Day
    "01/20", // Martin Luther King Jr. Day (Third Monday of January)
    "02/17", // Presidents' Day (Third Monday of February)
    "05/26", // Memorial Day (Last Monday of May)
    "07/04", // Independence Day
    "09/01", // Labor Day (First Monday of September)
    "10/13", // Columbus Day (Second Monday of October)
    "11/11", // Veterans Day
    "11/27", // Thanksgiving Day (Fourth Thursday of November)
    "12/25", // Christmas Day
  ];

// TypeScript interface for the script. Indicates that all days, hours, minutes and seconds
// referenced are numbers
interface TurnaroundTime {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

// Main function of the script. This takes a submitDate and a turnaroundTime as arguments,
// and calculates the due date as a standard JavaScript Date object.
const calculateDueDate = (submitDate: Date, turnaroundTime: TurnaroundTime): Date => {
  // Time remaining is calculated in seconds to provide the highest level of granularity.
  let remainingSeconds = 
    (turnaroundTime.days || 0) * WORKING_DAY_HOURS * 3600 +
    (turnaroundTime.hours || 0) * 3600 +
    (turnaroundTime.minutes || 0) * 60 +
    (turnaroundTime.seconds || 0);
  
  let dueDate = new Date(submitDate);
  
  while (remainingSeconds > 0) {
    let availableSeconds = getAvailableSecondsInDay(dueDate);
    
    /* 
    If the time remaining until delivery is less than the available seconds in the day,
    Calculate what time during the day the due date is and return the current date

    Otherwise, subtract the time for today from the turnaround time and move to the next day.
    */
    if (remainingSeconds <= availableSeconds) {
      dueDate.setSeconds(dueDate.getSeconds() + remainingSeconds);
      return dueDate;
    } else {
      remainingSeconds -= availableSeconds;
      dueDate = getNextWorkingDayStart(dueDate);
    }
  }
  return dueDate;
};

// This supporting function is needed to calculate the due date
const getAvailableSecondsInDay = (date: Date): number => {
  let currentHour = date.getHours();
  let currentMinute = date.getMinutes();
  let currentSecond = date.getSeconds();
  let remainingHours = WORKING_HOURS_END - currentHour;
  return (remainingHours * 3600) - (currentMinute * 60) - currentSecond;
};

const getNextWorkingDayStart = (date: Date): Date => {
  let nextDate = new Date(date);
  nextDate.setDate(date.getDate() + 1);
  //Set the start of the next day at the first second at the start of the day
  nextDate.setHours(WORKING_HOURS_START, 0, 0, 0);
  
  // Ensure that the working day is not a weekend or a holiday.
  while (!isWorkingDay(nextDate) || isHoliday(nextDate)) {
    nextDate.setDate(nextDate.getDate() + 1);
  }
  return nextDate;
};

// Checks if it is a working day, AKA a weekday. Returns a boolean value.
const isWorkingDay = (date: Date): boolean => WORKING_DAYS.includes(date.getDay());
// Checks over the array of holidays defined at the top of the file. Returns a boolean value.
const isHoliday = (date: Date): boolean => {
    const dateString = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }); // Format as YYYY-MM-DD
    return US_HOLIDAYS.includes(dateString);
}

// Example usage:
// Adjust the date you would like to test on this line below. Date is formatted as follows in the pseudocode:
// Date("YEAR-MONTH-DAY T(stands for time)HOUR:MINUTE:SECOND")
const submitDate = new Date('2025-12-30T14:12:00'); // Tuesday, December 30th - 2:12 PM
// Adjust the turnaround time you would like to test on this line below. Adjust the time by altering
// the object properties in the turnaroundTime Object.
const turnaroundTime: TurnaroundTime = { days: 1, hours: 4, minutes: 30, seconds: 0 }; // 1 day, 4 hours, 30 minutes

// This last bit of code actually runs the function and returns the output to the console.
const dueDate = calculateDueDate(submitDate, turnaroundTime);
console.log('Due Date:', dueDate.toString());

