import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./BookingTemplates.css";
import { useAuth } from "../contexts/AuthContext";
import "./BookingTemplates.css";

const BookingTemplates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const loadBookingTemplates = useCallback(() => {
    // Load templates from localStorage (in a real app, this would be from the API)
    const savedTemplates = localStorage.getItem(
      `booking_templates_${user?.id}`
    );
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, [user?.id]);

  useEffect(() => {
    loadBookingTemplates();
  }, [loadBookingTemplates]);

  const deleteTemplate = (templateId) => {
    const updatedTemplates = templates.filter((t) => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem(
      `booking_templates_${user?.id}`,
      JSON.stringify(updatedTemplates)
    );
  };

  const applyTemplate = (template) => {
    // Store template data and navigate to booking form
    localStorage.setItem(
      "pendingBooking",
      JSON.stringify({
        visitTime: template.preferred_time,
        partySize: template.party_size,
        specialRequests: template.special_requests,
        channelCode: "ONLINE",
      })
    );
    navigate("/book");
  };

  const quickBookingOptions = [
    {
      name: "Business Lunch",
      time: "12:30",
      size: 2,
      requests: "Quiet table for business discussion",
    },
    {
      name: "Romantic Dinner",
      time: "19:30",
      size: 2,
      requests: "Window table, intimate setting",
    },
    {
      name: "Family Dinner",
      time: "18:00",
      size: 4,
      requests: "Family-friendly seating",
    },
    {
      name: "Quick Bite",
      time: "13:00",
      size: 1,
      requests: "Bar seating is fine",
    },
  ];

  return (
    <div className="booking-templates">
      <div className="templates-header">
        <h2>Quick Booking Templates</h2>
        <p>Save your favorite booking preferences for faster reservations</p>
      </div>

      {/* Quick Options */}
      <div className="quick-options-section">
        <h3>Popular Templates</h3>
        <div className="quick-options-grid">
          {quickBookingOptions.map((option, index) => (
            <div key={index} className="quick-option-card">
              <h4>{option.name}</h4>
              <div className="option-details">
                <span>🕐 {option.time}</span>
                <span>👥 {option.size} guests</span>
              </div>
              <p>{option.requests}</p>
              <button
                onClick={() =>
                  applyTemplate({
                    preferred_time: option.time,
                    party_size: option.size,
                    special_requests: option.requests,
                  })
                }
                className="use-template-btn"
              >
                Use This Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Templates */}
      <div className="custom-templates-section">
        <div className="section-header">
          <h3>Your Custom Templates</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="create-template-btn"
          >
            + Create Template
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="no-templates">
            <p>No custom templates yet. Create one to save your preferences!</p>
          </div>
        ) : (
          <div className="custom-templates-grid">
            {templates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="template-header">
                  <h4>{template.name}</h4>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="delete-btn"
                  >
                    ×
                  </button>
                </div>
                <div className="template-details">
                  <span>🕐 {template.preferred_time}</span>
                  <span>👥 {template.party_size} guests</span>
                </div>
                {template.special_requests && (
                  <p className="template-requests">
                    {template.special_requests}
                  </p>
                )}
                <button
                  onClick={() => applyTemplate(template)}
                  className="use-template-btn"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Booking Template</h3>
              <button
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="templateName">Template Name</label>
                <input
                  type="text"
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Weekly Team Lunch"
                />
              </div>
              <p>
                Complete your booking preferences by continuing to the booking
                form.
              </p>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowCreateModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (templateName.trim()) {
                    navigate("/book", {
                      state: { createTemplate: templateName },
                    });
                    setShowCreateModal(false);
                  }
                }}
                className="continue-btn"
                disabled={!templateName.trim()}
              >
                Continue to Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTemplates;
