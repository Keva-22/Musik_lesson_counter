/******************************************************************************
 * main.js
 *
 * Anpassungen:
 * - Bis zur letzten Woche im Juni (keine Stunde in der ersten Juli-Woche)
 * - Wenn man die Seite zwischen 7:50 und 8:40 am Freitag öffnet:
 *   Hinweis "Leg dein Handy weg, du bist gerade im Unterricht!"
 * - Restliche Stunden aktualisieren sich automatisch (weil jedes Mal
 *   neu berechnet).
 *
 * Vorhandene Sondertage:
 * - noLessonDates: 14.2, 14.3, 28.3, 18.4, 2.5, 30.5
 * - testDate: 10.1
 ******************************************************************************/


/**
 * Freitage ohne Unterricht (Monat in JS: 0=Jan, 1=Feb, 2=März, ...)
 */
const noLessonDates = [
  { month: 1, day: 14 },  // 14.2
  { month: 2, day: 14 },  // 14.3
  { month: 2, day: 28 },  // 28.3
  { month: 3, day: 18 },  // 18.4
  { month: 4, day: 2  },  //  2.5
  { month: 4, day: 30 },  // 30.5
];

/**
 * Testtag (keine normale Stunde).
 * 10.1 -> { month: 0, day: 10 }
 */
const testDate = { month: 0, day: 10 };

/**
 * Prüft, ob ein Datum in "noLessonDates" enthalten ist.
 */
function isNoLessonDay(dateObj) {
  return noLessonDates.some(
      (d) =>
          d.month === dateObj.getMonth() &&
          d.day === dateObj.getDate()
  );
}

/**
 * Prüft, ob das Datum der Testtag (10.1) ist.
 */
function isTestDay(dateObj) {
  return (
      dateObj.getMonth() === testDate.month &&
      dateObj.getDate() === testDate.day
  );
}

/**
 * Gibt das nächste gültige "Musikstunden"-Datum zurück:
 * - Jeden Freitag um 7:50
 * - Überspringt Freitage ohne Unterricht (noLessonDates)
 * - Falls Testtag, isTest = true
 *
 * Return: { date: Date, isTest: boolean }
 */
function getNextLessonDate() {
  const now = new Date();
  const nextLesson = new Date(now);

  // Aktueller Wochentag (0=So, 1=Mo, ..., 5=Fr, 6=Sa)
  const dayOfWeek = now.getDay();
  let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  nextLesson.setDate(now.getDate() + daysUntilFriday);

  // Uhrzeit auf Freitag 7:50
  nextLesson.setHours(7, 50, 0, 0);

  // Falls heute Freitag ist und es nach 7:50 Uhr ist -> nächste Woche
  if (dayOfWeek === 5) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    if (currentHour > 7 || (currentHour === 7 && currentMinute >= 50)) {
      nextLesson.setDate(nextLesson.getDate() + 7);
    }
  }

  // Weiter springen, wenn noLesson oder Test
  let foundValidDate = false;
  let isTest = false;

  while (!foundValidDate) {
    if (isNoLessonDay(nextLesson)) {
      nextLesson.setDate(nextLesson.getDate() + 7);
    } else if (isTestDay(nextLesson)) {
      isTest = true;
      foundValidDate = true;
    } else {
      foundValidDate = true;
    }
  }

  return { date: nextLesson, isTest };
}

/**
 * Zeigt den Countdown zur nächsten Musikstunde (oder Test).
 * - Wenn man Freitag zwischen 7:50 und 8:40 reingeht, Meldung "Handy weg..."
 */
function updateCountdown() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  // Falls heute Freitag ist UND Uhrzeit zwischen 7:50 und 8:40 => "Handy weg"
  if (
      dayOfWeek === 5 &&
      (
          (currentHour === 7 && currentMin >= 50) ||
          (currentHour === 8 && currentMin < 40)
      )
  ) {
    // Hinweis ausgeben, Countdown ausblenden (oder auf 0 setzen)
    document.getElementById("countdown-title").textContent = "Gerade Unterricht!";
    document.getElementById("info-message").textContent =
        "Leg dein Handy weg, du bist gerade im Unterricht!";

    // Werte auf 0
    document.getElementById("days-value").textContent = 0;
    document.getElementById("hours-value").textContent = 0;
    document.getElementById("minutes-value").textContent = 0;
    document.getElementById("seconds-value").textContent = 0;
    return;
  }

  // Ansonsten normaler Countdown
  const { date: nextLesson, isTest } = getNextLessonDate();
  const diff = nextLesson - now;

  const daysElem    = document.getElementById("days-value");
  const hoursElem   = document.getElementById("hours-value");
  const minsElem    = document.getElementById("minutes-value");
  const secsElem    = document.getElementById("seconds-value");
  const countdownTitle = document.getElementById("countdown-title");
  const infoMessage = document.getElementById("info-message");

  if (diff <= 0) {
    // Stunde ist gerade oder schon vorbei
    infoMessage.textContent = "Die Musikstunde (oder der Test) ist gerade im Gange oder schon vorbei.";
    countdownTitle.textContent = "Nächste Musikstunde:";

    daysElem.textContent    = 0;
    hoursElem.textContent   = 0;
    minsElem.textContent    = 0;
    secsElem.textContent    = 0;
    return;
  }

  // Titel ggf. anpassen, falls Testtag
  if (isTest) {
    countdownTitle.textContent = "Nächster Termin (Test):";
  } else {
    countdownTitle.textContent = "Nächste Musikstunde:";
  }

  infoMessage.textContent = "";

  // Tage / Stunden / Minuten / Sekunden berechnen
  let remaining = diff;
  const days    = Math.floor(remaining / (1000 * 60 * 60 * 24));
  remaining    -= days * (1000 * 60 * 60 * 24);

  const hours   = Math.floor(remaining / (1000 * 60 * 60));
  remaining    -= hours * (1000 * 60 * 60);

  const minutes = Math.floor(remaining / (1000 * 60));
  remaining    -= minutes * (1000 * 60);

  const seconds = Math.floor(remaining / 1000);

  // In die Quadrate eintragen
  daysElem.textContent    = days;
  hoursElem.textContent   = hours;
  minsElem.textContent    = minutes;
  secsElem.textContent    = seconds;
}

/**
 * Ermittelt, wie viele Freitage noch bis zum ENDE JUNI übrig sind.
 */
function countRemainingFridays() {
  // Setze das Enddatum auf den letzten Tag im Juni, z.B. 30. Juni
  const endDate = new Date(new Date().getFullYear(), 5, 30); // (Monat 5 = Juni)

  const now = new Date();
  let count = 0;

  const tempDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  while (tempDate <= endDate) {
    // Ist es ein Freitag, und kein noLesson oder Test?
    if (
        tempDate.getDay() === 5 &&
        !isNoLessonDay(tempDate) &&
        !isTestDay(tempDate)
    ) {
      count++;
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }

  return count;
}

// ------------------- Beim Laden der Seite -------------------
document.addEventListener("DOMContentLoaded", () => {
  // Zeige die Anzahl der verbleibenden Musikstunden bis Ende Juni
  document.getElementById("lesson-count").textContent = countRemainingFridays();

  // Initiales Update des Countdowns
  updateCountdown();
  // Aktualisiere den Countdown jede Sekunde
  setInterval(updateCountdown, 1000);
});