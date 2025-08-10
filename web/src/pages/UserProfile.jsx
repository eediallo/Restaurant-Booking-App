import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { triggerHapticFeedback } from "../utils/mobileUtils";
import { userAPI } from "../services/api";
import "./UserProfile.css";

const UserProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    // Extended profile fields
    date_of_birth: "",
    dining_preferences: {
      dietary_restrictions: [],
      preferred_cuisine: [],
      seating_preference: "",
      occasion_types: [],
    },
    notification_preferences: {
      email_notifications: true,
      sms_notifications: false,
      booking_reminders: true,
      promotional_emails: false,
    },
    accessibility_needs: "",
    emergency_contact: {
      name: "",
      phone: "",
      relationship: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [avatarPreview, setAvatarPreview] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch user profile from API
      const userData = await userAPI.getProfile();
      
      setProfileData({
        username: userData.username || "",
        email: userData.email || "",
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone: userData.phone || "",
        date_of_birth: userData.date_of_birth || "",
        accessibility_needs: userData.accessibility_needs || "",
        dining_preferences: userData.dining_preferences || {
          dietary_restrictions: [],
          preferred_cuisine: [],
          seating_preference: "",
          occasion_types: [],
        },
        notification_preferences: userData.notification_preferences || {
          email_notifications: true,
          sms_notifications: false,
          booking_reminders: true,
          promotional_emails: false,
        },
        emergency_contact: userData.emergency_contact || {
          name: "",
          phone: "",
          relationship: "",
        },
      });
    } catch (err) {
      setError("Failed to load profile data");
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      // Handle nested fields like dining_preferences.seating_preference
      const [parent, child] = field.split(".");
      setProfileData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleArrayChange = (field, value, checked) => {
    const [parent, child] = field.split(".");
    setProfileData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: checked
          ? [...prev[parent][child], value]
          : prev[parent][child].filter((item) => item !== value),
      },
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      triggerHapticFeedback("medium");

      // Call the real API to update profile
      await userAPI.updateProfile(profileData);

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update profile");
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Nut-Free",
    "Halal",
    "Kosher",
    "Keto",
    "Paleo",
  ];

  const cuisineOptions = [
    "Italian",
    "French",
    "Asian",
    "Mediterranean",
    "Mexican",
    "Indian",
    "Japanese",
    "Thai",
    "American",
    "British",
  ];

  const seatingOptions = [
    "Window",
    "Quiet Corner",
    "Bar Area",
    "Outdoor Terrace",
    "Private Booth",
    "Near Kitchen",
    "Center of Restaurant",
  ];

  const occasionOptions = [
    "Business Dinner",
    "Romantic Date",
    "Family Celebration",
    "Birthday Party",
    "Anniversary",
    "Casual Dining",
    "Group Event",
  ];

  if (loading) {
    return (
      <div className="user-profile">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and dining preferences</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-container">
        {/* Profile Navigation Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === "basic" ? "active" : ""}`}
            onClick={() => setActiveTab("basic")}
          >
            Basic Info
          </button>
          <button
            className={`tab-btn ${activeTab === "preferences" ? "active" : ""}`}
            onClick={() => setActiveTab("preferences")}
          >
            Dining Preferences
          </button>
          <button
            className={`tab-btn ${
              activeTab === "notifications" ? "active" : ""
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
          <button
            className={`tab-btn ${activeTab === "emergency" ? "active" : ""}`}
            onClick={() => setActiveTab("emergency")}
          >
            Emergency Contact
          </button>
        </div>

        <div className="profile-content">
          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className="profile-section">
              <h2>Basic Information</h2>

              {/* Avatar Upload */}
              <div className="avatar-section">
                <div className="avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder">
                      {profileData.first_name?.[0] ||
                        user?.username?.[0] ||
                        "?"}
                    </div>
                  )}
                </div>
                <div className="avatar-upload">
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <label htmlFor="avatar" className="upload-btn">
                    Change Photo
                  </label>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    value={profileData.first_name}
                    onChange={(e) =>
                      handleInputChange("first_name", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    value={profileData.last_name}
                    onChange={(e) =>
                      handleInputChange("last_name", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date_of_birth">Date of Birth</label>
                  <input
                    type="date"
                    id="date_of_birth"
                    value={profileData.date_of_birth}
                    onChange={(e) =>
                      handleInputChange("date_of_birth", e.target.value)
                    }
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="accessibility_needs">
                    Accessibility Needs
                  </label>
                  <textarea
                    id="accessibility_needs"
                    value={profileData.accessibility_needs}
                    onChange={(e) =>
                      handleInputChange("accessibility_needs", e.target.value)
                    }
                    placeholder="Please describe any accessibility requirements..."
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dining Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="profile-section">
              <h2>Dining Preferences</h2>

              <div className="preferences-grid">
                <div className="preference-group">
                  <h3>Dietary Restrictions</h3>
                  <div className="checkbox-grid">
                    {dietaryOptions.map((option) => (
                      <label key={option} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={profileData.dining_preferences.dietary_restrictions.includes(
                            option
                          )}
                          onChange={(e) =>
                            handleArrayChange(
                              "dining_preferences.dietary_restrictions",
                              option,
                              e.target.checked
                            )
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="preference-group">
                  <h3>Preferred Cuisines</h3>
                  <div className="checkbox-grid">
                    {cuisineOptions.map((option) => (
                      <label key={option} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={profileData.dining_preferences.preferred_cuisine.includes(
                            option
                          )}
                          onChange={(e) =>
                            handleArrayChange(
                              "dining_preferences.preferred_cuisine",
                              option,
                              e.target.checked
                            )
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="preference-group">
                  <h3>Seating Preference</h3>
                  <select
                    value={profileData.dining_preferences.seating_preference}
                    onChange={(e) =>
                      handleInputChange(
                        "dining_preferences.seating_preference",
                        e.target.value
                      )
                    }
                  >
                    <option value="">No preference</option>
                    {seatingOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="preference-group">
                  <h3>Typical Occasions</h3>
                  <div className="checkbox-grid">
                    {occasionOptions.map((option) => (
                      <label key={option} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={profileData.dining_preferences.occasion_types.includes(
                            option
                          )}
                          onChange={(e) =>
                            handleArrayChange(
                              "dining_preferences.occasion_types",
                              option,
                              e.target.checked
                            )
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Preferences Tab */}
          {activeTab === "notifications" && (
            <div className="profile-section">
              <h2>Notification Preferences</h2>

              <div className="notification-options">
                <div className="notification-item">
                  <label className="switch-label">
                    <input
                      type="checkbox"
                      checked={
                        profileData.notification_preferences.email_notifications
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "notification_preferences.email_notifications",
                          e.target.checked
                        )
                      }
                    />
                    <span className="switch"></span>
                    <div className="notification-text">
                      <strong>Email Notifications</strong>
                      <p>Receive booking confirmations and updates via email</p>
                    </div>
                  </label>
                </div>

                <div className="notification-item">
                  <label className="switch-label">
                    <input
                      type="checkbox"
                      checked={
                        profileData.notification_preferences.sms_notifications
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "notification_preferences.sms_notifications",
                          e.target.checked
                        )
                      }
                    />
                    <span className="switch"></span>
                    <div className="notification-text">
                      <strong>SMS Notifications</strong>
                      <p>Receive text message alerts for important updates</p>
                    </div>
                  </label>
                </div>

                <div className="notification-item">
                  <label className="switch-label">
                    <input
                      type="checkbox"
                      checked={
                        profileData.notification_preferences.booking_reminders
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "notification_preferences.booking_reminders",
                          e.target.checked
                        )
                      }
                    />
                    <span className="switch"></span>
                    <div className="notification-text">
                      <strong>Booking Reminders</strong>
                      <p>Get reminded about upcoming reservations</p>
                    </div>
                  </label>
                </div>

                <div className="notification-item">
                  <label className="switch-label">
                    <input
                      type="checkbox"
                      checked={
                        profileData.notification_preferences.promotional_emails
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "notification_preferences.promotional_emails",
                          e.target.checked
                        )
                      }
                    />
                    <span className="switch"></span>
                    <div className="notification-text">
                      <strong>Promotional Emails</strong>
                      <p>Receive special offers and restaurant news</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === "emergency" && (
            <div className="profile-section">
              <h2>Emergency Contact</h2>
              <p className="section-description">
                Provide emergency contact information for your safety and peace
                of mind.
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="emergency_name">Contact Name</label>
                  <input
                    type="text"
                    id="emergency_name"
                    value={profileData.emergency_contact.name}
                    onChange={(e) =>
                      handleInputChange(
                        "emergency_contact.name",
                        e.target.value
                      )
                    }
                    placeholder="Full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emergency_phone">Contact Phone</label>
                  <input
                    type="tel"
                    id="emergency_phone"
                    value={profileData.emergency_contact.phone}
                    onChange={(e) =>
                      handleInputChange(
                        "emergency_contact.phone",
                        e.target.value
                      )
                    }
                    placeholder="Phone number"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="emergency_relationship">Relationship</label>
                  <select
                    id="emergency_relationship"
                    value={profileData.emergency_contact.relationship}
                    onChange={(e) =>
                      handleInputChange(
                        "emergency_contact.relationship",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse/Partner</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="colleague">Colleague</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="profile-actions">
          <button onClick={saveProfile} disabled={saving} className="save-btn">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
