document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("profile-form");
    const submitButton = document.getElementById("submit-profile-button");
    const findMatchButton = document.getElementById("find-match-button");

    const statusElement = document.getElementById("match-status");
    const bestTeammateElement = document.getElementById("best-teammate");
    const compatibilityScoreElement = document.getElementById("compatibility-score");
    const sharedInterestsSkillsElement = document.getElementById("shared-interests-skills");
    const complementarySkillsElement = document.getElementById("complementary-skills");
    const aiExplanationElement = document.getElementById("ai-explanation");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const profile = collectProfile();

        try {
            setLoading(true, "Submitting your profile...");

            const response = await postJson("/submit_profile", profile);

            statusElement.textContent = response.message || "Profile submitted successfully.";
            form.reset();
        } catch (error) {
            showError(error, "Could not submit your profile. Please try again.");
        } finally {
            setLoading(false);
        }
    });

    findMatchButton.addEventListener("click", async () => {
        try {
            setLoading(true, "Finding your best teammate...");

            const response = await postJson("/find_match", {
                current_profile: collectProfile(),
            });

            renderMatch(response);
        } catch (error) {
            showError(error, "Could not find a match right now. Please try again.");
        } finally {
            setLoading(false);
        }
    });

    function collectProfile() {
        return {
            name: document.getElementById("name").value.trim(),
            skills: document.getElementById("skills").value.trim(),
            looking_for: document.getElementById("looking-for").value.trim(),
            project_interest: document.getElementById("project-interest").value.trim(),
        };
    }

    async function postJson(url, payload) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        let data = {};
        try {
            data = await response.json();
        } catch (error) {
            throw new Error("The server returned an unreadable response.");
        }

        if (!response.ok) {
            throw new Error(data.message || "The server could not complete the request.");
        }

        return data;
    }

    function renderMatch(response) {
        const match = response.match || response;

        statusElement.textContent =
            response.message || match.message || "Match found successfully.";

        bestTeammateElement.textContent = formatTeammate(match.best_teammate);
        compatibilityScoreElement.textContent = formatScore(match.compatibility_score);
        sharedInterestsSkillsElement.textContent = formatList(match.shared_interests_or_skills);
        complementarySkillsElement.textContent = formatList(match.complementary_skills);
        aiExplanationElement.textContent = match.explanation || "-";
    }

    function formatTeammate(teammate) {
        if (!teammate) {
            return "-";
        }

        if (typeof teammate === "string") {
            return teammate;
        }

        const name = teammate.name || "Unnamed teammate";
        const skills = teammate.skills ? ` (${teammate.skills})` : "";
        return `${name}${skills}`;
    }

    function formatScore(score) {
        if (score === undefined || score === null || score === "") {
            return "-";
        }

        return `${score}/100`;
    }

    function formatList(value) {
        if (Array.isArray(value) && value.length > 0) {
            return value.join(", ");
        }

        if (typeof value === "string" && value.trim()) {
            return value;
        }

        return "-";
    }

    function setLoading(isLoading, message) {
        submitButton.disabled = isLoading;
        findMatchButton.disabled = isLoading;

        submitButton.textContent = isLoading ? "Please wait..." : "Submit Profile";
        findMatchButton.textContent = isLoading ? "Matching..." : "Find Match";

        if (message) {
            statusElement.textContent = message;
        }
    }

    function showError(error, fallbackMessage) {
        statusElement.textContent = error.message || fallbackMessage;
    }
});
