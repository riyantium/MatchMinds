_profiles = []


def add_profile(profile: dict):
    stored_profile = profile.copy()
    _profiles.append(stored_profile)
    return stored_profile.copy()


def get_profiles():
    return [profile.copy() for profile in _profiles]


def clear_profiles():
    _profiles.clear()
