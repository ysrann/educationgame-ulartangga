// Data tangga dan ular (posisi start -> end)
const ladders = {
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91,
};

const snakes = {
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78,
};

// 10 titik pertanyaan
const questionPoints = [5, 12, 25, 33, 46, 52, 66, 74, 88, 97];

// Pertanyaan Pilgan (contoh tentang Indonesia)
const questions = [
  {
    question: "Ibukota Indonesia adalah?",
    answers: ["Jakarta", "Surabaya", "Bandung", "Medan"],
    correct: 0,
  },
  {
    question: "Lambang negara Indonesia adalah?",
    answers: ["Garuda Pancasila", "Burung Merak", "Elang Jawa", "Macan"],
    correct: 0,
  },
  {
    question: "Bahasa resmi Indonesia adalah?",
    answers: ["Indonesia", "Jawa", "Sunda", "Melayu"],
    correct: 0,
  },
  {
    question: "Pulau terbesar di Indonesia adalah?",
    answers: ["Kalimantan", "Sumatera", "Jawa", "Sulawesi"],
    correct: 0,
  },
  {
    question: "Presiden pertama Indonesia adalah?",
    answers: ["Soekarno", "Soeharto", "Habibie", "Jokowi"],
    correct: 0,
  },
  {
    question: "Lagu kebangsaan Indonesia adalah?",
    answers: ["Indonesia Raya", "Halo-halo Bandung", "Bagimu Negeri", "Satu Nusa Satu Bangsa"],
    correct: 0,
  },
  {
    question: "Hari kemerdekaan Indonesia diperingati pada tanggal?",
    answers: ["17 Agustus", "1 Juni", "28 Oktober", "10 November"],
    correct: 0,
  },
  {
    question: "Bhinneka Tunggal Ika artinya?",
    answers: ["Berbeda-beda tetapi tetap satu", "Satu bangsa satu bahasa", "Bersatu kita teguh", "Bhineka adalah pulau"],
    correct: 0,
  },
  {
    question: "Pulau yang dikenal dengan julukan 'Pulau Seribu' adalah?",
    answers: ["Kepulauan Seribu", "Bali", "Lombok", "Sumatera"],
    correct: 0,
  },
  {
    question: "Mata uang resmi Indonesia adalah?",
    answers: ["Rupiah", "Dollar", "Euro", "Yen"],
    correct: 0,
  },
];

// Variabel game
let board = document.getElementById("board");
let diceResultEl = document.getElementById("dice-result");
let rollBtn = document.getElementById("roll-btn");
let posP1El = document.getElementById("pos-p1");
let posP2El = document.getElementById("pos-p2");
let questionContainer = document.getElementById("question-container");
let questionText = document.getElementById("question-text");
let answersDiv = document.getElementById("answers");
let messageEl = document.getElementById("message");

const CELL_SIZE = 40;
const BOARD_SIZE = 100;

let players = [
  { name: "Pemain 1", color: "red", position: 0 },
  { name: "Pemain 2", color: "yellow", position: 0 },
];
let currentPlayer = 0;
let isMoving = false;
let currentQuestionIndex = -1;
let answeredCorrectly = false;

// Buat papan
function createBoard() {
  board.innerHTML = "";

  for (let i = BOARD_SIZE; i >= 1; i--) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    // Nomor kotak
    cell.textContent = i;

    // Tandai kotak tangga & ular dengan warna bg yang berbeda
    if (ladders[i]) {
      cell.style.backgroundColor = "#aed581"; // hijau muda tangga
      cell.title = `Tangga ke ${ladders[i]}`;
    } else if (Object.values(ladders).includes(i)) {
      cell.style.backgroundColor = "#c5e1a5"; // ujung tangga
    }

    if (snakes[i]) {
      cell.style.backgroundColor = "#e57373"; // merah muda ular
      cell.title = `Ular turun ke ${snakes[i]}`;
    } else if (Object.values(snakes).includes(i)) {
      cell.style.backgroundColor = "#ef9a9a"; // ujung ular
    }

    // Kotak pertanyaan
    if (questionPoints.includes(i)) {
      cell.style.border = "3px dashed #4db6ac";
    }

    board.appendChild(cell);
  }
}

// Hitung posisi pixel pion sesuai posisi pemain
function getCellCoordinates(pos) {
  if (pos < 1) return { x: -100, y: -100 }; // di luar papan

  // Baris dari bawah (0-based)
  let row = Math.floor((pos - 1) / 10);
  // Kolom 0-based (zig-zag)
  let col = (row % 2 === 0) ? (pos - 1) % 10 : 9 - ((pos - 1) % 10);

  return {
    x: col * CELL_SIZE + CELL_SIZE / 2 - 10,
    y: (9 - row) * CELL_SIZE + CELL_SIZE / 2 - 10,
  };
}

// Membuat pion dan tempatkan di posisi awal (posisi 0 di luar papan)
function createPions() {
  players.forEach((p, i) => {
    let pion = document.createElement("div");
    pion.classList.add("pion", p.color);
    pion.id = "pion" + i;
    board.appendChild(pion);
    setPionPosition(i, p.position);
  });
}

