document.addEventListener("DOMContentLoaded", () => {
    const createProfileChoice = document.getElementById("create-profile-choice");
    const existingProfileChoice = document.getElementById("existing-profile-choice");
    const createProfilePanel = document.getElementById("create-profile-panel");
    const existingProfilePanel = document.getElementById("existing-profile-panel");

    const form = document.getElementById("profile-form");
    const submitButton = document.getElementById("submit-profile-button");
    const loadDemoProfilesButton = document.getElementById("load-demo-profiles-button");
    const participantSelect = document.getElementById("participant-select");
    const findMatchButton = document.getElementById("find-match-button");
    const participantCountElement = document.getElementById("participant-count");

    const statusElement = document.getElementById("match-status");
    const bestTeammateElement = document.getElementById("best-teammate");
    const compatibilityScoreElement = document.getElementById("compatibility-score");
    const sharedInterestsSkillsElement = document.getElementById("shared-interests-skills");
    const complementarySkillsElement = document.getElementById("complementary-skills");
    const aiExplanationElement = document.getElementById("ai-explanation");
    const whyGoodMatchElement = document.getElementById("why-good-match");
    const projectIdeaElement = document.getElementById("project-idea");
    const teamNameElement = document.getElementById("team-name");
    const combinedSkillsElement = document.getElementById("combined-skills");

    const savedProfileKey = "matchminds_saved_profile";
    const buttonText = {
        submit: "Submit Profile",
        loadDemoProfiles: "Quick Demo",
        findMatch: "\uD83D\uDD0D Find My Match",
    };

    let participantProfiles = [];
    let isLoading = false;

    //const savedProfile = loadSavedProfile();
    //if (savedProfile) {
    //    restoreProfile(savedProfile);
    //}

    setMode("create");
    updateControlStates();
    refreshParticipants();

    createProfileChoice.addEventListener("click", () => {
        setMode("create");
        form.reset();
    });

    existingProfileChoice.addEventListener("click", () => {
        setMode("existing");
        refreshParticipants();
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const profile = collectProfile();

        try {
            setLoading(true, "Submitting your profile...");

            const response = await postJson("/submit_profile", profile);
            const submittedProfile = response.profile || profile;

            saveProfile(submittedProfile);
            restoreProfile(submittedProfile);
            await refreshParticipants(submittedProfile.name);
            setMode("existing");

            statusElement.textContent =
                "Profile submitted successfully. You can now find your teammate.";
        } catch (error) {
            showError(error, "Could not submit your profile. Please try again.");
        } finally {
            setLoading(false);
        }
    });

    loadDemoProfilesButton.addEventListener("click", async () => {
        try {
            setLoading(true, "Loading the demo dataset...");

            const response = await postJson("/load_demo_profiles", {});
            await refreshParticipants();

            statusElement.textContent =
                response.message || "Demo dataset loaded successfully!";
        } catch (error) {
            showError(error, "Could not load the demo dataset. Please try again.");
        } finally {
            setLoading(false);
        }
    });

    findMatchButton.addEventListener("click", findMatchForSelectedParticipant);

    const deleteProfileButton = document.getElementById("delete-profile-button");

    deleteProfileButton.addEventListener("click", async () => {
        const selectedProfile = getSelectedParticipantProfile();
        if (!selectedProfile) {
            statusElement.textContent = "Select a profile to delete first.";
            return;
        }

        const confirmed = confirm(`Are you sure you want to delete ${selectedProfile.name}'s profile?`);
        if (!confirmed) return;

        try {
            setLoading(true, "Deleting profile...");
            await postJson("/delete_profile", { name: selectedProfile.name });
            await refreshParticipants();
            statusElement.textContent = `${selectedProfile.name}'s profile has been deleted.`;
        } catch (error) {
            showError(error, "Could not delete the profile. Please try again.");
        } finally {
            setLoading(false);
        }
    });

    async function findMatchForSelectedParticipant() {
        const selectedProfile = getSelectedParticipantProfile();

        if (!selectedProfile) {
            statusElement.textContent =
                "Choose a registered participant first, or create a new profile.";
            return;
        }

        try {
            setLoading(true, `Finding a match for ${selectedProfile.name}...`);

            const response = await postJson("/find_match", {
                current_profile: selectedProfile,
            });

            renderMatch(response);
        } catch (error) {
            showError(error, "Could not find a match right now. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function setMode(mode) {
        const isCreateMode = mode === "create";

        createProfilePanel.hidden = !isCreateMode;
        existingProfilePanel.hidden = isCreateMode;

        createProfileChoice.setAttribute("aria-pressed", String(isCreateMode));
        existingProfileChoice.setAttribute("aria-pressed", String(!isCreateMode));

        createProfileChoice.classList.toggle("primary-button", isCreateMode);
        createProfileChoice.classList.toggle("secondary-button", !isCreateMode);
        existingProfileChoice.classList.toggle("primary-button", !isCreateMode);
        existingProfileChoice.classList.toggle("secondary-button", isCreateMode);

        statusElement.textContent = isCreateMode
            ? "Create a profile, then switch to the participant list to find a match."
            : "Choose your name from the participant list to find your match.";
    }

    async function refreshParticipants(preferredName) {
        try {
            const data = await getJson("/profiles");
            participantProfiles = data.profiles || [];
            renderParticipantOptions(preferredName);
        } catch (error) {
            participantProfiles = [];
            renderParticipantOptions();
            statusElement.textContent =
                "Participant list is unavailable right now. Please try again.";
        }
    }

    function renderParticipantOptions(preferredName) {
        participantCountElement.textContent = String(participantProfiles.length);
        participantSelect.innerHTML = "";

        if (participantProfiles.length === 0) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "No participants registered yet";
            participantSelect.appendChild(option);
            updateControlStates();
            return;
        }

        participantProfiles.forEach((profile, index) => {
            const option = document.createElement("option");
            option.value = String(index);
            option.textContent = profile.name || `Participant ${index + 1}`;
            participantSelect.appendChild(option);
        });

        if (preferredName) {
            let preferredIndex = -1;

            for (let index = participantProfiles.length - 1; index >= 0; index -= 1) {
                if (participantProfiles[index].name === preferredName) {
                    preferredIndex = index;
                    break;
                }
            }

            if (preferredIndex >= 0) {
                participantSelect.value = String(preferredIndex);
            }
        }

        updateControlStates();
    }

    function collectProfile() {
        const projectInterest = document.getElementById("project-interest").value.trim();

        return {
            name: document.getElementById("name").value.trim(),
            skills: document.getElementById("skills").value.trim(),
            looking_for: document.getElementById("looking-for").value.trim(),
            project_interest: projectInterest,
            project_idea: projectInterest,
        };
    }

    function restoreProfile(profile) {
        document.getElementById("name").value = profile.name || "";
        document.getElementById("skills").value = profile.skills || "";
        document.getElementById("looking-for").value = profile.looking_for || "";
        document.getElementById("project-interest").value =
            profile.project_interest || profile.project_idea || "";
    }

    function getSelectedParticipantProfile() {
        const selectedIndex = Number(participantSelect.value);

        if (!Number.isInteger(selectedIndex)) {
            return null;
        }

        return participantProfiles[selectedIndex] || null;
    }

    function saveProfile(profile) {
        try {
            localStorage.setItem(savedProfileKey, JSON.stringify(profile));
        } catch (error) {
            return;
        }
    }

    function loadSavedProfile() {
        let savedProfile = null;

        try {
            savedProfile = localStorage.getItem(savedProfileKey);
        } catch (error) {
            return null;
        }

        if (!savedProfile) {
            return null;
        }

        try {
            return JSON.parse(savedProfile);
        } catch (error) {
            try {
                localStorage.removeItem(savedProfileKey);
            } catch (removeError) {
                return null;
            }
            return null;
        }
    }

    async function getJson(url) {
        const response = await fetch(url);
        return readJsonResponse(response);
    }

    async function postJson(url, payload) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        return readJsonResponse(response);
    }

    async function readJsonResponse(response) {
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
        document.querySelector('.match-details').style.display = 'grid';
        document.querySelector('.match-enhancements').style.display = 'block';
        const match = response.match || response;

        statusElement.textContent =
            response.message || match.message || "Match found successfully.";

        bestTeammateElement.textContent = formatTeammate(match.best_teammate);
        compatibilityScoreElement.textContent = formatScore(match.compatibility_score);
        sharedInterestsSkillsElement.textContent = formatList(match.shared_interests_or_skills);
        complementarySkillsElement.textContent = formatList(match.complementary_skills);
        aiExplanationElement.textContent = match.explanation || "-";
        whyGoodMatchElement.textContent = match.why_good_match || match.explanation || "-";
        projectIdeaElement.textContent = match.project_idea || "-";
        teamNameElement.textContent = match.team_name || "-";
        combinedSkillsElement.textContent = formatList(match.combined_skills);
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

    function setLoading(loading, message) {
        isLoading = loading;
        const overlay = document.getElementById("loading-overlay");
        const loadingText = document.getElementById("loading-text");

        if (loading) {
            overlay.classList.add("active");
            loadingText.textContent = message || "Please wait...";
        } else {
            overlay.classList.remove("active");
        }

        submitButton.textContent = loading ? "Please wait..." : buttonText.submit;
        loadDemoProfilesButton.textContent = loading ? "Loading..." : buttonText.loadDemoProfiles;
        findMatchButton.textContent = loading ? "Matching..." : buttonText.findMatch;

        updateControlStates();
    }

    function updateControlStates() {
        createProfileChoice.disabled = isLoading;
        existingProfileChoice.disabled = isLoading;
        submitButton.disabled = isLoading;
        loadDemoProfilesButton.disabled = isLoading;
        participantSelect.disabled = isLoading || participantProfiles.length === 0;
        findMatchButton.disabled = isLoading || participantProfiles.length === 0;
    }

    function showError(error, fallbackMessage) {
        statusElement.textContent = error.message || fallbackMessage;
    }
});
