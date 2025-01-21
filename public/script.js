const DOM_ELEMENT = {
  right: {
    card: document.querySelector("#right-card"),
    image: document.querySelector("#right-image"),
    title: document.querySelector("#right-title"),
    subtitle: document.querySelector("#right-subtitle"),
    button: document.querySelector("#right-btn"),
  },
  left: {
    card: document.querySelector("#left-card"),
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

function updateChoice(choice, value) {
  const domChoice = DOM_ELEMENT[choice];
  if (!domChoice) return;

  if (value.image) {
    domChoice.image.src = value.image;
  }
  if (value.title) {
    domChoice.title.textContent = value.title;
  }
  if (value.subtitle) {
    domChoice.subtitle.textContent = value.subtitle;
    domChoice.subtitle.classList.remove("hidden");
  } else {
    domChoice.subtitle.classList.add("hidden");
  }

  if (value.state) {
    domChoice.card.classList.add(value.state);
  } else {
    domChoice.card.classList.remove("winner", "loser");
  }
}

function updateActions(isVoted) {
  DOM_ELEMENT.left.button.classList.toggle("hidden", isVoted);
  DOM_ELEMENT.right.button.classList.toggle("hidden", isVoted);
  DOM_ELEMENT.next.classList.toggle("hidden", !isVoted);
}

async function loadRandomChallenge() {
  DOM_ELEMENT.loader.classList.remove("hidden");
  const result = await fetch("/api/challenges/random").then((res) =>
    res.json()
  );
  challengeId = result.id;
  console.log({ challengeId });

  updateChoice("left", {
    title: result.left_label,
    image: result.left_image,
  });
  updateChoice("right", {
    title: result.right_label,
    image: result.right_image,
  });
  DOM_ELEMENT.loader.classList.add("hidden");
}

async function voteChoice(choice) {
  if (!challengeId) {
    alert("No challenge id");
    return;
  }
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

  updateChoice("right", {
    subtitle: `${rightVotePercentage}%`,
    state: rightVotePercentage > 50 ? "winner" : "loser",
  });
  updateChoice("left", {
    subtitle: `${leftVotePercentage}%`,
    state: leftVotePercentage > 50 ? "winner" : "loser",
  });
  updateActions(true);
}

async function next() {
  updateActions(false);
  await loadRandomChallenge();
  isVoted = false;
}

document.addEventListener("DOMContentLoaded", () => {
  loadRandomChallenge();
});

DOM_ELEMENT.next.addEventListener("click", () => {
  next();
});
DOM_ELEMENT.left.button.addEventListener("click", () => {
  voteChoice("left");
});
DOM_ELEMENT.left.card.addEventListener("click", () => {
  voteChoice("left");
});

DOM_ELEMENT.right.button.addEventListener("click", () => {
  voteChoice("right");
});
DOM_ELEMENT.right.card.addEventListener("click", () => {
  voteChoice("right");
});
