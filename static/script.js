document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("profile-form");
    const submitButton = document.getElementById("submit-profile-button");
    const findMatchButton = document.getElementById("find-match-button");
    const findSavedMatchButton = document.getElementById("find-saved-match-button");
    const editProfileButton = document.getElementById("edit-profile-button");
    const loadDemoProfilesButton = document.getElementById("load-demo-profiles-button");

    const statusElement = document.getElementById("match-status");
    const bestTeammateElement = document.getElementById("best-teammate");
    const compatibilityScoreElement = document.getElementById("compatibility-score");
    const sharedInterestsSkillsElement = document.getElementById("shared-interests-skills");
    const complementarySkillsElement = document.getElementById("complementary-skills");
    const aiExplanationElement = document.getElementById("ai-explanation");

    const savedProfileKey = "matchminds_saved_profile";
    const buttonText = {
        submit: "Submit Profile",
        findMatch: "Find Match",
        findSavedMatch: "🔍 Find My Match",
        editProfile: "✏️ Edit Profile",
        loadDemoProfiles: "Load Demo Profiles",
    };

    let lastSubmittedProfile = null;
    let lastSubmittedProfileSignature = "";

    const savedProfile = loadSavedProfile();
    if (savedProfile) {
        restoreProfile(savedProfile);
        lastSubmittedProfile = savedProfile;
        lastSubmittedProfileSignature = profileSignature(savedProfile);
        statusElement.textContent = "Saved profile restored. You can now find your teammate.";
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const profile = collectProfile();

        try {
            setLoading(true, "Submitting your profile...");

            const response = await postJson("/submit_profile", profile);

            lastSubmittedProfile = response.profile || profile;
            lastSubmittedProfileSignature = profileSignature(lastSubmittedProfile);
            saveProfile(lastSubmittedProfile);
            statusElement.textContent = "Profile submitted successfully. You can now find your teammate.";
        } catch (error) {
            showError(error, "Could not submit your profile. Please try again.");
        } finally {
            setLoading(false);
        }
    });

    findMatchButton.addEventListener("click", async () => {
        try {
            setLoading(true, "Finding your best teammate...");

            const currentProfile = getProfileForMatch();
            const response = await postJson("/find_match", {
                current_profile: currentProfile,
            });

            renderMatch(response);
        } catch (error) {
            showError(error, "Could not find a match right now. Please try again.");
        } finally {
            setLoading(false);
        }
    });

    findSavedMatchButton.addEventListener("click", async () => {
        const savedProfile = loadSavedProfile();

        if (!savedProfile) {
            statusElement.textContent = "Create and submit your profile first, then we can find your match.";
            return;
        }

        try {
            setLoading(true, "Finding your saved profile match...");

            const response = await postJson("/find_match", {
                current_profile: savedProfile,
            });

            renderMatch(response);
        } catch (error) {
            showError(error, "Could not find a match right now. Please try again.");
        } finally {
            setLoading(false);
        }
    });

    editProfileButton.addEventListener("click", () => {
        const savedProfile = loadSavedProfile();

        if (!savedProfile) {
            statusElement.textContent = "Create and submit your profile first, then you can edit it.";
            document.getElementById("name").focus();
            return;
        }

        restoreProfile(savedProfile);
        lastSubmittedProfile = savedProfile;
        lastSubmittedProfileSignature = profileSignature(savedProfile);
        statusElement.textContent = "Edit your saved profile, then submit again to save changes.";
        document.getElementById("name").focus();
    });

    loadDemoProfilesButton.addEventListener("click", async () => {
        try {
            setLoading(true, "Loading demo profiles...");

            const response = await postJson("/load_demo_profiles", {});

            statusElement.textContent =
                response.message || "6 demo profiles loaded successfully!";
        } catch (error) {
            showError(error, "Could not load demo profiles. Please try again.");
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

    function restoreProfile(profile) {
        document.getElementById("name").value = profile.name || "";
        document.getElementById("skills").value = profile.skills || "";
        document.getElementById("looking-for").value = profile.looking_for || "";
        document.getElementById("project-interest").value = profile.project_interest || "";
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

    function getProfileForMatch() {
        const currentFormProfile = collectProfile();

        if (
            lastSubmittedProfile &&
            profileSignature(currentFormProfile) === lastSubmittedProfileSignature
        ) {
            return lastSubmittedProfile;
        }

        return currentFormProfile;
    }

    function profileSignature(profile) {
        return JSON.stringify({
            name: profile.name || "",
            skills: profile.skills || "",
            looking_for: profile.looking_for || "",
            project_interest: profile.project_interest || "",
        });
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
        findSavedMatchButton.disabled = isLoading;
        editProfileButton.disabled = isLoading;
        loadDemoProfilesButton.disabled = isLoading;

        submitButton.textContent = isLoading ? "Please wait..." : buttonText.submit;
        findMatchButton.textContent = isLoading ? "Matching..." : buttonText.findMatch;
        findSavedMatchButton.textContent = isLoading ? "Matching..." : buttonText.findSavedMatch;
        editProfileButton.textContent = isLoading ? "Please wait..." : buttonText.editProfile;
        loadDemoProfilesButton.textContent = isLoading ? "Loading..." : buttonText.loadDemoProfiles;

        if (message) {
            statusElement.textContent = message;
        }
    }

    function showError(error, fallbackMessage) {
        statusElement.textContent = error.message || fallbackMessage;
    }
});
