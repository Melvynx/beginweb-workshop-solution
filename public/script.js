// DOM
const DOM_ELEMENT = {
  right: {
    container: document.querySelector("#right"),
    image: document.querySelector("#right-image"),
    title: document.querySelector("#right-title"),
    subtitle: document.querySelector("#right-subtitle"),
    button: document.querySelector("#right-btn"),
  },
  left: {
    container: document.querySelector("#left"),
    image: document.querySelector("#left-image"),
    title: document.querySelector("#left-title"),
    subtitle: document.querySelector("#left-subtitle"),
    button: document.querySelector("#left-btn"),
  },
  next: document.querySelector("#next-btn"),
  loader: document.querySelector("#loader"),
};

// Variables
let challengeId = null;
let isVoted = false;

// Utils
function updateCard(choice, value) {
  const sideToUpdate = DOM_ELEMENT[choice];

  if (value.image) {
    sideToUpdate.image.src = value.image;
  }
  if (value.title) {
    sideToUpdate.title.textContent = value.title;
  }
  if (value.subtitle) {
    sideToUpdate.subtitle.textContent = value.subtitle;
    sideToUpdate.subtitle.classList.remove("hidden");
  } else {
    sideToUpdate.subtitle.classList.add("hidden");
  }
}

function toggleButtonVisibility(isVoted) {
  DOM_ELEMENT.left.button.classList.toggle("hidden", isVoted);
  DOM_ELEMENT.right.button.classList.toggle("hidden", isVoted);
  DOM_ELEMENT.next.classList.toggle("hidden", !isVoted);
}

// Logic
async function loadRandomChallenge() {
  DOM_ELEMENT.loader.classList.remove("hidden");
  const result = await fetch("/api/challenges/random").then((res) =>
    res.json()
  );
  console.log(result);
  challengeId = result.id;
  updateCard("left", {
    image: result.left_image,
    title: result.left_label,
  });
  updateCard("right", {
    image: result.right_image,
    title: result.right_label,
  });
  DOM_ELEMENT.loader.classList.add("hidden");
}

async function onChoose(choice) {
  console.log("Click onChoose", { challengeId, choice });
  if (!challengeId) return;
  if (isVoted) {
    next();
    return;
  }
  isVoted = true;

  const result = await fetch(`/api/challenges/${challengeId}/votes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      choice,
    }),
  }).then((res) => res.json());

  const leftVotePercentage = Math.round(
    (result.left_votes * 100) / result.total
  );
  const rightVotePercentage = Math.round(
    (result.right_votes * 100) / result.total
  );

  updateCard("right", {
    subtitle: `${rightVotePercentage}%`,
  });
  updateCard("left", {
    subtitle: `${leftVotePercentage}%`,
  });

  toggleButtonVisibility(true);
}

async function next() {
  toggleButtonVisibility(false);
  isVoted = false;
  await loadRandomChallenge();
}

// Events
document.addEventListener("DOMContentLoaded", () => {
  loadRandomChallenge();
});

DOM_ELEMENT.left.button.addEventListener("click", () => {
  onChoose("left");
});
DOM_ELEMENT.left.container.addEventListener("click", () => {
  onChoose("left");
});
DOM_ELEMENT.right.button.addEventListener("click", () => {
  onChoose("right");
});
DOM_ELEMENT.right.container.addEventListener("click", () => {
  onChoose("right");
});

DOM_ELEMENT.next.addEventListener("click", () => {
  next();
});
