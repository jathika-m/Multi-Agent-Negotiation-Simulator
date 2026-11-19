const STORE = "pactora";

function readData(key, fallback = null) {
  try {
    return JSON.parse(
      localStorage.getItem(`${STORE}:${key}`)
    ) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(
    `${STORE}:${key}`,
    JSON.stringify(value)
  );
}

function money(value) {
  return "$" + Number(value || 0).toLocaleString("en-US");
}

function showToast(message) {
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;

  toast.style.cssText = `
    position: fixed;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
    z-index: 99;
    background: #17162b;
    color: white;
    padding: 12px 18px;
    border-radius: 9px;
    font-size: 13px;
    box-shadow: var(--shadow);
  `;

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

function setupMobileMenu() {
  const sidebar = document.querySelector("#sidebar");
  const overlay = document.querySelector("#sidebarOverlay");
  const menuButton = document.querySelector("#menuBtn");

  menuButton?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
    overlay?.classList.toggle("open");
  });

  overlay?.addEventListener("click", () => {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("open");
  });
}

function authenticateUser(email, password) {
  if (!email || !email.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  if (!password || password.length < 6) {
    throw new Error(
      "Password must contain at least 6 characters."
    );
  }

  const name = email
    .split("@")[0]
    .replace(/[._-]/g, " ")
    .replace(
      /\b\w/g,
      character => character.toUpperCase()
    );

  const profile = {
    name,
    email
  };

  saveData("profile", profile);
  saveData("authenticated", true);

  return profile;
}

function setupAuthentication() {
  const form = document.querySelector("#authForm");

  if (!form) {
    return;
  }

  let signupMode = false;

  const title = document.querySelector("#authTitle");
  const submitButton = document.querySelector("#authSubmit");
  const toggleButton = document.querySelector("#signupToggle");
  const forgotButton = document.querySelector("#forgotBtn");
  const errorMessage = document.querySelector("#authError");
  const switchText = document.querySelector(".switch-auth");

  toggleButton?.addEventListener("click", () => {
    signupMode = !signupMode;

    title.textContent = signupMode
      ? "Create your account"
      : "Sign in to your account";

    submitButton.textContent = signupMode
      ? "Create account"
      : "Sign in";

    toggleButton.textContent = signupMode
      ? "Sign in instead"
      : "Create an account";

    switchText.firstChild.textContent = signupMode
      ? "Already have an account? "
      : "New to Pactora? ";

    errorMessage.textContent = "";
  });

  forgotButton?.addEventListener("click", () => {
    showToast(
      "Password reset instructions have been sent."
    );
  });

  form.addEventListener("submit", event => {
    event.preventDefault();

    try {
      authenticateUser(
        form.email.value.trim(),
        form.password.value
      );

      window.location.href = "dashboard.html";
    } catch (error) {
      errorMessage.textContent = error.message;
    }
  });
}

function setupDashboard() {
  const activityContainer =
    document.querySelector("#recentActivity");

  if (!activityContainer) {
    return;
  }

  const profile = readData("profile", {
    name: "Jamie Doe",
    email: "jamie@pactora.ai"
  });

  const profileName =
    document.querySelector("#userName");

  const profileEmail =
    document.querySelector("#userEmail");

  const profileInitial =
    document.querySelector("#userInitial");

  const welcomeName =
    document.querySelector("#welcomeName");

  if (profileName) {
    profileName.textContent = profile.name;
  }

  if (profileEmail) {
    profileEmail.textContent = profile.email;
  }

  if (profileInitial) {
    profileInitial.textContent = profile.name
      .split(" ")
      .map(word => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  if (welcomeName) {
    welcomeName.textContent =
      `Good morning, ${profile.name.split(" ")[0]}`;
  }

  const history = readData("history", []);

  const total = history.length || 24;

  const successful = history.length
    ? history.filter(item => item.agreed).length
    : 20;

  const successRate = history.length
    ? ((successful / total) * 100).toFixed(1)
    : "83.3";

  document.querySelector("#totalSessions").textContent =
    total;

  document.querySelector("#successfulSessions").textContent =
    successful;

  document.querySelector("#successRate").textContent =
    `${successRate}%`;

  const activities = [
    [
      "Vendor pricing",
      "AI vs AI · Completed",
      "success",
      "Agreed"
    ],
    [
      "Job offer",
      "Human vs AI · Completed",
      "success",
      "Agreed"
    ],
    [
      "Project budget",
      "AI vs AI · Failed",
      "failed",
      "Failed"
    ]
  ];

  activityContainer.innerHTML = activities.map(
    (item, index) => `
      <div class="activity-item">
        <div class="activity-icon">
          ${
            index === 0
              ? "◈"
              : index === 1
                ? "◆"
                : "▣"
          }
        </div>

        <div>
          <strong>${item[0]}</strong>
          <span>${item[1]}</span>
        </div>

        <span class="status ${item[2]}">
          ${item[3]}
        </span>
      </div>
    `
  ).join("");
}
function setupChoiceCards() {
  document.querySelectorAll(".choice-card").forEach(card => {
    card.addEventListener("click", () => {
      const group = card.parentElement;

      group.querySelectorAll(".choice-card").forEach(item => {
        item.classList.remove("selected");
      });

      card.classList.add("selected");

      const radio = card.querySelector("input");

      if (radio) {
        radio.checked = true;
      }

      const continueButton =
        document.querySelector("#continueMode") ||
        document.querySelector("#continueScenario");

      if (continueButton) {
        continueButton.disabled = false;
      }
    });
  });

  document.querySelector("#continueMode")
    ?.addEventListener("click", () => {
      const selected = document.querySelector(
        'input[name="mode"]:checked'
      );

      if (!selected) {
        return;
      }

      saveData("mode", selected.value);
      window.location.href = "scenario-selection.html";
    });

  document.querySelector("#continueScenario")
    ?.addEventListener("click", () => {
      const selected = document.querySelector(
        'input[name="scenario"]:checked'
      );

      if (!selected) {
        return;
      }

      saveData("scenario", selected.value);
      window.location.href = "agent-configuration.html";
    });
}

function setupAgentConfiguration() {
  const form = document.querySelector("#agentForm");

  if (!form) {
    return;
  }

  const mode = readData("mode", "ai-ai");
  const scenario = readData("scenario", "vendor");

  const scenarioData = {
    vendor: {
      agentARole: "Purchasing representative",
      agentBRole: "Vendor representative",
      agentAInitial: 90000,
      agentBInitial: 125000,
      agentAMinimum: 105000,
      agentBMinimum: 108000,
      offerLabel: "Offer",
      minimumLabel: "Minimum acceptable"
    },

    job: {
      agentARole: "Candidate",
      agentBRole: "Hiring manager",
      agentAInitial: 145000,
      agentBInitial: 125000,
      agentAMinimum: 130000,
      agentBMinimum: 135000,
      offerLabel: "Salary request",
      minimumLabel: "Minimum salary"
    },

    budget: {
      agentARole: "Project sponsor",
      agentBRole: "Delivery lead",
      agentAInitial: 180000,
      agentBInitial: 240000,
      agentAMinimum: 210000,
      agentBMinimum: 195000,
      offerLabel: "Requested budget",
      minimumLabel: "Minimum budget"
    }
  };

  const selectedScenario =
    scenarioData[scenario] || scenarioData.vendor;

  document.querySelector("#agentARole").textContent =
    selectedScenario.agentARole;

  document.querySelector("#agentBRole").textContent =
    selectedScenario.agentBRole;

  form.agentAInitial.value =
    selectedScenario.agentAInitial;

  form.agentBInitial.value =
    selectedScenario.agentBInitial;

  form.agentAMinimum.value =
    selectedScenario.agentAMinimum;

  form.agentBMinimum.value =
    selectedScenario.agentBMinimum;

  document.querySelector("#initialALabel").textContent =
    selectedScenario.offerLabel;

  document.querySelector("#initialBLabel").textContent =
    selectedScenario.offerLabel;

  document.querySelector("#minimumALabel").textContent =
    selectedScenario.minimumLabel;

  document.querySelector("#minimumBLabel").textContent =
    selectedScenario.minimumLabel;

  if (mode === "human-ai") {
    document.querySelector("#agentAHeading").textContent =
      "You · Agent A";

    document.querySelector("#agentBHeading").textContent =
      "AI · Agent B";
  }

  if (mode === "human-human") {
    document.querySelector("#agentAHeading").textContent =
      "Human · Agent A";

    document.querySelector("#agentBHeading").textContent =
      "Human · Agent B";
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    if (!form.checkValidity()) {
      document.querySelector("#configError").textContent =
        "Complete all agent fields before continuing.";

      form.reportValidity();
      return;
    }

    const configuration = Object.fromEntries(
      new FormData(form).entries()
    );

    configuration.mode = mode;
    configuration.scenario = scenario;

    saveData(
      "currentNegotiation",
      configuration
    );

    window.location.href =
      "negotiation-room.html";
  });
}

function saveNegotiationResult(result) {
  const history = readData("history", []);

  history.unshift(result);

  saveData(
    "history",
    history.slice(0, 20)
  );

  saveData("lastResult", result);
}

function setupNegotiationRoom() {
  const chat = document.querySelector("#chatMessages");

  if (!chat) {
    return;
  }

  const config = readData(
    "currentNegotiation",
    {
      mode: "ai-ai",
      scenario: "vendor",
      agentAName: "Mira",
      agentBName: "Atlas",
      agentARole: "Buyer",
      agentBRole: "Seller",
      agentAPersonality: "Rational",
      agentBPersonality: "Collaborative",
      agentAInitial: 90000,
      agentBInitial: 125000,
      agentAMinimum: 105000,
      agentBMinimum: 108000
    }
  );

  const scenarioNames = {
    vendor: "Vendor Pricing Negotiation",
    job: "Job Offer Negotiation",
    budget: "Project Budget Allocation"
  };

  const modeNames = {
    "ai-ai": "AI vs AI",
    "human-ai": "Human vs AI",
    "human-human": "Human vs Human"
  };

  document.querySelector("#scenarioTitle").textContent =
    scenarioNames[config.scenario];

  document.querySelector("#modeTitle").textContent =
    `${modeNames[config.mode]} · Live simulation`;

  const profileA =
    document.querySelector("#profileA");

  const profileB =
    document.querySelector("#profileB");

  profileA.querySelector("h3").textContent =
    config.agentAName;

  profileA.querySelector("p").textContent =
    config.agentARole;

  profileA.querySelectorAll("strong")[0].textContent =
    config.agentAPersonality;

  profileB.querySelector("h3").textContent =
    config.agentBName;

  profileB.querySelector("p").textContent =
    config.agentBRole;

  profileB.querySelectorAll("strong")[0].textContent =
    config.agentBPersonality;

  let currentRound = 1;
  let elapsedSeconds = 300;
  let completed = false;

  const offers = [];

  function addMessage(
    name,
    message,
    offer,
    right = false
  ) {
    const messageElement =
      document.createElement("div");

    messageElement.className = right
      ? "message right"
      : "message";

    messageElement.innerHTML = `
      <div class="message-meta">
        ${name} · now
      </div>

      <div class="bubble">
        ${message}

        ${
          offer
            ? `
              <br>
              <span class="offer-badge">
                ${money(offer)}
              </span>
            `
            : ""
        }
      </div>
    `;

    chat.appendChild(messageElement);
    chat.scrollTop = chat.scrollHeight;
  }

  function addOfferHistory(name, offer) {
    offers.push({
      name,
      offer,
      round: currentRound
    });

    document.querySelector("#offerHistory").innerHTML =
      offers.slice(-5).map(item => `
        <div class="history-row">
          <span>
            ${item.name} · R${item.round}
          </span>

          <strong>
            ${money(item.offer)}
          </strong>
        </div>
      `).join("");
  }

  function finishNegotiation(
    agreed,
    finalOffer
  ) {
    if (completed) {
      return;
    }

    completed = true;
    clearInterval(timer);

    const result = {
      agreed,
      finalOffer,
      initialOffer: Number(
        config.agentAInitial
      ),
      rounds: currentRound,
      duration: 300 - elapsedSeconds,
      scenario: config.scenario,
      mode: config.mode,
      agentA: config.agentAName,
      agentB: config.agentBName,
      offers
    };

    saveNegotiationResult(result);

    setTimeout(() => {
      window.location.href =
        "negotiation-result.html";
    }, 500);
  }

  const timer = setInterval(() => {
    elapsedSeconds--;

    const minutes = String(
      Math.floor(elapsedSeconds / 60)
    ).padStart(2, "0");

    const seconds = String(
      elapsedSeconds % 60
    ).padStart(2, "0");

    document.querySelector("#timer").textContent =
      `${minutes}:${seconds}`;

    if (elapsedSeconds <= 0) {
      finishNegotiation(false, 0);
    }
  }, 1000);

  const aiMessages = [
    [
      config.agentAName,
      "I want to find a durable agreement that works for both parties.",
      Number(config.agentAInitial),
      false
    ],

    [
      config.agentBName,
      "The scope and support level are strong. I can improve the commercial position.",
      Number(config.agentBInitial) - 6000,
      true
    ],

    [
      config.agentAName,
      "That is closer. I am prepared to move toward the target if the terms remain firm.",
      Number(config.agentAInitial) + 10000,
      false
    ],

    [
      config.agentBName,
      "I can offer this as a final balanced package.",
      Number(config.agentBInitial) - 12000,
      true
    ]
  ];

  let messageIndex = 0;
    function runAiConversation() {
    if (
      completed ||
      config.mode !== "ai-ai" ||
      messageIndex >= aiMessages.length
    ) {
      return;
    }

    const [
      name,
      text,
      offer,
      right
    ] = aiMessages[messageIndex];

    messageIndex++;

    setTimeout(() => {
      if (completed) {
        return;
      }

      addMessage(
        name,
        text,
        offer,
        right
      );

      addOfferHistory(name, offer);

      currentRound++;

      document.querySelector("#roundNumber").textContent =
        `Round ${Math.min(currentRound, 6)}`;

      if (currentRound >= 5) {
        finishNegotiation(true, 112500);
      } else {
        runAiConversation();
      }
    }, 1400);
  }

  addMessage(
    config.agentAName,
    "I want to find a durable agreement that works for both parties.",
    Number(config.agentAInitial)
  );

  addOfferHistory(
    config.agentAName,
    Number(config.agentAInitial)
  );

  if (config.mode === "ai-ai") {
    runAiConversation();
  } else {
    const openingOffer = Math.round(
      (
        Number(config.agentBInitial) +
        Number(config.agentAMinimum)
      ) / 2
    );

    addMessage(
      config.agentBName,
      "Here is my opening position based on the agreed scope.",
      openingOffer,
      true
    );

    addOfferHistory(
      config.agentBName,
      openingOffer
    );

    document.querySelector("#sendHuman")
      ?.addEventListener("click", () => {
        const input =
          document.querySelector("#humanMessage");

        const message = input.value.trim();

        if (!message) {
          return;
        }

        addMessage(
          "You",
          message,
          null,
          true
        );

        input.value = "";

        setTimeout(() => {
          currentRound++;

          document.querySelector("#roundNumber").textContent =
            `Round ${Math.min(currentRound, 6)}`;

          const counterOffer =
            openingOffer - 3000;

          addMessage(
            config.agentBName,
            "I can make a measured concession while keeping the core terms intact.",
            counterOffer
          );

          addOfferHistory(
            config.agentBName,
            counterOffer
          );
        }, 800);
      });
  }

  document.querySelector("#acceptOffer")
    ?.addEventListener("click", () => {
      if (offers.length) {
        finishNegotiation(
          true,
          offers[offers.length - 1].offer
        );
      }
    });

  document.querySelector("#rejectOffer")
    ?.addEventListener("click", () => {
      finishNegotiation(false, 0);
    });
}

function setupResultPage() {
  const resultHero =
    document.querySelector("#resultHero");

  if (!resultHero) {
    return;
  }

  const result = readData(
    "lastResult",
    {
      agreed: true,
      finalOffer: 112500,
      initialOffer: 90000,
      rounds: 4,
      duration: 138
    }
  );

  if (!result.agreed) {
    resultHero.classList.add("failed");

    document.querySelector("#resultIcon")
      .textContent = "×";

    document.querySelector("#resultKicker")
      .textContent = "No agreement";

    document.querySelector("#resultTitle")
      .textContent = "Negotiation failed";

    document.querySelector("#resultSubtitle")
      .textContent =
        "The parties could not reach a mutually acceptable position.";

    document.querySelector("#finalAmount")
      .textContent = "No agreement";
  } else {
    document.querySelector("#finalAmount")
      .textContent = money(result.finalOffer);
  }

  document.querySelector("#initialAmount")
    .textContent = money(result.initialOffer);

  document.querySelector("#roundCount")
    .textContent = `${result.rounds} rounds`;

  const minutes = String(
    Math.floor(result.duration / 60)
  ).padStart(2, "0");

  const seconds = String(
    result.duration % 60
  ).padStart(2, "0");

  document.querySelector("#duration")
    .textContent = `${minutes}:${seconds}`;
}

function setupReports() {
  const reportMetrics =
    document.querySelector("#reportMetrics");

  if (!reportMetrics) {
    return;
  }

  const history =
    readData("history", []);

  const total =
    history.length || 24;

  const successful =
    history.length
      ? history.filter(item => item.agreed).length
      : 20;

  const failed =
    total - successful;

  const successRate =
    ((successful / total) * 100).toFixed(1);

  const metrics = [
    ["Total sessions", total, "◎"],
    ["Successful agreements", successful, "✓"],
    ["Failed negotiations", failed, "×"],
    ["Success rate", `${successRate}%`, "%"]
  ];

  reportMetrics.innerHTML = metrics.map(
    (metric, index) => `
      <article class="metric-card">
        <div class="metric-top">
          <span>${metric[0]}</span>

          <div class="metric-icon ${
            index === 1
              ? "green"
              : index === 2
                ? "orange"
                : ""
          }">
            ${metric[2]}
          </div>
        </div>

        <strong>${metric[1]}</strong>
      </article>
    `
  ).join("");

  const timeline =
    document.querySelector("#timeline");

  if (timeline) {
    timeline.innerHTML = `
      <div class="activity-item">
        <div class="activity-icon">V</div>

        <div>
          <strong>Vendor pricing</strong>
          <span>Agreement reached · Today</span>
        </div>

        <span class="status success">
          Agreed
        </span>
      </div>

      <div class="activity-item">
        <div class="activity-icon">J</div>

        <div>
          <strong>Job offer</strong>
          <span>Agreement reached · Yesterday</span>
        </div>

        <span class="status success">
          Agreed
        </span>
      </div>

      <div class="activity-item">
        <div class="activity-icon">P</div>

        <div>
          <strong>Project budget</strong>
          <span>Negotiation failed · Nov 17</span>
        </div>

        <span class="status failed">
          Failed
        </span>
      </div>
    `;
  }

  document.querySelector("#downloadReport")
    ?.addEventListener("click", () => {
      window.print();
    });

  if (window.Chart) {
    new Chart(
      document.querySelector("#movementChart"),
      {
        type: "line",

        data: {
          labels: [
            "R1",
            "R2",
            "R3",
            "R4",
            "R5",
            "R6"
          ],

          datasets: [
            {
              label: "Buyer",
              data: [
                90000,
                97000,
                104000,
                108000,
                112500,
                112500
              ],
              borderColor: "#6250dc",
              backgroundColor:
                "rgba(98,80,220,.08)",
              tension: .35,
              fill: true
            },

            {
              label: "Seller",
              data: [
                125000,
                119000,
                116000,
                114000,
                112500,
                112500
              ],
              borderColor: "#ed9b42",
              tension: .35
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      }
    );

    new Chart(
      document.querySelector("#outcomeChart"),
      {
        type: "doughnut",

        data: {
          labels: [
            "Successful",
            "Failed"
          ],

          datasets: [
            {
              data: [20, 4],
              backgroundColor: [
                "#6250dc",
                "#edeaf6"
              ],
              borderWidth: 0
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "72%"
        }
      }
    );
  }
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    setupMobileMenu();
    setupAuthentication();
    setupDashboard();
    setupChoiceCards();
    setupAgentConfiguration();
    setupNegotiationRoom();
    setupResultPage();
    setupReports();

    document
      .querySelectorAll("[data-action]")
      .forEach(element => {
        element.addEventListener("click", event => {
          event.preventDefault();

          showToast(
            "Settings are available in the demo workspace."
          );
        });
      });
  }
);