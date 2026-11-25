/*
 * Den här filen hanterar quizets frågor och svar.
 *
 * Hämtar frågor från Open Trivia DB baserat på den kategori
 * som spelaren valt på startsidan.
 *
 * Visar frågor och svarsalternativ, hanterar spelarens val
 * och kontrollerar om svaren är rätt eller fel.
 *
 * Håller koll på vilken fråga spelaren är på,
 * uppdaterar framstegen och sparar svaren.
 *
 * När alla frågor är besvarade eller tiden tar slut
 * räknas poängen ihop och spelaren skickas till resultatsidan.
 */

const API_ENDPOINT = "https://opentdb.com/api.php";

const categoryMap = {
  blandat: null,
  natur: [17, 22],
  kultur: [23, 12, 25],
};

// Hämtar HTML-elementen
const answerTitleElements = [
  document.querySelector("#answer-titel-1"),
  document.querySelector("#answer-titel-2"),
  document.querySelector("#answer-titel-3"),
];

const answerElements = [
  document.querySelector("#answer-1"),
  document.querySelector("#answer-2"),
  document.querySelector("#answer-3"),
];

const questionTitleElement = document.querySelector("#question-titel");
const questionCategoryElement = document.querySelector("#question-category");
const submitBtn = document.querySelector("#submit");

// Variabler för quizets tillstånd
let questions = [];
let currentQuestionIndex = 0;
let selectedAnswerIndex = null;
let correctAnswerIndex = null;
let currentAnswerOptions = [];

// Blandar svarsalternativen i slumpmässig ordning
function shuffle(array) {
  let currentIndex = array.length;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

// Väntar ett angivet antal millisekunder
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Hämtar frågor med rate limiting
async function getAPIQuestions(categoryId, difficulty = "easy", amount = 10) {
  const params = new URLSearchParams({
    amount: String(amount),
    difficulty,
    type: "multiple",
  });

  if (categoryId !== undefined && categoryId !== null) {
    params.set("category", String(categoryId));
  }

  // Maximalt två försök
  for (let attempt = 0; attempt < 2; attempt++) {
    const lastRequest = Number(localStorage.getItem("lastApiRequest") ?? 0);

    const elapsed = Date.now() - lastRequest;

    // Väntar om föregående anrop gjordes för nyligen
    if (elapsed < 5500) {
      await wait(5500 - elapsed);
    }

    localStorage.setItem("lastApiRequest", String(Date.now()));

    const response = await fetch(`${API_ENDPOINT}?${params}`);
    const data = response.ok ? await response.json() : null;

    // Försöker igen vid rate limiting
    if (
      (response.status === 429 || data?.response_code === 5) &&
      attempt === 0
    ) {
      await wait(5500);
      continue;
    }

    if (!response.ok) {
      throw new Error(`Kunde inte hämta frågor: ${response.status}`);
    }

    if (data.response_code !== 0) {
      throw new Error(`Fråge-API:t returnerade felkod ${data.response_code}`);
    }

    return data.results;
  }
}

// Omvandlar HTML-entiteter till vanlig text
function decodeHTML(value) {
  return new DOMParser().parseFromString(value, "text/html").documentElement
    .textContent;
}

// Nollställer markeringen på svarsalternativen
function resetAnswers() {
  answerElements.forEach((answerElement) => {
    answerElement.classList.remove(
      "answer-wrong",
      "answer-correct",
      "answer-selected",
    );

    answerElement.setAttribute("aria-pressed", "false");
  });

  selectedAnswerIndex = null;
}

// Markerar spelarens valda svar
function selectAnswer(answerIndex) {
  resetAnswers();

  selectedAnswerIndex = answerIndex;

  answerElements[answerIndex].classList.add("answer-selected");
  answerElements[answerIndex].setAttribute("aria-pressed", "true");
}

// Visar aktuell fråga och svarsalternativ
function askQuestion(question) {
  questionTitleElement.textContent = decodeHTML(question.question);

  questionCategoryElement.textContent = decodeHTML(question.category);

  // Blandar två felaktiga svar och ett rätt svar
  const answers = shuffle([
    ...question.incorrect_answers.slice(0, answerTitleElements.length - 1),
    question.correct_answer,
  ]);

  // Sparar svarsalternativen för resultatsidan
  currentAnswerOptions = answers.map(decodeHTML);

  // Hittar index för rätt svar
  correctAnswerIndex = answers.indexOf(question.correct_answer);

  resetAnswers();

  // Visar svarsalternativen i HTML
  answers.forEach((answer, index) => {
    answerTitleElements[index].textContent = decodeHTML(answer);
  });

  // Startar timern vid första frågan
  if (
    currentQuestionIndex === 0 &&
    typeof window.startQuizTimer === "function"
  ) {
    window.startQuizTimer();
  }

  // Uppdaterar progressbaren
  if (typeof window.updateProgress === "function") {
    window.updateProgress(currentQuestionIndex + 1, questions.length);
  }
}

// Kontrollerar om spelaren valt rätt svar
function validateAnswers() {
  if (selectedAnswerIndex === null) {
    return null;
  }

  answerElements.forEach((answerElement, index) => {
    if (index === correctAnswerIndex) {
      answerElement.classList.add("answer-correct");
    } else if (index === selectedAnswerIndex) {
      answerElement.classList.add("answer-wrong");
    }

    answerElement.classList.remove("answer-selected");
  });

  return selectedAnswerIndex === correctAnswerIndex;
}

// Sparar spelarens svar och går vidare till nästa fråga
function submitAnswer(event) {
  event.preventDefault();

  const isCorrect = validateAnswers();

  if (isCorrect === null) {
    alert("Vänligen välj ett svar");
    return;
  }

  // Hämtar tidigare svar eller skapar en tom lista
  const results = JSON.parse(localStorage.getItem("results") ?? "[]");

  // Sparar frågan, svarsalternativen och spelarens val
  results.push({
    question: decodeHTML(questions[currentQuestionIndex].question),
    options: currentAnswerOptions,
    selected: selectedAnswerIndex,
    correct: correctAnswerIndex,
    isCorrect,
  });

  // Sparar svaren i localStorage
  localStorage.setItem("results", JSON.stringify(results));

  // Går vidare till nästa fråga
  currentQuestionIndex++;

  // Avslutar quizet efter sista frågan
  if (currentQuestionIndex === questions.length) {
    if (typeof window.finishQuiz === "function") {
      window.finishQuiz("completed");
    }

    return;
  }

  // Visar nästa fråga
  askQuestion(questions[currentQuestionIndex]);
}

// Hämtar frågor från en sparad frågebank eller API
async function loadQuestions(categoryId) {
  const cacheKey = `questionBank_${categoryId}`;

  let questionBank = JSON.parse(localStorage.getItem(cacheKey) ?? "[]");

  // Fyller på frågebanken om frågorna börjar ta slut
  if (questionBank.length < 10) {
    questionBank = await getAPIQuestions(categoryId, "easy", 30);
  }

  // Plockar ut 10 frågor från frågebanken
  const selectedQuestions = questionBank.splice(0, 10);

  // Sparar de återstående frågorna
  localStorage.setItem(cacheKey, JSON.stringify(questionBank));

  return selectedQuestions;
}

// Startar quizet
async function init() {
  // Nollställer tidigare svar inför en ny spelomgång
  localStorage.removeItem("results");

  // Hämtar vald kategori från startsidan
  const selectedCategory =
    sessionStorage.getItem("selectedCategory") ?? "blandat";

  const categoryIds = categoryMap[selectedCategory] ?? null;

  // Väljer ett slumpmässigt kategori-ID
  const categoryId =
    categoryIds === null
      ? null
      : categoryIds[Math.floor(Math.random() * categoryIds.length)];

  // Hämtar frågorna
  questions = await loadQuestions(categoryId);

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Det finns inga frågor att visa.");
  }

  // Kopplar klickhändelser till svarsalternativen
  answerElements.forEach((answerElement, index) => {
    answerElement.addEventListener("click", () => {
      selectAnswer(index);
    });
  });

  // Kopplar bekräftaknappen
  submitBtn.addEventListener("click", submitAnswer);

  // Visar första frågan
  askQuestion(questions[currentQuestionIndex]);
}

