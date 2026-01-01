// SitcaForm.jsx
import React, { useState } from "react";
import "./SitcaForm.css";

const SitcaForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dob: "",
    aadhaarNumber: "",
    primaryPhone: "",
    alternatePhone: "",
    bloodGroup: "",
    medicalConditions: "",
    primaryRole: "",              // Batsman, Bowler, All-Rounder
    battingProfile: "",           // Righthand Batsman, Lefthand Batsman, Wicketkeeper
    bowlingStyle: "",
    allRounderType: "",           // Batting/Bowling/Wicketkeeper All-Rounder
    shirtSize: "Medium",
    pantSize: "",
    previousLeagues: "",
    instagram: "",
    declaration: false,
  });

  const [photo, setPhoto] = useState(null);
  const [aadhaarPhoto, setAadhaarPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFile = (e, setter) => {
    if (e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!formData.declaration) {
      alert("Please accept the declaration");
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();

    // Append all text fields
    formDataToSend.append("fullName", formData.fullName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("dob", formData.dob);
    formDataToSend.append("aadhaarNumber", formData.aadhaarNumber || "");
    formDataToSend.append("primaryPhone", formData.primaryPhone);
    formDataToSend.append("alternatePhone", formData.alternatePhone || "");
    formDataToSend.append("bloodGroup", formData.bloodGroup);
    formDataToSend.append("medicalConditions", formData.medicalConditions || "");
    formDataToSend.append("primaryRole", formData.primaryRole);
    formDataToSend.append("battingProfile", formData.battingProfile || "");
    formDataToSend.append("bowlingStyle", formData.bowlingStyle || "");
    formDataToSend.append("allRounderType", formData.allRounderType || "");
    formDataToSend.append("shirtSize", formData.shirtSize);
    formDataToSend.append("pantSize", formData.pantSize);
    formDataToSend.append("previousLeagues", formData.previousLeagues || "");
    formDataToSend.append("instagram", formData.instagram);

    // Append files
    if (photo) formDataToSend.append("photo", photo);
    if (aadhaarPhoto) formDataToSend.append("aadhaarPhoto", aadhaarPhoto);

    try {
      const res = await fetch("http://localhost:5000/api/player/register-public", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registration successful! Your details are pending admin approval.");
        alert("Thank you! Your registration has been submitted successfully.");
        // Optional: Reset form
        setFormData({
          fullName: "",
          email: "",
          dob: "",
          aadhaarNumber: "",
          primaryPhone: "",
          alternatePhone: "",
          bloodGroup: "",
          medicalConditions: "",
          primaryRole: "",
          battingProfile: "",
          bowlingStyle: "",
          allRounderType: "",
          shirtSize: "Medium",
          pantSize: "",
          previousLeagues: "",
          instagram: "",
          declaration: false,
        });
        setPhoto(null);
        setAadhaarPhoto(null);
      } else {
        setMessage(data.message || "Registration failed. Please try again.");
        alert(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setMessage("Network error. Please check your connection and try again.");
      alert("Server not reachable. Please try later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sitca-container">
      <div className="sitca-card">
        <h1 className="sitca-title">Kovai Super X (SITCA) 2025</h1>
        <p className="sitca-subtitle">Player Registration Form</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Message Display */}
          {message && (
            <div style={{
              padding: "16px",
              borderRadius: "12px",
              background: message.includes("successful") ? "rgba(0, 150, 0, 0.2)" : "rgba(150, 0, 0, 0.2)",
              color: message.includes("successful") ? "#90ee90" : "#ff9999",
              textAlign: "center",
              fontWeight: "600",
              marginBottom: "20px"
            }}>
              {message}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="input-field" placeholder="Enter full name" />
          </div>

          {/* Email */}
          <div>
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@gmail.com"
              className="input-field"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="form-label">Date of Birth <span className="required">*</span></label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required className="input-field" />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="form-label">Current Photo <span className="required">*</span></label>
            <input type="file" accept="image/*" onChange={(e) => handleFile(e, setPhoto)} required className="file-input" />
            {photo && <p className="file-name">Selected: {photo.name}</p>}
          </div>

          {/* Aadhaar Number */}
          <div>
            <label className="form-label">Aadhaar Number</label>
            <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} maxLength="12" placeholder="XXXX XXXX XXXX" className="input-field" />
          </div>

          {/* Aadhaar Photo */}
          <div>
            <label className="form-label">Aadhaar Photo <span className="required">*</span></label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => handleFile(e, setAadhaarPhoto)} required className="file-input" />
            {aadhaarPhoto && <p className="file-name">Selected: {aadhaarPhoto.name}</p>}
          </div>

          {/* Primary Phone */}
          <div>
            <label className="form-label">Primary Phone <span className="required">*</span></label>
            <input type="tel" name="primaryPhone" value={formData.primaryPhone} onChange={handleChange} required placeholder="10-digit number" className="input-field" />
          </div>

          {/* Alternate Phone */}
          <div>
            <label className="form-label">Alternate Phone</label>
            <input type="tel" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} placeholder="Optional" className="input-field" />
          </div>

          {/* Blood Group */}
          <div>
            <label className="form-label">Blood Group <span className="required">*</span></label>
            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required className="select-field input-field">
              <option value="">Select</option>
              <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
              <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
            </select>
          </div>

          {/* Medical Conditions */}
          <div>
            <label className="form-label">Medical Conditions / Injuries?</label>
            <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} rows="3" placeholder="None or specify..." className="textarea-field input-field" />
          </div>

          {/* Primary Role */}
          <div>
            <label className="form-label">
              What is your primary role in Cricket? <span className="required">*</span>
            </label>
            <div className="radio-group">
              <label className="radio-item">
                <input type="radio" name="primaryRole" value="Batsman" checked={formData.primaryRole === "Batsman"} onChange={handleChange} required />
                Batsman
              </label>
              <label className="radio-item">
                <input type="radio" name="primaryRole" value="Bowler" checked={formData.primaryRole === "Bowler"} onChange={handleChange} />
                Bowler
              </label>
              <label className="radio-item">
                <input type="radio" name="primaryRole" value="All-Rounder" checked={formData.primaryRole === "All-Rounder"} onChange={handleChange} />
                All-Rounder
              </label>
            </div>
          </div>

          {/* Batsman Section */}
          {formData.primaryRole === "Batsman" && (
            <div className="mt-6 animate-fadeIn">
              <label className="form-label">
                Select your batting profile <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-item">
                  <input type="radio" name="battingProfile" value="Righthand Batsman" checked={formData.battingProfile === "Righthand Batsman"} onChange={handleChange} required />
                  Right-hand Batsman
                </label>
                <label className="radio-item">
                  <input type="radio" name="battingProfile" value="Lefthand Batsman" checked={formData.battingProfile === "Lefthand Batsman"} onChange={handleChange} />
                  Left-hand Batsman
                </label>
                <label className="radio-item">
                  <input type="radio" name="battingProfile" value="Wicketkeeper" checked={formData.battingProfile === "Wicketkeeper"} onChange={handleChange} />
                  Wicketkeeper
                </label>
              </div>
            </div>
          )}

          {/* Bowler Section */}
          {formData.primaryRole === "Bowler" && (
            <div className="mt-6 animate-fadeIn">
              <label className="form-label">
                What is your bowling style? <span className="required">*</span>
              </label>
              <div className="radio-group">
                {[
                  "Right Arm Fast", "Left Arm Fast",
                  "Right Arm Medium Fast", "Left Arm Medium Fast",
                  "Off Spinner", "Leg Spinner",
                  "Left Arm Orthodox", "Chinaman",
                  "Right Leg Break Bowler", "Off Break Bowler"
                ].map(style => (
                  <label key={style} className="radio-item">
                    <input type="radio" name="bowlingStyle" value={style} checked={formData.bowlingStyle === style} onChange={handleChange} required />
                    {style}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* All-Rounder Section */}
          {formData.primaryRole === "All-Rounder" && (
            <div className="mt-6 animate-fadeIn">
              <label className="form-label">
                Select your All-Rounder profile <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-item">
                  <input type="radio" name="allRounderType" value="Batting All-Rounder" checked={formData.allRounderType === "Batting All-Rounder"} onChange={handleChange} required />
                  Batting All-Rounder
                </label>
                <label className="radio-item">
                  <input type="radio" name="allRounderType" value="Bowling All-Rounder" checked={formData.allRounderType === "Bowling All-Rounder"} onChange={handleChange} />
                  Bowling All-Rounder
                </label>
                <label className="radio-item">
                  <input type="radio" name="allRounderType" value="Wicketkeeper All-Rounder" checked={formData.allRounderType === "Wicketkeeper All-Rounder"} onChange={handleChange} />
                  Wicketkeeper All-Rounder
                </label>
              </div>
            </div>
          )}

          {/* Shirt Size */}
          <div>
            <label className="form-label">Shirt Size <span className="required">*</span></label>
            <select name="shirtSize" value={formData.shirtSize} onChange={handleChange} required className="select-field input-field">
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
              <option>Extra Large</option>
            </select>
          </div>

          {/* Pant Size */}
          <div>
            <label className="form-label">Pant Size (e.g. 32) <span className="required">*</span></label>
            <input type="text" name="pantSize" value={formData.pantSize} onChange={handleChange} required placeholder="32" className="input-field" />
          </div>

          {/* Previous Leagues */}
          <div>
            <label className="form-label">Previous Leagues?</label>
            <textarea name="previousLeagues" value={formData.previousLeagues} onChange={handleChange} rows="3" placeholder="Any league experience..." className="textarea-field input-field" />
          </div>

          {/* Instagram */}
          <div>
            <label className="form-label">Instagram Username <span className="required">*</span></label>
            <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} required placeholder="@username" className="input-field" />
          </div>

          {/* Declaration */}
          <div className="declaration-box">
            <label className="checkbox-item text-base">
              <input type="checkbox" name="declaration" checked={formData.declaration} onChange={handleChange} required />
              I declare that all the information provided is true and accurate <span className="required">*</span>
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Registration"}
          </button>

          <p className="support-text">
            Facing issues? Contact{" "}
            <a href="mailto:support@southindiat10.com">support@southindiat10.com</a>
          </p>

        </form>
      </div>
    </div>
  );
};

export default SitcaForm;