function setPionPosition(playerIndex, pos) {
  let pion = document.getElementById("pion" + playerIndex);
  let coords = getCellCoordinates(pos);
  pion.style.left = coords.x + "px";
  pion.style.top = coords.y + "px";

  if (playerIndex === 0) posP1El.textContent = pos;
  else posP2El.textContent = pos;
}

// Animasi gerak pion maju ke pos baru
async function movePion(playerIndex, steps) {
  isMoving = true;
  let player = players[playerIndex];

  for (let i = 1; i <= steps; i++) {
    let newPos = player.position + 1;
    if (newPos > 100) break; // tidak boleh lewat finish
    player.position = newPos;
    setPionPosition(playerIndex, player.position);
    await delay(300);
  }
  isMoving = false;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mengecek tangga dan ular di posisi pemain
function checkLaddersAndSnakes(playerIndex) {
  let player = players[playerIndex];
  let pos = player.position;

  if (ladders[pos]) {
    player.position = ladders[pos];
    setPionPosition(playerIndex, player.position);
    messageEl.textContent = `${player.name} naik tangga ke ${player.position}!`;
  } else if (snakes[pos]) {
    player.position = snakes[pos];
    setPionPosition(playerIndex, player.position);
    messageEl.textContent = `${player.name} tergigit ular turun ke ${player.position}!`;
  } else {
    messageEl.textContent = "";
  }
}

// Fungsi acak pertanyaan dari array questions yang belum pernah dipakai
let usedQuestionIndices = [];

function getRandomQuestion() {
  let availableIndices = questions
    .map((_, i) => i)
    .filter((i) => !usedQuestionIndices.includes(i));

  if (availableIndices.length === 0) {
    usedQuestionIndices = []; // reset kalau habis
    availableIndices = questions.map((_, i) => i);
  }

  let qIndex =
    availableIndices[Math.floor(Math.random() * availableIndices.length)];
  usedQuestionIndices.push(qIndex);

  return { index: qIndex, question: questions[qIndex] };
}

// Tampilkan pertanyaan saat pemain sampai di titik pertanyaan
function showQuestion(playerIndex) {
  questionContainer.classList.remove("hidden");
  rollBtn.disabled = true;
  messageEl.textContent = "";

  let qObj = getRandomQuestion();
  currentQuestionIndex = qObj.index;

  questionText.textContent = qObj.question.question;

  answersDiv.innerHTML = "";
  qObj.question.answers.forEach((ans, idx) => {
    let btn = document.createElement("button");
    btn.textContent = ans;
    btn.onclick = () => checkAnswer(playerIndex, idx);
    answersDiv.appendChild(btn);
  });
}

// Cek jawaban pertanyaan
async function checkAnswer(playerIndex, answerIndex) {
  let correctIndex = questions[currentQuestionIndex].correct;
  if (answerIndex === correctIndex) {
    messageEl.style.color = "green";
    messageEl.textContent = "Jawaban benar! Tetap di posisi ini.";
    answeredCorrectly = true;
  } else {
    messageEl.style.color = "red";
    messageEl.textContent = "Jawaban salah! Mundur 3 langkah.";
    answeredCorrectly = false;
    // mundur 3 langkah dengan animasi
    await moveBack(playerIndex, 3);
  }

  questionContainer.classList.add("hidden");
  rollBtn.disabled = false;

  await delay(1000);
  nextTurn();
}

// Animasi mundur
async function moveBack(playerIndex, steps) {
  isMoving = true;
  let player = players[playerIndex];

  for (let i = 1; i <= steps; i++) {
    let newPos = player.position - 1;
    if (newPos < 1) break;
    player.position = newPos;
    setPionPosition(playerIndex, player.position);
    await delay(300);
  }
  isMoving = false;
}

// Giliran selanjutnya
function nextTurn() {
  if (players[currentPlayer].position === 100) {
    alert(`${players[currentPlayer].name} MENANG!`);
    rollBtn.disabled = true;
    return;
  }
  currentPlayer = (currentPlayer + 1) % 2;
  diceResultEl.textContent = `Giliran: ${players[currentPlayer].name}`;
  messageEl.textContent = "";
}

// Event lempar dadu
rollBtn.addEventListener("click", async () => {
  if (isMoving) return;
  rollBtn.disabled = true;
  messageEl.textContent = "";

  let dice = Math.floor(Math.random() * 6) + 1;
  diceResultEl.innerHTML = `<strong>Dadu: ${dice}</strong>`;

  await movePion(currentPlayer, dice);

  checkLaddersAndSnakes(currentPlayer);

  let pos = players[currentPlayer].position;

  if (questionPoints.includes(pos)) {
    showQuestion(currentPlayer);
  } else {
    rollBtn.disabled = false;
    nextTurn();
  }
});

// Inisialisasi
function init() {
  createBoard();
  createPions();
  diceResultEl.textContent = "Klik Lempar Dadu";
  posP1El.textContent = 0;
  posP2El.textContent = 0;
  messageEl.textContent = "";
  rollBtn.disabled = false;
  currentPlayer = 0;
  diceResultEl.textContent = `Giliran: ${players[currentPlayer].name}`;
}

init();