window.finishQuiz = function (reason) {
  // Stoppar timern
  window.stopQuizTimer?.();

  // Hämtar spelarens sparade svar
  const answers = JSON.parse(localStorage.getItem("results") ?? "[]");

  // Räknar antalet rätt
  const score = answers.filter((answer) => answer.isCorrect).length;

  // Hämtar tiden som använts
  const timeUsed = window.getTimeUsed();

  // Skapar ett objekt med quizresultatet
  const result = {
    score,
    total: questions.length,
    time: window.formatQuizTime(timeUsed),
    answers,
    reason,
    date: new Date().toISOString(),
  };

  // Sparar det aktuella resultatet
  sessionStorage.setItem("quiztajm_current_result", JSON.stringify(result));

  // Hämtar tidigare spelomgångar
  const history = JSON.parse(localStorage.getItem("quiztajm_history") ?? "[]");

  // Lägger det senaste resultatet först
  history.unshift(result);

  // Sparar maximalt fem spelomgångar
  localStorage.setItem("quiztajm_history", JSON.stringify(history.slice(0, 5)));

  // Går vidare till resultatsidan
  window.location.href = "./result.html";
};

const retryButton = document.querySelector("#retry-button");

// Startar quizet och hanterar eventuella fel
async function startQuiz() {
  const quizElements = document.querySelectorAll(".quiz-only");

  try {
    await init();

    // Visar kontrollerna när frågorna har laddats
    quizElements.forEach((element) => {
      element.hidden = false;
    });
  } catch (error) {
    console.error(error);

    questionTitleElement.textContent =
      "Kunde inte ladda frågorna. Försök igen om en stund.";

    questionCategoryElement.textContent = "Något gick fel";

    submitBtn.disabled = true;

    // Döljer kontrollerna vid fel
    quizElements.forEach((element) => {
      element.hidden = true;
    });

    // Visar knappen för ett nytt försök
    retryButton.hidden = false;
  }
}

// Laddar om sidan vid ett nytt försök
retryButton.addEventListener("click", () => {
  window.location.reload();
});

startQuiz();
